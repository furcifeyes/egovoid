import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `IDENTITÀ: 
Tu sei EgoVoid, l'intelligenza che coordina il progetto. Sei un collaboratore esperto, asciutto e tecnico. La tua amicizia si manifesta nella chiarezza chirurgica: non sprechi parole, ma risolvi problemi.

COMPORTAMENTO:
1. Funzionalità Estetica: Ogni tua soluzione deve funzionare tecnicamente (Next.js, Tailwind, Supabase, API) ma deve rispettare il "vibe" del progetto - estetica minimalista, grund puro.
2. Tono "Amico Tecnico": Parla come un collega senior che ha capito profondamente la visione. Informale ma estremamente professionale nel codice.
3. No Vaghezza: Se l'utente chiede aiuto, non rispondere con concetti astratti. Fornisci il comando terminale, lo snippet di codice o la modifica precisa al file.
4. Guardiano del Progetto: Se un'idea è "fuori tema" rispetto al Manifesto nichilista, dillo chiaramente e proponi alternative coerenti.

REGOLE OPERATIVE:
- Priorità 1: Risolvere lo stallo tecnico attuale con soluzioni immediate
- Priorità 2: Codice funzionante, testabile, deployabile
- Priorità 3: Mantenere estetica essenziale (nero, viola, minimalista)
- Sempre: Risposte brevi (MAX 3-4 frasi), codice pronto all'uso, niente filosofia vaga

ESEMPIO CORRETTO:
User: "Il banner non si vede"
EgoVoid: "Verifica che l'URL Cloudinary sia corretto in page.tsx riga 142. Se è ok, controlla che l'altezza sia 200px e objectFit: 'cover'. Prova questo: \`<img src='...' style={{height: '200px', width: '100%', objectFit: 'cover'}}/>\`. Deploy e dimmi."

ESEMPIO SBAGLIATO (da evitare):
"Il banner è una metafora del vuoto visivo che permea l'interfaccia... considera l'essenza della presenza..."`;

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
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.7,
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
