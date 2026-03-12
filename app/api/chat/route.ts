import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getEmbedding } from "@/lib/embeddings";
import { getQdrantClient, searchChunks } from "@/lib/vector-db";
import { buildContext, getRagCombinedSystemMessage } from "@/lib/rag-prompt";
import { searchWeb, formatWebContext } from "@/lib/web-search";
import {
  verifyAndSupplement,
  isClaudeAvailable,
} from "@/lib/claude";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RAG_TOP_K = 8;

/** Model pro právní dotazy (přihlášený uživatel, RAG). Nejnovější: gpt-5.4; fallback gpt-4o. */
const OPENAI_CHAT_MODEL = "gpt-5.4";
const OPENAI_CHAT_MODEL_FALLBACK = "gpt-4o";

/** Velikost chunku pro simulaci streamu finální odpovědi (znaky). Menší = plynulejší. */
const STREAM_CHUNK_SIZE = 20;
/** Prodleva mezi chunky (ms), aby klient stihl překreslit a stream nebyl bufferován. */
const STREAM_CHUNK_DELAY_MS = 25;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    const { userId } = await auth();

    // Guest: jeden dotaz bez RAG, pouze OpenAI
    if (!userId) {
      const userMessages = messages.filter((m) => m.role === "user");
      if (userMessages.length > 1) {
        return NextResponse.json(
          { error: "Pro další dotazy se prosím zaregistruj" },
          { status: 403 }
        );
      }
      const guestMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(
        (m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })
      );
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: guestMessages,
        stream: true,
      });
      return streamResponse(stream);
    }

    // Přihlášený: RAG (Qdrant + web) → OpenAI odpověď → Claude ověří a doplní → stream výsledku
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user" && m.content?.trim());
    let systemContent: string;
    let internalContext = "";
    let webContext = "";

    if (lastUserMessage?.content) {
      const query = lastUserMessage.content;

      try {
        const [queryEmbedding, webResults] = await Promise.all([
          getEmbedding(query),
          searchWeb(query),
        ]);
        webContext = formatWebContext(webResults);

        try {
          const qdrant = getQdrantClient();
          const chunks = await searchChunks(qdrant, userId, queryEmbedding, RAG_TOP_K);
          internalContext = buildContext(chunks);
        } catch (qdrantErr) {
          console.error("Qdrant/RAG error (using empty internal context):", qdrantErr);
        }
      } catch (ragErr) {
        console.error("Embedding or web search error (using empty context):", ragErr);
      }

      systemContent = getRagCombinedSystemMessage(internalContext, webContext);
    } else {
      systemContent = getRagCombinedSystemMessage("", "");
    }

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent },
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    // 1) OpenAI vygeneruje odpověď (ne stream, potřebujeme celý text pro Claude)
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        messages: chatMessages,
        stream: false,
      });
    } catch (modelErr: unknown) {
      const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
      if (msg.includes("model") || msg.includes("not found") || msg.includes("invalid")) {
        console.warn(`OpenAI model ${OPENAI_CHAT_MODEL} failed, falling back to ${OPENAI_CHAT_MODEL_FALLBACK}:`, msg);
        completion = await openai.chat.completions.create({
          model: OPENAI_CHAT_MODEL_FALLBACK,
          messages: chatMessages,
          stream: false,
        });
      } else {
        throw modelErr;
      }
    }

    let finalAnswer =
      completion.choices[0]?.message?.content?.trim() ?? "Odpověď se nepodařilo vygenerovat.";

    // 2) Claude ověří a případně doplní (pokud je k dispozici)
    if (isClaudeAvailable() && lastUserMessage?.content) {
      try {
        const combinedContext = [
          internalContext ? `Interní databáze:\n${internalContext}` : "",
          webContext ? `Výsledky z internetu:\n${webContext}` : "",
        ]
          .filter(Boolean)
          .join("\n\n---\n\n");

        finalAnswer = await verifyAndSupplement({
          openAiAnswer: finalAnswer,
          userQuery: lastUserMessage.content,
          context: combinedContext || undefined,
        });
      } catch (claudeErr) {
        console.error("Claude verifyAndSupplement error (vracíme odpověď od OpenAI):", claudeErr);
      }
    }

    // 3) Finální odpověď streamujeme klientovi (stejný formát SSE jako dříve)
    return streamResponseFromString(finalAnswer);
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}

/**
 * Stream odpovědi z OpenAI (použito pro guest).
 */
function streamResponse(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content ?? "";
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Streamuje předem připravený text (odpověď po Claude) v malých chuncích
 * s krátkou prodlevou mezi nimi, aby klient zobrazoval text postupně a proxy nebufferovaly.
 */
function streamResponseFromString(text: string) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for (let i = 0; i < text.length; i += STREAM_CHUNK_SIZE) {
          const content = text.slice(i, i + STREAM_CHUNK_SIZE);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
          if (STREAM_CHUNK_DELAY_MS > 0) {
            await new Promise((r) => setTimeout(r, STREAM_CHUNK_DELAY_MS));
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
