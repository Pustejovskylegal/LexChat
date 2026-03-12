/**
 * Vyhledávání na webu (Tavily API).
 * Pokud TAVILY_API_KEY není nastaven, vrací prázdné výsledky.
 */

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

const TAVILY_API = "https://api.tavily.com/search";
const MAX_RESULTS = 5;

export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey?.trim()) {
    return [];
  }

  try {
    const res = await fetch(TAVILY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: MAX_RESULTS,
        include_answer: false,
      }),
    });

    if (!res.ok) {
      console.error("Tavily search error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as {
      results?: { title?: string; url?: string; content?: string }[];
    };
    const results = data.results ?? [];
    return results
      .filter((r) => r.content || r.title)
      .map((r) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        content: (r.content ?? r.title ?? "").trim(),
      }))
      .filter((r) => r.content.length > 0);
  } catch (err) {
    console.error("Web search error:", err);
    return [];
  }
}

/**
 * Sestaví textový blok z výsledků vyhledávání na webu pro prompt.
 */
export function formatWebContext(results: WebSearchResult[], maxChars: number = 4000): string {
  if (results.length === 0) return "";
  const parts: string[] = [];
  let total = 0;
  for (const r of results) {
    const block = `[${r.title}](${r.url})\n${r.content}`;
    if (total + block.length > maxChars) break;
    parts.push(block);
    total += block.length;
  }
  return parts.join("\n\n---\n\n");
}
