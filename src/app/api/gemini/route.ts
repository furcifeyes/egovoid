import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave assente" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Forziamo la versione 'v1' per evitare il 404 della 'v1beta'
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    }, { apiVersion: 'v1' }); 
    
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
