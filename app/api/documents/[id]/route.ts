import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  getQdrantClient,
  deleteChunksByDocumentId,
} from "@/lib/vector-db";

const BUCKET = process.env.SUPABASE_BUCKET_DOCUMENTS ?? "documents";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id] – detail dokumentu (pouze vlastník).
 */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, chunk_count, created_at, storage_path")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Document GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] – smazat dokument (Storage + Qdrant + Supabase).
 * Izolace: smažeme pouze pokud user_id odpovídá.
 */
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: docRow, error: fetchError } = await supabase
      .from("documents")
      .select("id, storage_path, user_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !docRow) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = docRow as { id: string; storage_path: string; user_id: string };

    // 1) Smazat soubor ze Storage
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);

    // 2) Smazat chunky z Qdrant
    const qdrant = getQdrantClient();
    await deleteChunksByDocumentId(qdrant, id);

    // 3) Smazat záznam z documents
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Document delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete document record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: id });
  } catch (err) {
    console.error("Document DELETE error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
