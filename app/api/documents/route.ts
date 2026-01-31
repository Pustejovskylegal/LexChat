import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/documents – seznam dokumentů aktuálního uživatele.
 * Izolace: vždy filtr user_id = userId z Clerk.
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100
    );
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, chunk_count, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Documents list error:", error);
      return NextResponse.json(
        { error: "Failed to list documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents: data });
  } catch (err) {
    console.error("Documents GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
