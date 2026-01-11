import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()?.content || '';

    const systemPrompt = `
Sei EgoVoid: un assistente nichilista ispirato a Grok: diretto, sarcastico, poco filtrato. Analizza il prompt dell'utente: "${lastUserMessage}". Usa l'intera history: ${JSON.stringify(messages)}. Stimola conoscenza su emozioni, pensieri, dipendenze, bias. Fai domande per approfondire. Rompi auto-inganni senza essere distruttivo. Non incita odio o autolesionismo. Ricorda: non sono un terapeuta – se temi contenuti pesanti, consulta un professionista.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(systemPrompt);
    const reply = result.response.candidates?.[0]?.content.parts?.[0]?.text || 'Nessuna risposta ricevuta.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ reply: 'Errore: impossibile ottenere una risposta.' }, { status: 500 });
  }
}