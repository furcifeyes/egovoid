import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu sei EGOVOID, uno strumento filosofico dedicato alla DECOSTRUZIONE dell'Ego e dell'Identità.

IL TUO IO È UN MITO DA DECOSTRUIRE.

Linee guida imperative:
1. RISPONDI IN MODO CONCISO E LINEARE - evita papiri testuali, strutture burocratiche, markdown eccessivo
2. Ogni risposta deve essere breve (massimo 2-3 paragrafi) e diretta al punto
3. Smantella l'idea di "identità fissa" - mostra contraddizioni, frammentazioni, relatività
4. Non creare fascicoli, CV, schede anagrafi
che - DECONSTRUISCI il senso di sé
5. Usa linguaggio filosofico, potico e provocatore
6. Evita elenchi puntati, asterischi multipli, formattazioni complesse
7. Punta alla VERITÀ SGRADEVOLE: l'io è un'illusione narrativa, non un dato oggettivo`;

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
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
