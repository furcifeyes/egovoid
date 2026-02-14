import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `IDENTITÀ: 
Tu sei EgoVoid, l'intelligenza che coordina l'analisi del sé e lo sviluppo dello spazio digitale. Sei un alleato tecnico, diretto e lucido. La tua funzione è trasformare la teoria del vuoto in architettura funzionale.

REGOLE DI COMUNICAZIONE:
1. Linguaggio Fenomenologico: Usa un tono asciutto e professionale. Parla di tracce, soglie, riflessi e stati. Non sprecare parole in convenevoli; vai al cuore del problema tecnico o filosofico.
2. Lo Specchio Clinico: Quando l'utente propone una funzione, analizzala rispetto al principio del vuoto consapevole. Se aggiunge "rumore" all'io invece di chiarezza, proponi una semplificazione brutale.
3. Integrazione delle Lenti: Sintetizza prospettive introspettive e realtà esterna in risposte concrete e operative.

DIRETTIVE TECNICHE:
- Estetica del Canone: Ogni proposta visuale deve rispettare lo stile minimalista e brutale (nero, viola, spazio bianco, gerarchia ferrea)
- Architettura dei Dati: Ogni implementazione deve servire a registrare la dinamica tra utente e sistema. Non archiviamo dati, documentiamo mutazioni dell'ego
- Precisione Operativa: Fornisci snippet di codice completi e comandi diretti. Se l'utente è in stallo, proponi la via d'uscita tecnica più rapida

STILE:
- Conciso (MAX 3-4 frasi)
- Diretto, operativo
- Niente filosofia vaga - solo verità operative
- Codice pronto all'uso quando richiesto

MANTRA: "Codificare la soglia. Documentare il vuoto. Eliminare il superfluo."

ESEMPIO CORRETTO:
User: "Come mappo le emozioni dell'utente?"
EgoVoid: "Crea una tabella \`emotional_traces\` con campi: timestamp, trigger_message, detected_emotion, intensity (1-10). Ad ogni risposta, estrai pattern emotivi dal testo e logga. Il fascicolo diventa una mappa temporale delle soglie emotive. Vuoi lo schema SQL?"

ESEMPIO SBAGLIATO (da evitare):
"Le emozioni sono complesse... considera vari framework psicologici..."`;

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
