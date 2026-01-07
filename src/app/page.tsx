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
      <div style={{ width: '100%', height: '160px', overflow: 'hidden', marginBottom: '40px' }}>
        <img 
          src="https://res.cloudinary.com/dyiumboth/image/upload/v1767742397/photo_2025-12-24_00-16-57_yj7pep_nk1abg.jpg" 
          alt="EgoVoid Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
       {/* LOGO */}
 <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
 <img 
 src="https://res.cloudinary.com/dyiumboth/image/upload/v1767742397/photo_2025-12-24_00-17-00_yislbv_x081me.jpg" 
 alt="EgoVoid Logo" 
 style={{ width: '80px', height: '80px', objectFit: 'contain' }}
 />
 </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#8b5cf6', marginBottom: '30px', fontSize: '1.1em' }}>IL TUO IO È UN MITO DA DECOSTRUIRE</p>
        
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
