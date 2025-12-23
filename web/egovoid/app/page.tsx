'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectAPI = (userMessage: string): 'gemini' | 'perplexity' => {
    const searchKeywords = ['cosa', 'quando', 'dove', 'come', 'chi', 'ultime', 'notizie', 'ricerca', 'informazione', 'fonte'];
    const hasSearchKeyword = searchKeywords.some(kw => userMessage.toLowerCase().includes(kw));
    return hasSearchKeyword ? 'perplexity' : 'gemini';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const selectedAPI = selectAPI(input);
      const endpoint = selectedAPI === 'gemini' ? '/api/gemini' : '/api/perplexity';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.reply || 'Nessuna risposta ricevuta.' 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Errore:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: 'Errore: Impossibile ricevere una risposta.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">EgoVoid</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Benvenuto in EgoVoid</h2>
              <p className="text-gray-400">Inizia una conversazione. L'IA ricorderà tutto e farà ricerche quando serve.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 p-4 bg-gray-950">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Scrivi qualcosa..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-purple-600 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`px-6 py-2 rounded font-medium ${
              isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isLoading ? 'Invio...' : 'Invia'}
          </button>
        </div>
      </footer>
    </div>
  );
}
