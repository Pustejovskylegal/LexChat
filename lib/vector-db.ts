import { QdrantClient } from "@qdrant/js-client-rest";

export const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION_NAME ?? "lexchat_documents";

/** Rozměr vektoru pro text-embedding-3-small. */
export const VECTOR_SIZE = 1536;

export function getQdrantClient() {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY are required");
  }

  return new QdrantClient({ url, apiKey });
}

export interface ChunkPayload {
  user_id: string;
  document_id: string;
  chunk_index: number;
  text: string;
}

/**
 * Vytvoří kolekci, pokud neexistuje (volat z init nebo před prvním upsertem).
 */
export async function ensureCollection(client: QdrantClient) {
  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
  }
  // TODO: Pro tisíce dokumentů vytvořit payload index: client.createPayloadIndex(COLLECTION_NAME, { field_name: "user_id", field_schema: { type: "keyword" } });
}

/**
 * Uloží chunky s embeddingy. Payload obsahuje user_id a document_id pro striktní izolaci.
 */
export async function upsertChunks(
  client: QdrantClient,
  documentId: string,
  userId: string,
  chunks: { text: string; embedding: number[]; index: number }[]
) {
  const points = chunks.map((chunk) => ({
    id: `${documentId}_${chunk.index}`,
    vector: chunk.embedding,
    payload: {
      user_id: userId,
      document_id: documentId,
      chunk_index: chunk.index,
      text: chunk.text,
    } satisfies ChunkPayload,
  }));

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });
}

/**
 * Similarity search pouze v dokumentech daného uživatele.
 */
export async function searchChunks(
  client: QdrantClient,
  userId: string,
  queryVector: number[],
  limit: number = 8
): Promise<{ text: string; score: number; document_id: string }[]> {
  const results = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    filter: {
      must: [{ key: "user_id", match: { value: userId } }],
    },
    with_payload: true,
    with_vector: false,
  });

  return results.map((r) => ({
    text: (r.payload?.text as string) ?? "",
    score: r.score ?? 0,
    document_id: (r.payload?.document_id as string) ?? "",
  }));
}

/**
 * Smaže všechny body dokumentu (před smazáním dokumentu z DB).
 */
export async function deleteChunksByDocumentId(
  client: QdrantClient,
  documentId: string
) {
  await client.delete(COLLECTION_NAME, {
    wait: true,
    filter: {
      must: [{ key: "document_id", match: { value: documentId } }],
    },
  });
}
