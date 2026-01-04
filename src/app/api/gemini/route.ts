import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave mancante" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Cambiamo il riferimento al modello per evitare il 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (error: any) {
    console.error("ERRORE GEMINI:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
