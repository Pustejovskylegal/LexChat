import { NextResponse } from "next/server";
import { qdrant, COLLECTION_NAME } from "../../../lib/vector-db";

export async function GET() {
try {
const collections = await qdrant.getCollections();

const exists = collections.collections.some(
(c) => c.name === COLLECTION_NAME
);

if (!exists) {
await qdrant.createCollection(COLLECTION_NAME, {
vectors: {
size: 1536,
distance: "Cosine",
},
});
}

return NextResponse.json({ status: "ok" });
} catch (err) {
console.error(err);
return NextResponse.json(
{ error: "Qdrant init failed" },
{ status: 500 }
);
}
}