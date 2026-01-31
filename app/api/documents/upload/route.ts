import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "@/lib/file-parser";
import { chunkText } from "@/lib/chunking";
import { getEmbeddings } from "@/lib/embeddings";
import {
  getQdrantClient,
  ensureCollection,
  upsertChunks,
  deleteChunksByDocumentId,
} from "@/lib/vector-db";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DocumentInsert } from "@/lib/supabase/types";

const ALLOWED_EXT = ["pdf", "docx", "txt"];
const MAX_FILE_SIZE_MB = 20;
const BUCKET = process.env.SUPABASE_BUCKET_DOCUMENTS ?? "documents";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: `Allowed types: ${ALLOWED_EXT.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Max file size: ${MAX_FILE_SIZE_MB} MB` },
        { status: 400 }
      );
    }

    const documentId = uuidv4();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const supabase = getSupabaseAdmin();

    // 1) Upload do Storage (izolace: userId/documentId/filename)
    const storagePath = `${userId}/${documentId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to store file" },
        { status: 500 }
      );
    }

    // 2) Parsování textu
    const text = await parseFile(buffer, file.name);
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "No text extracted from file" },
        { status: 400 }
      );
    }

    // 3) Chunking (500–1000 tokenů)
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks produced" },
        { status: 400 }
      );
    }

    // 4) Embeddingy (batch)
    const embeddings = await getEmbeddings(chunks.map((c) => c.text));

    // 5) Qdrant: uložit chunky s payload user_id, document_id
    const qdrant = getQdrantClient();
    await ensureCollection(qdrant);
    await upsertChunks(
      qdrant,
      documentId,
      userId,
      chunks.map((c, i) => ({
        text: c.text,
        embedding: embeddings[i],
        index: c.index,
      }))
    );

    // 6) Supabase: metadata dokumentu (vždy filtrovat podle userId při čtení)
    const row: DocumentInsert = {
      id: documentId,
      user_id: userId,
      name: file.name,
      storage_path: storagePath,
      chunk_count: chunks.length,
    };
    // Supabase generic Database typy někdy neodpovídají – insert přijímá DocumentInsert
    const { error: insertError } = await supabase.from("documents").insert(row as never);

    if (insertError) {
      console.error("Documents insert error:", insertError);
      // Rollback: smazat chunky z Qdrant a soubor ze Storage
      const q = getQdrantClient();
      await deleteChunksByDocumentId(q, documentId);
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save document metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: documentId,
      name: file.name,
      chunk_count: chunks.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
