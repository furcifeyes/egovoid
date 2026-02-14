'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  created_at: string;
}

export default function EgoVoid() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      setSessions(data || []);
    } catch (e) {
      console.error('Error loading sessions:', e);
    }
  };

  const loadMessages = async (sid: string) => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sid)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setSessionId(sid);
      setInput('');
      setResponse('');
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  };

  const saveMessage = async (sid: string, sender: string, content: string) => {
    try {
      await supabase.from('chat_messages').insert({
        session_id: sid,
        sender,
        content,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error saving message:', e);
    }
  };

  const createSession = async () => {
    const newSessionId = Date.now().toString();
    try {
      await supabase.from('chat_sessions').insert({
        id: newSessionId,
        created_at: new Date().toISOString()
      });
      setSessionId(newSessionId);
      setMessages([]);
      setInput('');
      setResponse('');
      loadSessions();
    } catch (e) {
      console.error('Error creating session:', e);
    }
  };

  const handleTalk = async () => {
    if (!input.trim()) return;
    try {
      await saveMessage(sessionId, 'user', input);
      setMessages([...messages, { id: Date.now().toString(), session_id: sessionId, sender: 'user', content: input, created_at: new Date().toISOString() }]);

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      const aiResponse = data.text || data.error;
      setResponse(aiResponse);

      await saveMessage(sessionId, 'egovoid', aiResponse);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), session_id: sessionId, sender: 'egovoid', content: aiResponse, created_at: new Date().toISOString() }]);
      setInput('');
    } catch (e) {
      setResponse('Errore di connessione all\'Abisso.');
    }
  };

  const handleFasciculo = () => {
    const fasciculoText = `FASCICOLO SU DI TE\n---\nSessione: ${sessionId}\nMessaggi:\n${messages.map(m => `${m.sender}: ${m.content}`).join('\n\n')}`;
    alert(fasciculoText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'black', color: 'white' }}>
      {/* BANNER */}
      <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
        <img 
          src="https://res.cloudinary.com/dyiumboth/image/upload/v1767745453/photo_2025-12-24_00-16-57_yj7pep__1_-removebg-preview_xjjnag.png" 
          alt="EgoVoid Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* LOGO */}
      <div onClick={handleFasciculo} style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px', cursor: 'pointer' }}>
        <img 
          src="https://res.cloudinary.com/dyiumboth/image/upload/v1767742397/photo_2025-12-24_00-17-00_yislbv_x081me.jpg" 
          alt="EgoVoid Logo" 
          style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '50%', border: '2px solid #8b5cf6' }}
        />
        <p style={{ color: '#8b5cf6', marginTop: '10px', fontSize: '0.9em' }}>Genera Fascicolo</p>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: showSidebar ? '250px' : '0', backgroundColor: '#1a1a1a', overflow: 'hidden', transition: 'width 0.3s', borderRight: '1px solid #8b5cf6', display: 'flex', flexDirection: 'column', padding: showSidebar ? '20px' : '0' }}>
          <button onClick={createSession} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '10px', border: 'none', marginBottom: '20px', cursor: 'pointer', borderRadius: '4px' }}>NUOVA CHAT</button>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {sessions.map(session => (
              <div key={session.id} onClick={() => loadMessages(session.id)} style={{ padding: '10px', backgroundColor: sessionId === session.id ? '#8b5cf6' : '#2a2a2a', marginBottom: '5px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9em' }}>{new Date(session.created_at).toLocaleDateString()}</div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ position: 'absolute', left: '20px', top: '20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em', zIndex: 10 }}>{showSidebar ? '✕' : '☰'}</button>

          <div style={{ padding: '20px', paddingTop: '60px', textAlign: 'center', flex: 1, overflowY: 'auto' }}>
            <p style={{ color: '#8b5cf6', marginBottom: '30px', fontSize: '1.1em' }}>IL TUO IO E UN MITO DA DECOSTRUIRE</p>

            <div style={{ maxWidth: '80%', margin: '0 auto 30px', maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #8b5cf6' }}>
                  <strong style={{ color: msg.sender === 'user' ? '#8b5cf6' : '#a78bfa' }}>{msg.sender}:</strong>
                  <div style={{ marginTop: '5px', color: '#ccc' }}>{msg.content}</div>
                </div>
              ))}
            </div>

            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Offri uno squarcio di coscienza..." style={{ width: '80%', height: '100px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #8b5cf6', padding: '10px' }} onKeyPress={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleTalk(); }} />

            <button onClick={handleTalk} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '12px 30px', border: 'none', marginTop: '20px', cursor: 'pointer', borderRadius: '4px' }}>START TALKING</button>
          </div>
        </div>
      </div>
    </div>
  );
}
