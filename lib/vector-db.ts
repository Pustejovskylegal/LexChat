import { QdrantClient } from "@qdrant/js-client-rest";

export const COLLECTION_NAME = "lexchat";

export function getQdrantClient() {
const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url || !apiKey) {
throw new Error("Qdrant env variables are missing");
}

return new QdrantClient({
url,
apiKey,
});
}