import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Model pro embeddingy (text-embedding-3-small = 1536 dims, levný a rychlý). */
const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Vygeneruje embedding pro jeden text.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // limit modelu
  });
  return res.data[0].embedding;
}

/**
 * Vygeneruje embeddingy pro více textů (batch = méně volání API).
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const batchSize = 100; // OpenAI doporučuje max 2048 vstupů, 100 textů je bezpečné
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.slice(0, 8000));
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    const sorted = res.data.sort((a, b) => a.index - b.index);
    results.push(...sorted.map((d) => d.embedding));
  }

  return results;
}
