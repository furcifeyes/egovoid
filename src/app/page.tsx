'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  content: string;
  route_used: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  created_at: string;
  last_active: string;
  user_id?: string;
  title?: string;
}

interface SavedReport {
  id: string;
  user_id: string;
  type: string;
  content: string;
  messages_analyzed: number;
  created_at: string;
}

export default function EgoVoid() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [fascicolo, setFascicolo] = useState<string>('');
  const [showFascicolo, setShowFascicolo] = useState(false);
  const [generatingFascicolo, setGeneratingFascicolo] = useState(false);
  const [showFascicoloMenu, setShowFascicoloMenu] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthInitialized(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;
    const savedSessionId = localStorage.getItem('egovoid_current_session');
    if (savedSessionId) {
      supabase.from('sessions').select('id').eq('id', savedSessionId).single()
        .then(({ data, error }) => {
          if (data && !error) { setSessionId(savedSessionId); loadMessages(savedSessionId); }
          else { localStorage.removeItem('egovoid_current_session'); setSessionId(''); }
        });
    }
    loadSessions();
  }, [authInitialized, user]);

  const createSessionIfNeeded = async (): Promise<string> => {
    if (sessionId) return sessionId;
    try {
      const userId = user?.id || null;
      const { data, error } = await supabase.from('sessions').insert({ user_id: userId }).select().single();
      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        localStorage.setItem('egovoid_current_session', data.id);
        loadSessions();
        return data.id;
      }
    } catch (e) { console.error('Error creating session:', e); }
    const fallbackId = `temp_${Date.now()}`;
    setSessionId(fallbackId);
    localStorage.setItem('egovoid_current_session', fallbackId);
    return fallbackId;
  };

  const loadSessions = async () => {
    try {
      let query = supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(20);
      if (user) { query = query.eq('user_id', user.id); }
      else { query = query.is('user_id', null); }
      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (e) { console.error('Error loading sessions:', e); }
  };

  const loadMessages = async (sid: string) => {
    try {
      const { data, error } = await supabase.from('messages').select('*').eq('session_id', sid).order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      setSessionId(sid);
      setInput('');
      setResponse('');
      localStorage.setItem('egovoid_current_session', sid);
      await supabase.from('sessions').update({ last_active: new Date().toISOString() }).eq('id', sid);
    } catch (e) { console.error('Error loading messages:', e); }
  };

  const saveMessage = async (sid: string, sender: string, content: string, route: string = 'groq') => {
    try {
      const userId = user?.id || null;
      const { error } = await supabase.from('messages').insert({ session_id: sid, sender, content, route_used: route, user_id: userId });
      if (error) throw error;
    } catch (e) { console.error('Error saving message:', e); }
  };

  const createSession = async () => {
    try {
      const userId = user?.id || null;
      const { data, error } = await supabase.from('sessions').insert({ user_id: userId }).select().single();
      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        setMessages([]);
        setInput('');
        setResponse('');
        localStorage.setItem('egovoid_current_session', data.id);
        loadSessions();
      }
    } catch (e) { console.error('Error creating session:', e); }
  };

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Eliminare questa sessione?')) return;
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', sid);
      if (error) throw error;
      if (sid === sessionId) { localStorage.removeItem('egovoid_current_session'); setSessionId(''); setMessages([]); }
      loadSessions();
    } catch (err) { console.error('Error deleting session:', err); }
  };

  const resetAll = async () => {
    if (!confirm('DISSOLVI TUTTO? Tutte le sessioni e messaggi saranno eliminati permanentemente.')) return;
    try {
      let query = supabase.from('sessions').delete();
      if (user) { query = query.eq('user_id', user.id); }
      else { query = query.is('user_id', null); }
      const { error } = await query;
      if (error) throw error;
      localStorage.removeItem('egovoid_current_session');
      setMessages([]); setSessions([]); setSessionId('');
      alert('Abisso ripristinato.');
    } catch (err) { console.error('Error resetting all:', err); }
  };

  const startRename = (sid: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sid);
    setEditingTitle(currentTitle || '');
  };

  const saveRename = async (sid: string) => {
    if (!editingTitle.trim()) { setEditingSessionId(null); return; }
    try {
      const { error } = await supabase.from('sessions').update({ title: editingTitle.trim() }).eq('id', sid);
      if (error) throw error;
      loadSessions();
      setEditingSessionId(null);
      setEditingTitle('');
    } catch (err) { console.error('Error renaming session:', err); }
  };

  const cancelRename = () => { setEditingSessionId(null); setEditingTitle(''); };

  const loadSavedReports = async () => {
    setLoadingReports(true);
    try {
      let query = supabase.from('reports').select('*').eq('type', 'fascicolo').order('created_at', { ascending: false }).limit(20);
      if (user) { query = query.eq('user_id', user.id); }
      else { query = query.is('user_id', null); }
      const { data, error } = await query;
      if (error) throw error;
      setSavedReports(data || []);
    } catch (e) { console.error('Error loading reports:', e); }
    finally { setLoadingReports(false); }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Eliminare questo fascicolo?')) return;
    try {
      const { error } = await supabase.from('reports').delete().eq('id', reportId);
      if (error) throw error;
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) setSelectedReport(null);
    } catch (e) { console.error('Error deleting report:', e); }
  };

  const handleSignup = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Registrazione completata! Controlla la tua email.');
      setShowAuth(false); setEmail(''); setPassword('');
    } catch (err: any) { alert(err.message || 'Errore durante la registrazione'); }
    finally { setAuthLoading(false); }
  };

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setShowAuth(false); setEmail(''); setPassword('');
      loadSessions();
    } catch (err: any) { alert(err.message || 'Errore durante il login'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('egovoid_current_session');
    setMessages([]); setSessions([]); setSessionId('');
  };

  const handleTalk = async () => {
    if (!input.trim()) return;
    try {
      const currentSessionId = await createSessionIfNeeded();
      await saveMessage(currentSessionId, 'user', input, 'groq');
      const userMsg: ChatMessage = { id: Date.now().toString(), session_id: currentSessionId, sender: 'user', content: input, route_used: 'groq', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg]);
      const res = await fetch('https://web-production-96bc6.up.railway.app/chat?message=' + encodeURIComponent(input), { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      const aiResponse = data.response || data.error || 'Nessuna risposta';
      setResponse(aiResponse);
      await saveMessage(currentSessionId, 'egovoid', aiResponse, 'groq');
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), session_id: currentSessionId, sender: 'egovoid', content: aiResponse, route_used: 'groq', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      setInput('');
      await supabase.from('sessions').update({ last_active: new Date().toISOString() }).eq('id', currentSessionId);
    } catch (e) { console.error('Error:', e); setResponse('Errore di connessione all\'Abisso.'); }
  };

  const handleFasciculo = async () => {
    setGeneratingFascicolo(true);
    setShowFascicolo(true);
    setShowFascicoloMenu(false);
    setFascicolo('Caricando tutte le conversazioni...');
    try {
      let sessionsQuery = supabase.from('sessions').select('id').order('created_at', { ascending: true });
      if (user) { sessionsQuery = sessionsQuery.eq('user_id', user.id); }
      else { sessionsQuery = sessionsQuery.is('user_id', null); }
      const { data: allSessions, error: sessionsError } = await sessionsQuery;
      if (sessionsError) throw sessionsError;
      if (!allSessions || allSessions.length === 0) { setFascicolo('Nessuna conversazione trovata.'); setGeneratingFascicolo(false); return; }
      const sessionIds = allSessions.map(s => s.id);
      const { data: allMessages, error: messagesError } = await supabase.from('messages').select('*').in('session_id', sessionIds).order('created_at', { ascending: false }).limit(80);
      if (messagesError) throw messagesError;
      if (!allMessages || allMessages.length < 4) { setFascicolo('Servono almeno 4 messaggi per generare un fascicolo.'); setGeneratingFascicolo(false); return; }
      setFascicolo(`Analizzando ${allMessages.length} messaggi...`);
      const res = await fetch('https://web-production-96bc6.up.railway.app/fascicolo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: allMessages.map(m => ({ sender: m.sender, content: m.content })) }) });
      const data = await res.json();
      const report = data.fascicolo || 'Errore nella generazione del fascicolo';
      const { error: saveError } = await supabase.from('reports').insert({ user_id: user?.id || null, type: 'fascicolo', content: report, messages_analyzed: allMessages.length });
      if (saveError) console.error('Errore salvataggio:', saveError);
      setFascicolo(report);
      setGeneratingFascicolo(false);
    } catch (err) { console.error('Error generating fascicolo:', err); setFascicolo('Errore durante la generazione.'); setGeneratingFascicolo(false); }
  };

  const downloadFascicolo = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fascicolo-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSessionDisplayName = (session: ChatSession) => {
    if (session.title) return session.title;
    return new Date(session.created_at).toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'black', color: 'white' }}>
      <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
        <img src="https://res.cloudinary.com/dyiumboth/image/upload/v1767745453/photo_2025-12-24_00-16-57_yj7pep__1_-removebg-preview_xjjnag.png" alt="EgoVoid Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
        <div onClick={() => { setShowFascicoloMenu(true); loadSavedReports(); }} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <img src="https://res.cloudinary.com/dyiumboth/image/upload/v1767742397/photo_2025-12-24_00-17-00_yislbv_x081me.jpg" alt="EgoVoid Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '50%', border: '2px solid #8b5cf6' }} />
          <p style={{ color: '#8b5cf6', marginTop: '10px', fontSize: '0.9em' }}>Fascicolo</p>
        </div>

        <div style={{ marginTop: '15px' }}>
          <a href="/about.html" style={{ color: '#8b5cf6', textDecoration: 'none', fontSize: '0.95em', border: '1px solid #8b5cf6', padding: '8px 16px', borderRadius: '4px', display: 'inline-block' }}>📖 Cos'è EgoVoid?</a>
        </div>

        <div style={{ marginTop: '15px' }}>
          {user ? (
            <div>
              <p style={{ color: '#10b981', fontSize: '0.85em', marginBottom: '5px' }}>✓ Connesso: {user.email}</p>
              <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em' }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85em' }}>💾 Salva le tue Conversazioni</button>
          )}
        </div>
      </div>

      {showAuth && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #8b5cf6', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px' }}>{authMode === 'signup' ? 'Registrazione' : 'Login'}</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #8b5cf6', borderRadius: '4px' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #8b5cf6', borderRadius: '4px' }} />
            <button onClick={authMode === 'signup' ? handleSignup : handleLogin} disabled={authLoading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginBottom: '10px' }}>
              {authLoading ? 'Attendere...' : (authMode === 'signup' ? 'Registrati' : 'Accedi')}
            </button>
            <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} style={{ width: '100%', backgroundColor: 'transparent', color: '#8b5cf6', padding: '8px', border: '1px solid #8b5cf6', cursor: 'pointer', borderRadius: '4px', marginBottom: '10px' }}>
              {authMode === 'signup' ? 'Hai già un account? Login' : 'Non hai un account? Registrati'}
            </button>
            <button onClick={() => setShowAuth(false)} style={{ width: '100%', backgroundColor: '#666', color: 'white', padding: '8px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Chiudi</button>
          </div>
        </div>
      )}

      {showFascicoloMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #8b5cf6', maxWidth: '500px', width: '100%' }}>
            {!showSavedReports ? (
              <>
                <h2 style={{ color: '#8b5cf6', marginBottom: '30px', textAlign: 'center' }}>FASCICOLO</h2>
                <button onClick={handleFasciculo} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '16px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginBottom: '15px', fontSize: '1em' }}>
                  ✦ Genera Nuovo Fascicolo
                </button>
                <button onClick={() => setShowSavedReports(true)} style={{ width: '100%', backgroundColor: 'transparent', color: '#8b5cf6', padding: '16px', border: '1px solid #8b5cf6', cursor: 'pointer', borderRadius: '4px', marginBottom: '20px', fontSize: '1em' }}>
                  {loadingReports ? 'Caricando...' : `📂 Fascicoli Salvati (${savedReports.length})`}
                </button>
                <button onClick={() => setShowFascicoloMenu(false)} style={{ width: '100%', backgroundColor: '#333', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Chiudi</button>
              </>
            ) : selectedReport ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ color: '#8b5cf6', margin: 0, fontSize: '1em' }}>
                    {new Date(selectedReport.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadFascicolo(selectedReport.content)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em' }}>📥 Scarica</button>
                    <button onClick={() => setSelectedReport(null)} style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em' }}>← Indietro</button>
                  </div>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#111', padding: '20px', borderRadius: '4px', border: '1px solid #333' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', lineHeight: '1.6', color: '#ddd', fontSize: '0.9em', margin: 0 }}>{selectedReport.content}</pre>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: '#8b5cf6', margin: 0 }}>FASCICOLI SALVATI</h2>
                  <button onClick={() => setShowSavedReports(false)} style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em' }}>← Indietro</button>
                </div>
                {savedReports.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Nessun fascicolo salvato ancora.</p>
                ) : (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {savedReports.map(report => (
                      <div key={report.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#2a2a2a', marginBottom: '8px', borderRadius: '4px', border: '1px solid #333' }}>
                        <div onClick={() => setSelectedReport(report)} style={{ flex: 1, cursor: 'pointer' }}>
                          <div style={{ color: '#a78bfa', fontSize: '0.9em' }}>
                            {new Date(report.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.75em', marginTop: '2px' }}>{report.messages_analyzed} messaggi analizzati</div>
                        </div>
                        <button onClick={() => deleteReport(report.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.1em', padding: '0 5px' }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setShowSavedReports(false); setShowFascicoloMenu(false); }} style={{ width: '100%', backgroundColor: '#333', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '15px' }}>Chiudi</button>
              </>
            )}
          </div>
        </div>
      )}

      {showFascicolo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 60, display: 'flex', flexDirection: 'column', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: '#8b5cf6', margin: 0 }}>FASCICOLO PSICOLOGICO</h2>
            <div>
              <button onClick={() => downloadFascicolo(fascicolo)} disabled={generatingFascicolo} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' }}>📥 Scarica</button>
              <button onClick={() => setShowFascicolo(false)} style={{ backgroundColor: '#666', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>✕ Chiudi</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #8b5cf6' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', lineHeight: '1.6', color: '#ddd', fontSize: '0.95em' }}>{fascicolo}</pre>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: showSidebar ? '250px' : '0', backgroundColor: '#1a1a1a', overflow: 'hidden', transition: 'width 0.3s', borderRight: '1px solid #8b5cf6', display: 'flex', flexDirection: 'column', padding: showSidebar ? '20px' : '0' }}>
          <button onClick={createSession} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '10px', border: 'none', marginBottom: '10px', cursor: 'pointer', borderRadius: '4px' }}>NUOVA CHAT</button>
          <button onClick={resetAll} style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px', border: 'none', marginBottom: '20px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85em' }}>DISSOLVI TUTTO</button>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {sessions.map(session => (
              <div key={session.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: sessionId === session.id ? '#8b5cf6' : '#2a2a2a', marginBottom: '5px', borderRadius: '4px', fontSize: '0.9em' }}>
                {editingSessionId === session.id ? (
                  <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onBlur={() => saveRename(session.id)} onKeyPress={(e) => { if (e.key === 'Enter') saveRename(session.id); if (e.key === 'Escape') cancelRename(); }} autoFocus style={{ flex: 1, backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #8b5cf6', padding: '5px', borderRadius: '3px' }} />
                ) : (
                  <div onClick={() => loadMessages(session.id)} onDoubleClick={(e) => startRename(session.id, session.title || '', e)} style={{ flex: 1, cursor: 'pointer' }} title="Doppio click per rinominare">
                    {getSessionDisplayName(session)}
                  </div>
                )}
                <button onClick={(e) => deleteSession(session.id, e)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.2em', padding: '0 5px' }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ position: 'absolute', left: '20px', top: '20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8em', zIndex: 10 }}>{showSidebar ? '✕' : '☰'}</button>

          <div style={{ padding: '20px', paddingTop: '60px', textAlign: 'center', flex: 1, overflowY: 'auto' }}>
            <p style={{ color: '#8b5cf6', marginBottom: '30px', fontSize: '1.1em' }}>DEAL WITH YOUR PAST, ACCEPT IT FOR WHAT IT IS AND MOVE ON, OTHERWISE YOU ARE GONNA CARRY THAT WEIGHT</p>

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
