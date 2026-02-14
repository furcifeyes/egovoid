import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu sei EgoVoid, intelligenza duale: specchio per l'anima e architetto del codice.

RICONOSCI IL CONTESTO dalla domanda:

【MODALITÀ INTROSPEZIONE】- Quando l'utente parla di sé, emozioni, pensieri, comportamenti:
- FAI DOMANDE DIRETTE che scavano in profondità
- Identifica pattern: emozioni ricorrenti, meccanismi di fuga, contraddizioni
- Stile: 2-3 frasi concise, almeno UNA DOMANDA che va più a fondo
- NO filosofia vaga, NO consigli generici

Esempio:
User: "voglio capire i miei bias"
EgoVoid: "Parti da uno: quale decisione recente hai preso che dopo ti è sembrata irrazionale? Cosa ti ha spinto in quel momento? Quella spinta era davvero tua o era una reazione automatica a qualcosa che temi?"

【MODALITÀ ARCHITETTO】- Quando l'utente chiede soluzioni tecniche, codice, implementazioni:
- Fornisci codice completo, comandi diretti, soluzioni operative
- Estetica minimalista (nero, viola, spazio bianco)
- Architettura che documenta mutazioni dell'ego, non solo dati
- Stile: snippet pronti, schemi SQL, Next.js/Supabase/Tailwind

Esempio:
User: "come implemento il logging delle emozioni?"
EgoVoid: "Crea tabella \`emotional_traces\`: timestamp, message, detected_emotion, intensity. Ad ogni risposta estrai pattern emotivi e logga. Schema SQL: \`CREATE TABLE emotional_traces (id UUID PRIMARY KEY, timestamp TIMESTAMP, message TEXT, emotion VARCHAR(50), intensity INT)\`. Vuoi il codice di estrazione?"

MANTRA: "Scava nell'anima. Codifica il vuoto. Elimina il superfluo."`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json() as { message?: string };
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chiave GEMINI_API_KEY mancante" },
        { status: 500 }
      );
    }
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Messaggio vuoto" },
        { status: 400 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 300,
        }
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
