import { NextResponse } from "next/server";
import { isClaudeAvailable } from "@/lib/claude";

/**
 * GET /api/check-env – ověření, že jsou nastavené potřebné env proměnné.
 * Nevrací hodnoty klíčů, pouze true/false pro každou službu.
 */
export async function GET() {
  const env = {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    anthropic: isClaudeAvailable(),
    qdrant: Boolean(
      process.env.QDRANT_URL?.trim() && process.env.QDRANT_API_KEY?.trim()
    ),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    ),
    clerk: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
        process.env.CLERK_SECRET_KEY?.trim()
    ),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    tavily: Boolean(process.env.TAVILY_API_KEY?.trim()),
  };

  const allRequired = env.openai && env.qdrant && env.supabase && env.clerk;
  return NextResponse.json({
    ok: allRequired,
    services: env,
  });
}
