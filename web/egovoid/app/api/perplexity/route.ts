import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(request: NextRequest) {
  try {
    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { reply: 'API key non configurata' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || '';

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Sei Comet, un assistente IA di Perplexity. Rispondi in modo chiaro e utile.',
          },
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Nessuna risposta';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Perplexity error:', error);
    return NextResponse.json({ reply: 'Errore nel server' }, { status: 500 });
  }
}
