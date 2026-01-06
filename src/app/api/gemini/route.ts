import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json() as { message?: string };
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chiave GEMINI_API_KEY mancante su Vercel" },
        { status: 500 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Messaggio vuoto o mancante" },
        { status: 400 }
      );
    }

    // URL corretto con v1beta e modello valido
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `Errore Gemini: ${response.status}` },
        { status: response.status }
      );
    }

    // Parsing robusto della risposta
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Nessuna risposta dal modello.";

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Errore interno" },
      { status: 500 }
    );
  }
}
