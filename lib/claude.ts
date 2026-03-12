import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude jako sekundární AI: ověření a doplnění odpovědi od OpenAI.
 * Prostředí pro flow: uživatel dotaz → OpenAI odpověď → Claude ověří a doplní.
 */

function getClaudeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for Claude");
  }
  return new Anthropic({ apiKey });
}

/** Výchozí model pro ověření/doplnění odpovědí (Claude Opus 4.6). */
const DEFAULT_MODEL = "claude-opus-4-6";

/**
 * Systémový prompt pro Claude: ověřit a doplnit odpověď od OpenAI.
 */
const VERIFY_AND_SUPPLEMENT_SYSTEM = `Jsi odborný právní asistent v roli revizora. Dostaneš odpověď od jiného AI (OpenAI) na dotaz uživatele. Tvůj úkol:
1. Ověř správnost a úplnost odpovědi (právní přesnost, citace, logika).
2. Doplň chybějící informace nebo upřesni pasáže, které jsou nepřesné či neúplné.
3. Zachovej strukturu a tón odpovědi; neměň správné části zbytečně.
4. Výstupem má být jediná, sjednocená odpověď pro uživatele (ne meta-komentáře typu "původní odpověď říkala...").
5. FORMÁT: VŽDY piš odpověď v Markdownu. Používej: ## pro nadpisy sekcí, 1. 2. 3. pro hlavní body, a) b) c) nebo - pro podbody, **tučně** pro důležité pojmy. Bez této struktury bude odpověď působit neprofesionálně – strukturu vždy dodržuj.
Vrať pouze finální ověřenou a doplněnou odpověď v češtině.`;

export interface VerifyAndSupplementInput {
  /** Odpověď od OpenAI. */
  openAiAnswer: string;
  /** Původní dotaz uživatele. */
  userQuery: string;
  /** Volitelný kontext (RAG), který měl OpenAI k dispozici. */
  context?: string;
}

/**
 * Pošle odpověď od OpenAI Claudeovi s instrukcemi k ověření a doplnění.
 * Vrací finální text od Claude (ověřený a doplněný).
 */
export async function verifyAndSupplement(
  input: VerifyAndSupplementInput
): Promise<string> {
  const client = getClaudeClient();

  const userContent = [
    input.context
      ? `Kontext, který měl první model k dispozici:\n${input.context}\n\n`
      : "",
    `Dotaz uživatele: ${input.userQuery}\n\n`,
    `Odpověď od OpenAI (ověř a případně doplň):\n${input.openAiAnswer}`,
  ].join("");

  const message = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: VERIFY_AND_SUPPLEMENT_SYSTEM,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return input.openAiAnswer;
  }
  return textBlock.text.trim();
}

/**
 * Kontrola, zda je Claude k dispozici (máme API klíč).
 */
export function isClaudeAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}
