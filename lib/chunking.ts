import { encode, decode } from "gpt-tokenizer";

/** Cílová velikost chunku v tokenech (500–1000). */
const DEFAULT_CHUNK_SIZE = 800;
/** Překryv mezi chunky (zachytí kontext na hranicích). */
const DEFAULT_OVERLAP_TOKENS = 100;

export interface TextChunk {
  text: string;
  tokenCount: number;
  index: number;
}

/**
 * Rozdělí text na chunky o cca 500–1000 tokenech (cl100k_base).
 * Překryv zlepšuje kvalitu RAG na hranicích vět.
 */
export function chunkText(
  text: string,
  options: {
    chunkSizeTokens?: number;
    overlapTokens?: number;
  } = {}
): TextChunk[] {
  const chunkSize = options.chunkSizeTokens ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;

  const tokens = encode(text);
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < tokens.length) {
    let end = Math.min(start + chunkSize, tokens.length);
    const chunkTokens = tokens.slice(start, end);
    const chunkText = decodeTokens(chunkTokens);

    chunks.push({
      text: chunkText.trim(),
      tokenCount: chunkTokens.length,
      index,
    });

    index += 1;
    start = end - overlap;
    if (start >= tokens.length) break;
  }

  return chunks;
}

function decodeTokens(tokens: number[]): string {
  return decode(tokens);
}
