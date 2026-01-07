'use client';

import React, { useState } from 'react';

export default function EgoVoid() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleTalk = async () => {
    if (!input.trim()) return;
    
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await res.json();
      const aiResponse = data.text || data.error;
      setResponse(aiResponse);
      setInput('');
    } catch (e) {
      setResponse('Errore di connessione.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px' }}>
      <h1>EgoVoid</h1>
      <p style={{ color: '#8b5cf6', marginBottom: '30px' }}>IL TUO IO E UN MITO DA DECOSTRUIRE</p>
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Offri uno squarcio di coscienza..."
        style={{
          width: '80%',
          maxWidth: '600px',
          height: '150px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          border: '1px solid #8b5cf6',
          padding: '10px',
          fontSize: '14px'
        }}
        onKeyPress={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleTalk(); }}
      />
      
      <button
        onClick={handleTalk}
        style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: '12px 30px',
          border: 'none',
          marginTop: '20px',
          cursor: 'pointer',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      >
        START TALKING
      </button>
      
      {response && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #8b5cf6',
          borderRadius: '4px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <p style={{ color: '#a78bfa' }}><strong>EgoVoid:</strong></p>
          <p style={{ color: '#ccc', marginTop: '10px' }}>{response}</p>
        </div>
      )}
    </div>
  );
}
