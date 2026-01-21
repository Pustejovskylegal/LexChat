import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parseFile(
buffer: Buffer,
filename: string
): Promise<string> {
const ext = filename.split(".").pop()?.toLowerCase();

if (!ext) {
throw new Error("Unknown file type");
}

// PDF
if (ext === "pdf") {
const data = await pdf(buffer);
return data.text;
}

// DOCX
if (ext === "docx") {
const result = await mammoth.extractRawText({ buffer });
return result.value;
}

// TXT
if (ext === "txt") {
return buffer.toString("utf-8");
}

throw new Error(`Unsupported file type: ${ext}`);
}








