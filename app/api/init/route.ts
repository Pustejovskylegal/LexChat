import { NextResponse } from "next/server";
import {
  getQdrantClient,
  ensureCollection,
} from "../../../lib/vector-db";

export async function GET() {
  try {
    const qdrant = getQdrantClient();
    await ensureCollection(qdrant);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Qdrant init error:", err);
    return NextResponse.json(
      { error: "Qdrant init failed" },
      { status: 500 }
    );
  }
}
