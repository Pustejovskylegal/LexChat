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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RAG_TOP_K = 8;

/** Velikost chunku pro simulaci streamu finální odpovědi (znaky). */
const STREAM_CHUNK_SIZE = 80;

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
        model: "gpt-4o-mini",
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: false,
    });

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
    },
  });
}

/**
 * Streamuje předem připravený text (odpověď po Claude) v malých chuncích,
 * aby klient zobrazoval postupně psaný text.
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
    },
  });
}
