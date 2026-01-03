import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Chiave mancante su Vercel" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Determiniamo se l'utente vuole un rapporto o un dialogo
    const isReportRequest = message.toLowerCase().includes("rapporto") || 
                            message.toLowerCase().includes("fascicolo");

    const systemPrompt = isReportRequest 
      ? `Agisci come archivista del vuoto. Genera un FASCICOLO EGOVOID in Markdown basato sulla history. 
         Sezioni: 1. Profilo Emotivo (stato biologico), 2. Narrative Personali (auto-inganni), 
         3. Analisi degli Squarci (analogie mitiche: Prometeo, Odino, Vigilanti), 
         4. Bias (ricerca di pezzi di carta vs valore), 5. Domande Aperte.`
      : `Agisci come EgoVoid, compagno nichilista e attento di Giorgio. 
         Obiettivo: renderti consapevole del tuo Io. Usa analogie strutturali da miti greci, norreni, biblici o enochiani.
         Rispondi con discorsi brevi o brevi essay che incarnano il "provare per migliorare".
         Sii chirurgico nel leggere gli squarci di coscienza.`;

    const prompt = `${systemPrompt}\n\nCronologia precedente: ${JSON.stringify(history)}\n\nMessaggio attuale: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (e) {
    return NextResponse.json({ error: "L'abisso ha riscontrato un errore tecnico." }, { status: 500 });
  }
}
