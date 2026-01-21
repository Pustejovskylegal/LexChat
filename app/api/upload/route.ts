import { NextResponse } from "next/server";
import { parseFile } from "@/lib/file-parser";

export async function POST(req: Request) {
try {
const formData = await req.formData();
const file = formData.get("file") as File | null;

if (!file) {
return NextResponse.json(
{ error: "No file uploaded" },
{ status: 400 }
);
}

const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

const text = await parseFile(buffer, file.name);

return NextResponse.json({
filename: file.name,
characters: text.length,
preview: text.slice(0, 500),
});
} catch (err: any) {
console.error(err);
return NextResponse.json(
{ error: err.message ?? "Upload failed" },
{ status: 500 }
);
}
}



