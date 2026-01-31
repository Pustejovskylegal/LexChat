/**
 * Sestavení systémového promptu pro RAG.
 * Kontext z vektorové DB je vložen mezi značky.
 */

const CONTEXT_PLACEHOLDER = "{{CONTEXT}}";
const QUERY_PLACEHOLDER = "{{QUERY}}";

/** Ukázkový systémový prompt pro RAG (právní asistent). */
export const RAG_SYSTEM_PROMPT = `Jsi odborný právní asistent. Odpovídej na základě výhradně níže uvedeného kontextu z nahraných dokumentů. Pokud odpověď v kontextu není, řekni to a nepředstírej informace.

Kontext z dokumentů:
${CONTEXT_PLACEHOLDER}

Pravidla:
- Odpovídej stručně a věcně.
- Cituj konkrétní pasáže z kontextu, pokud je to vhodné.
- Nepoužívej informace mimo poskytnutý kontext.`;

/**
 * Sestaví kontext z výsledků similarity search (deduplikace a limit délky).
 */
export function buildContext(
  chunks: { text: string; score: number; document_id: string }[],
  maxTokens: number = 3000
): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  // Přibližně 4 znaky na token
  const maxChars = maxTokens * 4;

  let totalChars = 0;
  for (const chunk of chunks) {
    const key = chunk.document_id + ":" + chunk.text.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    if (totalChars + chunk.text.length > maxChars) break;
    parts.push(chunk.text.trim());
    totalChars += chunk.text.length;
  }

  return parts.join("\n\n---\n\n");
}

/**
 * Vrátí finální systémovou zprávu s kontextem a instrukcemi.
 */
export function getRagSystemMessage(context: string): string {
  return RAG_SYSTEM_PROMPT.replace(CONTEXT_PLACEHOLDER, context || "(Žádný relevantní kontext nenalezen.)");
}
