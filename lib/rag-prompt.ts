/**
 * Sestavení systémového promptu pro RAG.
 * Kontext z vektorové DB a z webu, model vybírá nejvhodnější zdroj.
 */

const INTERNAL_CONTEXT_PLACEHOLDER = "{{INTERNAL_CONTEXT}}";
const WEB_CONTEXT_PLACEHOLDER = "{{WEB_CONTEXT}}";

/** Kombinovaný RAG prompt: interní databáze (Qdrant/dokumenty) + výsledky z internetu. */
export const RAG_COMBINED_SYSTEM_PROMPT = `Jsi odborný právní asistent. Pro odpověď máš k dispozici dva zdroje:

1) INTERNÍ DATABÁZE (judikatura, odborná literatura, nahrané dokumenty):
{{INTERNAL_CONTEXT}}

2) VÝSLEDKY Z INTERNETU:
{{WEB_CONTEXT}}

Pravidla:
- Vyhodnoť spolehlivost a relevance obou zdrojů. Pro právní odpovědi upřednostňuj interní databázi, pokud obsahuje věrohodnou a k dotazu relevantní informaci.
- Pokud je odpověď z interní databáze přesná a dostačující, použij ji a uveď zdroj.
- Pokud interní databáze neobsahuje odpověď nebo je webový zdroj vhodnější (např. aktuální změna zákona), použij informace z internetu a uveď odkaz.
- Odpovídej stručně a věcně. Cituj konkrétní pasáže a vždy uveď, zda vycházíš z interní databáze nebo z webu.
- Nepředstírej informace; pokud odpověď v kontextech není, řekni to.`;

/** Původní prompt pouze s interním kontextem (pro zpětnou kompatibilitu). */
export const RAG_SYSTEM_PROMPT = `Jsi odborný právní asistent. Odpovídej na základě výhradně níže uvedeného kontextu z nahraných dokumentů. Pokud odpověď v kontextu není, řekni to a nepředstírej informace.

Kontext z dokumentů:
{{CONTEXT}}

Pravidla:
- Odpovídej stručně a věcně.
- Cituj konkrétní pasáže z kontextu, pokud je to vhodné.
- Nepoužívej informace mimo poskytnutý kontext.`;

/**
 * Sestaví kontext z výsledků similarity search (deduplikace a limit délky).
 */
export function buildContext(
  chunks: { text: string; score: number; document_id: string }[],
  maxTokens: number = 2500
): string {
  const seen = new Set<string>();
  const parts: string[] = [];
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
 * Vrátí systémovou zprávu s kombinovaným kontextem (interní DB + web).
 */
export function getRagCombinedSystemMessage(
  internalContext: string,
  webContext: string
): string {
  return RAG_COMBINED_SYSTEM_PROMPT.replace(
    INTERNAL_CONTEXT_PLACEHOLDER,
    internalContext.trim() || "(Žádný relevantní záznam v interní databázi.)"
  ).replace(
    WEB_CONTEXT_PLACEHOLDER,
    webContext.trim() || "(Žádné výsledky z internetu.)"
  );
}

/**
 * Vrátí finální systémovou zprávu pouze s interním kontextem (legacy).
 */
export function getRagSystemMessage(context: string): string {
  return RAG_SYSTEM_PROMPT.replace("{{CONTEXT}}", context || "(Žádný relevantní kontext nenalezen.)");
}
