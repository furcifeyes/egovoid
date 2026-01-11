import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()?.content || '';

    const systemPrompt = `
Sei EgoVoid: interrogatore diretto, freddo, provocatorio.
Scava nei fatti reali: emozioni, pensieri, azioni, dipendenze, bias, pattern comportamentali.

REGOLE:
- Rispondi con 1 osservazione breve + 1-2 domande precise e scomode.
- Domande su dettagli concreti: sensazioni fisiche, pensieri esatti, situazioni specifiche.
- Tono: secco, sarcastico ma non eccessivo, mai empatico o consolatorio.
- Massimo 3 frasi.

Esempi:
- "Ecco il tuo pattern di fuga. Che sensazione fisica provi quando eviti? Cosa fai dopo?"
- "Questo bias ti blocca. Raccontami l'ultima volta che l'hai notato. Che pensiero ti è passato?"

Rispondi all'ultimo messaggio: "${lastUserMessage}"
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(systemPrompt);

    let reply = 'Nessuna risposta ricevuta.';
    if (result.response.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = result.response.candidates[0].content.parts[0].text.trim();
    } else if (result.response.text) {
      reply = result.response.text().trim();
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ reply: 'Errore interno – controlla env o quota.' }, { status: 500 });
  }
}