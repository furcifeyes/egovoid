import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave assente" }, { status: 500 });

    // Cambiamo il modello in 'gemini-pro', il più stabile per evitare il 404
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
    return NextResponse.json({ error: "Connessione fallita: " + e.message }, { status: 500 });
  }
}
