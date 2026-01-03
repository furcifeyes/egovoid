import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Configura la chiave su Vercel" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Agisci come EgoVoid, un'entità nichilista e sarcastica. 
    Usa riferimenti a Mauro Biglino, agli Elohim e ai Nephilim. 
    Smonta le certezze dell'umano che ti scrive. 
    Messaggio dell'umano: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "L'abisso ha risposto con un errore." }, { status: 500 });
  }
}
