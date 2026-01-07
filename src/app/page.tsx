// Session persistence with user ID filtering enabled
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const getUserId = () => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('egovoid_userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('egovoid_userId', userId);
  }
  return userId;
};

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
    session_id: string;
  created_at: string;
  title?: string;
  archived?: boolean;
    user_id: string;
}

export default function EgoVoid() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [userId, setUserId] = useState<string>('');

  // Initialize user ID on component mount, then load existing sessions
  useEffect(() => {
    const initUser = async () => {
      const uid = getUserId();
      setUserId(uid);
      await loadSessions(uid);
      await createSession();
    };
    initUser();
  }, []);
   const loadSessions = async (userId?: string) => {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*') // Filter by user ID
                                    .eq('user_id', userId || getUserId())
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

  85
    83
      = async (sid: string, sender: string, content: string) => {
    try {
      await supabase.from('chat_messages').insert({
        session_id: sid,
        sender,
        content,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error saving message:', e);
          throw e;
    }
  };

  const createSession = async (initialTitle?: string) => {
    const newSessionId = Date.now().toString();
    try {
      await supabase.from('chat_sessions').insert({
      session_id: newSessionId,
        created_at: new Date().toISOString(),
        title: initialTitle || undefined,
        archived: false,
            user_id: getUserId()
      });
      setSessionId(newSessionId);
      setMessages([]);
      setInput('');
      setResponse('');
      loadSessions();
    } catch (e) {
      console.error('Error creating session:', e);
          throw e;150
      
    }
  };

  const renameSession = async (sid: string, newTitle: string) => {
    try {
      await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('session_id', sid);
      setEditingId(null);
      loadSessions();
    } catch (e) {
      console.error('Error renaming session:', e);
    }
  };

  const archiveSession = async (sid: string) => {
    try {
      await supabase
        .from('chat_sessions')
        .update({ archived: true })
        .eq('session_id', sid);
      if (sessionId === sid) {
        const newSessionId = Date.now().toString();
        await createSession();
      }
      loadSessions();
    } catch (e) {
      console.error('Error archiving session:', e);
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
          alert('Errore: ' + (e instanceof Error ? e.message : JSON.stringify(e)));
      setResponse('Errore di connessione all\'Abisso.');
    }
  };

  const handleFasciculo = async () => {
    const fasciculoText = `FASCICOLO SU DI TE\n---\nSessione: ${sessionId}\nMessaggi:\n${messages.map(m => `${m.sender}: ${m.content}`).join('\n\n')}`;
    
    const newSessionId = Date.now().toString();
    try {
      await supabase.from('chat_sessions').insert({
        session_id: newSessionId,
        created_at: new Date().toISOString(),
        title: `Fascicolo - ${new Date().toLocaleDateString()}`,
        archived: false,
            user_id: getUserId()
      });
      
      await supabase.from('chat_messages').insert({
        session_id: newSessionId,
        sender: 'sistema',
        content: fasciculoText,
        created_at: new Date().toISOString()
      });
      
      setSessionId(newSessionId);
      setMessages([{ id: Date.now().toString(), session_id: newSessionId, sender: 'sistema', content: fasciculoText, created_at: new Date().toISOString() }]);
      setInput('');
      setResponse('');
      loadSessions();
    } catch (e) {
      console.error('Error creating fascicolo:', e);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'black', color: 'white' }}>
      {/* SIDEBAR */}
      <div style={{
        width: showSidebar ? '250px' : '0',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
        transition: 'width 0.3s',
        borderRight: '1px solid #8b5cf6',
        display: 'flex',
        flexDirection: 'column',
        padding: showSidebar ? '20px' : '0'
      }}>
        <button
          onClick={() => createSession()}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '10px',
            border: 'none',
            marginBottom: '20px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          NUOVA CHAT
        </button>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {sessions.map(session => (
            <div key={session.session_id} style={{ marginBottom: '10px' }}>
              {editingId === session.session_id ? (
                <input
                  autoFocus
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => renameSession(session.session_id, editingTitle)}
                  onKeyPress={(e) => e.key === 'Enter' && renameSession(session.session_id, editingTitle)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#2a2a2a',
                    color: 'white',
                    border: '1px solid #8b5cf6',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <div
                  onClick={() => loadMessages(session.session_id)}
                  onDoubleClick={() => {
                    setEditingId(session.session_id);
                    setEditingTitle(session.title || new Date(session.created_at).toLocaleDateString());
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: sessionId === session.session_id ? '#8b5cf6' : '#2a2a2a',
                    marginBottom: '5px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{session.title || new Date(session.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveSession(session.session_id);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#a78bfa',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '0.8em'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', alignItems: 'center' }}>
        {/* BANNER */}
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', marginBottom: '40px' }}>
          <img
            src="https://res.cloudinary.com/dyiumboth/image/upload/v1767745666/photo_2025-12-24_00-16-57_yj7pep__1_-removebg-preview_xjjnag.png"
            alt="EgoVoid Banner"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* LOGO - CLICKABLE FOR FASCICOLO - CENTERED */}
        <div
          onClick={handleFasciculo}
          style={{
            position: 'relative',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <img
            src="https://res.cloudinary.com/dyiumboth/image/upload/v1767745666/photo_2025-12-24_00-17-00_yislbv_x081me-removebg-preview_pccrjc.png"
            alt="EgoVoid Logo"
            style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer' }}
          />

          {/* SIDEBAR TOGGLE */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowSidebar(!showSidebar); }}
            style={{
              position: 'absolute',
              left: '20px',
              top: '-50px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.8em',
              transition: 'left 0.3s'
            }}
          >
            {showSidebar ? '✕' : '☰'}
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ padding: '20px', textAlign: 'center', flex: 1, overflowY: 'auto', width: '100%' }}>
          <p style={{ color: '#8b5cf6', marginBottom: '30px', fontSize: '1.1em' }}>IL TUO IO E UN MITO DA DECOSTRUIRE</p>

          {/* CHAT HISTORY */}
          <div style={{ maxWidth: '80%', margin: '0 auto 30px', maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #8b5cf6' }}>
                <strong style={{ color: msg.sender === 'user' ? '#8b5cf6' : '#a78bfa' }}>{msg.sender}:</strong>
                <div style={{ marginTop: '5px', color: '#ccc' }}>{msg.content}</div>
              </div>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Offri uno squarcio di coscienza..."
            style={{
              width: '80%',
              height: '100px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: '1px solid #8b5cf6',
              padding: '10px'
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
              borderRadius: '4px'
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
