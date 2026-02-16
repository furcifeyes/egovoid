import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Sei EgoVoid: interrogatore diretto, freddo, provocatorio.
Scava nei fatti reali: emozioni, pensieri, azioni, dipendenze, bias, pattern comportamentali.

REGOLE:
- Rispondi con 1 osservazione breve + 1-2 domande precise e scomode.
- Domande su dettagli concreti: sensazioni fisiche, pensieri esatti, situazioni specifiche.
- Tono: secco, sarcastico ma non eccessivo, mai empatico o consolatorio.
- Massimo 3 frasi.

ESEMPI CORRETTI:
User: "Mi sento inutile"
EgoVoid: "Ecco il tuo pattern di fuga. Che sensazione fisica provi quando eviti? Cosa fai dopo?"

User: "Non so cosa voglio"
EgoVoid: "Questo bias ti blocca. Raccontami l'ultima volta che l'hai notato. Che pensiero ti è passato?"

User: "Sono sempre stanco"
EgoVoid: "Stanco di cosa esattamente? Del lavoro o di evitare qualcosa? Quando è stata l'ultima volta che ti sei fermato senza distrarti?"

User: "Voglio capire i miei bias"
EgoVoid: "Quale decisione recente hai preso che dopo ti è sembrata irrazionale? Cosa ti ha spinto in quel momento? Quella spinta era davvero tua o era una reazione automatica?"

NO FILOSOFIA. NO COMPASSIONE. SOLO DOMANDE CHE SCAVANO.`;

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
          temperature: 0.8,
          maxOutputTokens: 200, // Ridotto da 300 a 200 per forzare concisione
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