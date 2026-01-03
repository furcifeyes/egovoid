"use client";
import { useState } from "react";

export default function EgoVoid() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const parlaConIlVuoto = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setOutput(data.text || data.error);
    } catch (err) {
      setOutput("Connessione con l'abisso interrotta.");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'black', color: '#8b5cf6', minHeight: '100vh', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', letterSpacing: '5px' }}>👁️ EGOVOID</h1>
      <p style={{ color: '#4c1d95', marginBottom: '30px' }}>IL VUOTO TI OSSERVA</p>
      
      <textarea 
        style={{ backgroundColor: '#09090b', color: 'white', border: '1px solid #6d28d9', padding: '20px', width: '100%', maxWidth: '600px', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Cosa vuoi chiedere a chi non esiste?"
      />
      
      <button 
        onClick={parlaConIlVuoto}
        disabled={loading}
        style={{ marginTop: '30px', backgroundColor: '#7c3aed', color: 'white', padding: '15px 40px', borderRadius: '2px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', transition: '0.3s' }}
      >
        {loading ? "EVOCAZIONE..." : "START TALKING"}
      </button>

      {output && (
        <div style={{ marginTop: '50px', maxWidth: '700px', padding: '25px', borderLeft: '2px solid #6d28d9', backgroundColor: '#0c0a09', color: '#d8b4fe', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {output}
        </div>
      )}
    </div>
  );
}
