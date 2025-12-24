'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: `EgoVoid ha registrato: "${input}". Messaggio memorizzato nell'archivio personale.` 
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">EgoVoid</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <img src="/banner.jpg" alt="Banner" className="h-48 w-auto" />
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Benvenuto in EgoVoid</h2>
              <p className="text-gray-400">Inizia una conversazione. L'IA ricorderà tutto.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded ${msg.role === 'user' ? 'bg-purple-600' : 'bg-gray-800'}`}>
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
          <button onClick={handleSend} disabled={isLoading} className={`px-6 py-2 rounded font-medium ${isLoading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
            {isLoading ? 'Invio...' : 'Invia'}
          </button>
        </div>
      </footer>
    </div>
  );
}
