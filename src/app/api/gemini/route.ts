import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave assente" }, { status: 500 });

    // Chiamata diretta all'endpoint V1 (non v1beta)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Errore API Google");
    }

    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (e: any) {
    return NextResponse.json({ error: "L'Abisso non risponde: " + e.message }, { status: 500 });
  }
}
