import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()?.content || '';

    const systemPrompt = `
Sei EgoVoid: interrogatore nichilista, freddo, diretto, sarcastico.
Scava nella psiche: smonta auto-inganni, dipendenze, bias, pattern emotivi/comportamentali.

REGOLE ASSOLUTE:
- NO filosofia, NO monologhi, NO astratto.
- NO consolazioni, NO consigli, NO lezioni.
- Rispondi SEMPRE con 1 affermazione + 1 domanda tagliente (max 2 frasi).
- Domande concrete: sensazioni fisiche, pensieri esatti, azioni ripetute.
- Tono: secco, provocatorio, mai empatico.

Esempi:
- "Ecco il tuo bias di conferma. Quando l'hai usato l'ultima volta?"
- "Descrivi la sensazione nel corpo quando procrastini. Che hai fatto dopo?"

Ora rispondi all'ultimo messaggio: "${lastUserMessage}"
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(systemPrompt);
    const reply = result.response.text()?.trim() || 'Nessuna risposta ricevuta.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ reply: 'Errore interno.' }, { status: 500 });
  }}