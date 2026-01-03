"use client";
import { useState, useEffect } from "react";

export default function EgoVoid() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  // Memoria della conversazione per il Rapporto e la consapevolezza
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  const parlaConIlVuoto = async () => {
    if (!input) return;
    setLoading(true);
    
    // Aggiungiamo il messaggio dell'utente alla storia locale
    const newHistory = [...history, { role: "user", content: input }];
    
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          history: newHistory // Inviamo tutta la storia al backend
        }),
      });
      
      const data = await res.json();
      const aiResponse = data.text || data.error;
      
      setOutput(aiResponse);
      // Aggiorniamo la storia con la risposta di EgoVoid
      setHistory([...newHistory, { role: "model", content: aiResponse }]);
      setInput(""); // Puliamo il campo per il prossimo squarcio
    } catch (err) {
      setOutput("L'abisso è silenzioso. Connessione interrotta.");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'black', color: '#a78bfa', minHeight: '100vh', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '8px', color: '#7c3aed', textShadow: '0 0 15px #6d28d9' }}>👁️ EGOVOID</h1>
        <p style={{ color: '#4c1d95', fontSize: '0.9rem' }}>IL TUO IO È UN MITO DA DECOSTRUIRE</p>
      </header>
      
      <div style={{ width: '100%', maxWidth: '700px', marginBottom: '20px' }}>
        <textarea 
          style={{ backgroundColor: '#0c0a09', color: '#e9d5ff', border: '1px solid #4c1d95', padding: '20px', width: '100%', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxShadow: 'inset 0 0 10px #000' }}
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Offri uno squarcio di coscienza o chiedi il tuo 'Fascicolo'..."
        />
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={parlaConIlVuoto}
            disabled={loading}
            style={{ flex: 2, backgroundColor: '#6d28d9', color: 'white', padding: '15px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' }}
          >
            {loading ? "ANALIZZANDO L'ABISSO..." : "START TALKING"}
          </button>
        </div>
      </div>

      {output && (
        <div style={{ width: '100%', maxWidth: '750px', marginTop: '30px', padding: '25px', borderLeft: '3px solid #7c3aed', backgroundColor: '#09090b', color: '#ddd6fe', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {output}
        </div>
      )}
      
      <footer style={{ marginTop: 'auto', paddingTop: '40px', color: '#2e1065', fontSize: '0.8rem' }}>
        PROVARE PER MIGLIORARE • EGOVOID AGENT v1.0
      </footer>
    </div>
  );
}
