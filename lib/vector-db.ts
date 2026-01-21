import { QdrantClient } from "@qdrant/js-client-rest";

if (!process.env.QDRANT_URL) {
throw new Error("QDRANT_URL is missing");
}

if (!process.env.QDRANT_API_KEY) {
throw new Error("QDRANT_API_KEY is missing");
}

export const qdrant = new QdrantClient({
url: process.env.QDRANT_URL,
apiKey: process.env.QDRANT_API_KEY,
checkCompatibility: false,
});

export const COLLECTION_NAME = "documents";