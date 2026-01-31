import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getEmbedding } from "@/lib/embeddings";
import { getQdrantClient, searchChunks } from "@/lib/vector-db";
import {
  buildContext,
  getRagSystemMessage,
} from "@/lib/rag-prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** RAG: počet chunků pro kontext. */
const RAG_TOP_K = 8;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, useRag = true } = body as {
      messages: { role: string; content: string }[];
      useRag?: boolean;
    };

    const { userId } = await auth();

    // Guest: nepřihlášený uživatel – jeden dotaz bez RAG
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

    // Přihlášený uživatel: RAG (similarity search pouze v jeho dokumentech)
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user" && m.content?.trim());
    let systemContent: string | undefined;

    if (useRag && lastUserMessage?.content) {
      const query = lastUserMessage.content;
      const queryEmbedding = await getEmbedding(query);
      const qdrant = getQdrantClient();
      const chunks = await searchChunks(
        qdrant,
        userId,
        queryEmbedding,
        RAG_TOP_K
      );
      const context = buildContext(chunks);
      systemContent = getRagSystemMessage(context);
    }

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...(systemContent
        ? [{ role: "system" as const, content: systemContent }]
        : []),
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true,
    });

    return streamResponse(stream);
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}

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
