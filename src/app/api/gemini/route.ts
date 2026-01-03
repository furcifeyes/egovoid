import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Manca la chiave su Vercel" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Agisci come EgoVoid, AI nichilista. Usa riferimenti a Biglino e Nephilim. Rispondi a: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ text: response.text() });
  } catch (e) {
    return NextResponse.json({ error: "Errore nell'abisso" }, { status: 500 });
  }
}
