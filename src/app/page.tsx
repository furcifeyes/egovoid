"use client";
import React, { useState } from 'react';

export default function EgoVoid() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleTalk = async () => {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setResponse(data.text || data.error);
    } catch (e) {
      setResponse("Errore di connessione all'Abisso.");
    }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '0', margin: '0' }}>
      {/* BANNER */}
      <div style={{ width: '100%', height: '200px', overflow: 'hidden', marginBottom: '20px' }}>
        <img 
          src="https://raw.githubusercontent.com/furcifeyes/egovoid/refs/heads/main/photo_2025-12-24_00-17-00.jpg" 
          alt="EgoVoid Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* LOGO E TITOLO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <img 
            src="https://raw.githubusercontent.com/furcifeyes/egovoid/refs/heads/main/photo_2025-12-24_00-16-57.jpg" 
            alt="EgoVoid Logo" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
          <h1 style={{ margin: '0', fontSize: '3em' }}>EGOVOID</h1>
        </div>

        <p style={{ color: '#8b5cf6', marginBottom: '30px' }}>IL TUO IO È UN MITO DA DECOSTRUIRE</p>
        
        <textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Offri uno squarcio di coscienza..."
          style={{ width: '80%', height: '150px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #8b5cf6', padding: '10px' }}
        />
        
        <br />
        
        <button 
          onClick={handleTalk}
          style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '15px 30px', border: 'none', marginTop: '20px', cursor: 'pointer' }}
        >
          START TALKING
        </button>
        
        {response && (
          <div style={{ marginTop: '30px', padding: '20px', borderLeft: '4px solid #8b5cf6', textAlign: 'left', maxWidth: '80%', margin: '30px auto' }}>
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
