import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave assente" }, { status: 500 });

    // Endpoint ultra-specifico per evitare il 404 su V1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Errore Google" }, { status: response.status });
    }

    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (e: any) {
    return NextResponse.json({ error: "L'Abisso è ancora chiuso: " + e.message }, { status: 500 });
  }
}
