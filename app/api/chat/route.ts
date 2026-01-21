import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
try {
const { messages } = await req.json();

const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages,
});

return NextResponse.json({
message: completion.choices[0].message,
});
} catch (err) {
console.error(err);
return NextResponse.json(
{ error: "Chat failed" },
{ status: 500 }
);
}
}