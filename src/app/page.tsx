'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!confirm('DISSOLVI TUTTO? Tutte le sessioni saranno eliminate permanentemente.')) return;
    try {
      let query = supabase.from('sessions').delete();
      if (user) { query = query.eq('user_id', user.id); }
      else { query = query.is('user_id', null); }
      const { error } = await query;
      if (error) throw error;
      localStorage.removeItem('egovoid_current_session');
      setMessages([]); setSessions([]); setSessionId('');
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
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    try {
      const currentSessionId = await createSessionIfNeeded();
      await saveMessage(currentSessionId, 'user', currentInput, 'groq');
      const userMsg: ChatMessage = { id: Date.now().toString(), session_id: currentSessionId, sender: 'user', content: currentInput, route_used: 'groq', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg]);

      let profiloUtente = '';
      if (savedReports.length > 0) {
        try {
          const profiloRes = await fetch('https://web-production-96bc6.up.railway.app/profilo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user?.id || null, fascicoli: savedReports.slice(0, 3).map(r => r.content) })
          });
          const profiloData = await profiloRes.json();
          if (profiloData.profilo) profiloUtente = profiloData.profilo;
        } catch (e) { console.log('Profilo non disponibile'); }
      }

      const chatUrl = 'https://web-production-96bc6.up.railway.app/chat?message=' + encodeURIComponent(currentInput) + (profiloUtente ? '&profilo=' + encodeURIComponent(profiloUtente) : '');
      const res = await fetch(chatUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      const aiResponse = data.response || data.error || 'Nessuna risposta';

      await saveMessage(currentSessionId, 'egovoid', aiResponse, 'groq');
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), session_id: currentSessionId, sender: 'egovoid', content: aiResponse, route_used: 'groq', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      await supabase.from('sessions').update({ last_active: new Date().toISOString() }).eq('id', currentSessionId);
    } catch (e) { console.error('Error:', e); }
    finally { setIsTyping(false); }
  };

  const handleFasciculo = async () => {
    setGeneratingFascicolo(true);
    setShowFascicolo(true);
    setShowFascicoloMenu(false);
    setFascicolo('');
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
      const res = await fetch('https://web-production-96bc6.up.railway.app/fascicolo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: allMessages.map(m => ({ sender: m.sender, content: m.content })) }) });
      const data = await res.json();
      const report = data.fascicolo || 'Errore nella generazione del fascicolo';
      await supabase.from('reports').insert({ user_id: user?.id || null, type: 'fascicolo', content: report, messages_analyzed: allMessages.length });
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
    return new Date(session.created_at).toLocaleDateString('it-IT');
  };

  return (
    <>
      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 24px rgba(139,92,246,0.7); }
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        @keyframes textReveal {
          from { opacity: 0; letter-spacing: 0.3em; }
          to { opacity: 1; letter-spacing: normal; }
        }
        .msg-appear { animation: fadeIn 0.4s ease forwards; }
        .glow-border { animation: pulse-glow 3s ease-in-out infinite; }
        .text-reveal { animation: textReveal 0.6s ease forwards; }
        .dot-1 { animation: typing 1.2s ease-in-out infinite; }
        .dot-2 { animation: typing 1.2s ease-in-out 0.2s infinite; }
        .dot-3 { animation: typing 1.2s ease-in-out 0.4s infinite; }

        .sidebar-session:hover { background: rgba(139,92,246,0.15) !important; }
        .btn-ghost:hover { background: rgba(139,92,246,0.15) !important; }
        .report-card:hover { border-color: rgba(139,92,246,0.6) !important; background: rgba(139,92,246,0.08) !important; }

        @media (max-width: 768px) {
          .chat-container { padding: 12px !important; padding-top: 60px !important; }
          .chat-messages { max-width: 100% !important; max-height: 45vh !important; }
          .chat-input { width: 100% !important; }
          .banner-img { height: 120px !important; }
          .logo-section { margin-top: 16px !important; margin-bottom: 12px !important; }
          .modal-inner { padding: 20px !important; margin: 12px !important; max-width: 100% !important; }
          .fascicolo-modal { padding: 20px !important; }
          .sidebar { width: 240px !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#000', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden' }}>

        {/* AURORA BACKGROUND */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(109,40,217,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(76,29,149,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

        {/* GRAIN OVERLAY */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* BANNER */}
          <div className="banner-img" style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
            <img src="https://res.cloudinary.com/dyiumboth/image/upload/v1767745453/photo_2025-12-24_00-16-57_yj7pep__1_-removebg-preview_xjjnag.png" alt="EgoVoid" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #000 100%)' }} />
          </div>

          {/* LOGO + CONTROLS */}
          <div className="logo-section" style={{ textAlign: 'center', marginTop: '20px', marginBottom: '16px', padding: '0 16px' }}>

            {/* LOGO FASCICOLO */}
            <div onClick={() => { setShowFascicoloMenu(true); loadSavedReports(); }} style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}>
              <div className="glow-border" style={{ width: '90px', height: '90px', borderRadius: '50%', border: '1px solid var(--violet-border)', overflow: 'hidden', margin: '0 auto' }}>
                <img src="https://res.cloudinary.com/dyiumboth/image/upload/v1767742397/photo_2025-12-24_00-17-00_yislbv_x081me.jpg" alt="GDS-01" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ color: 'var(--violet)', marginTop: '8px', fontSize: '0.75em', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Fascicolo</p>
            </div>

            {/* TAGLINE */}
            <p style={{ color: 'rgba(139,92,246,0.5)', fontSize: '0.65em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginTop: '12px', padding: '0 20px', lineHeight: 1.6 }}>
              DEAL WITH YOUR PAST — ACCEPT IT — MOVE ON
            </p>

            {/* AUTH + ABOUT */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <a href="/about.html" style={{ color: 'rgba(139,92,246,0.7)', textDecoration: 'none', fontSize: '0.75em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', border: '1px solid rgba(139,92,246,0.3)', padding: '6px 14px', borderRadius: '2px' }}>
                MANIFESTO
              </a>
              {user ? (
                <>
                  <span style={{ color: 'rgba(16,185,129,0.8)', fontSize: '0.7em', letterSpacing: '0.05em' }}>✦ {user.email}</span>
                  <button onClick={handleLogout} className="btn-ghost" style={{ background: 'none', border: '1px solid rgba(220,38,38,0.4)', color: 'rgba(220,38,38,0.7)', padding: '6px 14px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>ESCI</button>
                </>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn-ghost" style={{ background: 'none', border: '1px solid rgba(16,185,129,0.4)', color: 'rgba(16,185,129,0.8)', padding: '6px 14px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                  SALVA SESSIONI
                </button>
              )}
            </div>
          </div>

          {/* MAIN LAYOUT */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

            {/* SIDEBAR */}
            <div className="sidebar" style={{ width: showSidebar ? '260px' : '0', minWidth: showSidebar ? '260px' : '0', position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'absolute' : 'relative', height: '100%', zIndex: 20, backgroundColor: 'rgba(8,4,16,0.98)', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', borderRight: showSidebar ? '1px solid var(--violet-border)' : 'none', display: 'flex', flexDirection: 'column', padding: showSidebar ? '20px 16px' : '0' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65em', letterSpacing: '0.2em', color: 'rgba(139,92,246,0.5)', marginBottom: '16px', textTransform: 'uppercase' }}>Sessioni</p>
              <button onClick={createSession} style={{ background: 'none', border: '1px solid var(--violet-border)', color: 'var(--violet)', padding: '8px', marginBottom: '8px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.75em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', width: '100%' }}>+ NUOVA</button>
              <button onClick={resetAll} style={{ background: 'none', border: '1px solid rgba(220,38,38,0.3)', color: 'rgba(220,38,38,0.6)', padding: '8px', marginBottom: '20px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', width: '100%' }}>DISSOLVI TUTTO</button>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {sessions.map(session => (
                  <div key={session.id} className="sidebar-session" style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', background: sessionId === session.id ? 'rgba(139,92,246,0.15)' : 'transparent', marginBottom: '4px', borderRadius: '2px', border: sessionId === session.id ? '1px solid var(--violet-border)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {editingSessionId === session.id ? (
                      <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onBlur={() => saveRename(session.id)} onKeyPress={(e) => { if (e.key === 'Enter') saveRename(session.id); if (e.key === 'Escape') cancelRename(); }} autoFocus style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontSize: '0.8em', fontFamily: 'var(--font-body)' }} />
                    ) : (
                      <div onClick={() => { loadMessages(session.id); if (window.innerWidth < 768) setShowSidebar(false); }} onDoubleClick={(e) => startRename(session.id, session.title || '', e)} style={{ flex: 1, fontSize: '0.8em', color: sessionId === session.id ? 'var(--text-primary)' : 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getSessionDisplayName(session)}
                      </div>
                    )}
                    <button onClick={(e) => deleteSession(session.id, e)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.5)', cursor: 'pointer', fontSize: '0.9em', padding: '0 4px', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0 }}>

              {/* SIDEBAR TOGGLE */}
              <button onClick={() => setShowSidebar(!showSidebar)} style={{ position: 'absolute', left: '16px', top: '16px', background: 'none', border: '1px solid var(--violet-border)', color: 'var(--violet)', padding: '6px 10px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.75em', zIndex: 10, fontFamily: 'var(--font-display)' }}>
                {showSidebar ? '✕' : '☰'}
              </button>

              {/* CHAT AREA */}
              <div className="chat-container" style={{ padding: '20px', paddingTop: '56px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* MESSAGES */}
                <div className="chat-messages" style={{ maxWidth: '680px', width: '100%', margin: '0 auto', flex: 1 }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7em', letterSpacing: '0.2em', color: 'rgba(139,92,246,0.3)', textTransform: 'uppercase' }}>L'abisso è pronto</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={msg.id} className="msg-appear" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '0.65em', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', color: msg.sender === 'user' ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.3)', marginBottom: '6px', textTransform: 'uppercase' }}>
                        {msg.sender === 'user' ? 'Tu' : 'GDS-01'}
                      </span>
                      <div style={{ maxWidth: '85%', padding: '12px 16px', background: msg.sender === 'user' ? 'rgba(139,92,246,0.1)' : 'rgba(15,10,25,0.8)', border: msg.sender === 'user' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(139,92,246,0.15)', borderRadius: '2px', fontSize: '1em', lineHeight: 1.7, color: msg.sender === 'user' ? 'var(--text-dim)' : 'var(--text-primary)', fontStyle: msg.sender === 'egovoid' ? 'italic' : 'normal' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* TYPING INDICATOR */}
                  {isTyping && (
                    <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65em', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', color: 'rgba(139,92,246,0.3)', marginBottom: '6px', textTransform: 'uppercase' }}>GDS-01</span>
                      <div style={{ padding: '14px 18px', background: 'rgba(15,10,25,0.8)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="dot-1" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                        <span className="dot-2" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                        <span className="dot-3" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', marginTop: '16px' }}>
                  <div style={{ border: '1px solid var(--violet-border)', borderRadius: '2px', background: 'var(--bg-input)', position: 'relative' }}>
                    <textarea
                      className="chat-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTalk(); } }}
                      placeholder="Offri uno squarcio di coscienza..."
                      style={{ width: '100%', minHeight: '80px', maxHeight: '160px', background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '14px 16px', paddingRight: '60px', fontSize: '1em', fontFamily: 'var(--font-body)', resize: 'none', lineHeight: 1.6 }}
                    />
                    <button
                      onClick={handleTalk}
                      disabled={isTyping || !input.trim()}
                      style={{ position: 'absolute', right: '10px', bottom: '10px', background: input.trim() && !isTyping ? 'var(--violet)' : 'transparent', border: '1px solid var(--violet-border)', color: input.trim() && !isTyping ? 'white' : 'var(--violet)', width: '36px', height: '36px', borderRadius: '2px', cursor: input.trim() && !isTyping ? 'pointer' : 'default', fontSize: '1em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ↑
                    </button>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '0.65em', color: 'rgba(139,92,246,0.3)', marginTop: '8px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>INVIO PER INVIARE — SHIFT+INVIO PER ANDARE A CAPO</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AUTH MODAL */}
        {showAuth && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="modal-inner" style={{ background: 'rgba(8,4,20,0.99)', padding: '32px', borderRadius: '2px', border: '1px solid var(--violet-border)', maxWidth: '400px', width: '100%' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)', marginBottom: '24px', fontSize: '0.9em', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{authMode === 'signup' ? 'Registrazione' : 'Accesso'}</h2>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', background: 'rgba(139,92,246,0.05)', color: 'var(--text-primary)', border: '1px solid var(--violet-border)', borderRadius: '2px', outline: 'none', fontSize: '0.9em', fontFamily: 'var(--font-body)' }} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', marginBottom: '20px', background: 'rgba(139,92,246,0.05)', color: 'var(--text-primary)', border: '1px solid var(--violet-border)', borderRadius: '2px', outline: 'none', fontSize: '0.9em', fontFamily: 'var(--font-body)' }} />
              <button onClick={authMode === 'signup' ? handleSignup : handleLogin} disabled={authLoading} style={{ width: '100%', background: 'var(--violet)', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '2px', marginBottom: '10px', fontFamily: 'var(--font-display)', fontSize: '0.75em', letterSpacing: '0.15em' }}>
                {authLoading ? '...' : (authMode === 'signup' ? 'REGISTRATI' : 'ACCEDI')}
              </button>
              <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} style={{ width: '100%', background: 'none', color: 'rgba(139,92,246,0.6)', padding: '8px', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', borderRadius: '2px', marginBottom: '8px', fontFamily: 'var(--font-display)', fontSize: '0.7em', letterSpacing: '0.1em' }}>
                {authMode === 'signup' ? 'HAI GIÀ UN ACCOUNT?' : 'CREA ACCOUNT'}
              </button>
              <button onClick={() => setShowAuth(false)} style={{ width: '100%', background: 'none', color: 'rgba(156,163,175,0.5)', padding: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>CHIUDI</button>
            </div>
          </div>
        )}

        {/* FASCICOLO MENU MODAL */}
        {showFascicoloMenu && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="modal-inner" style={{ background: 'rgba(8,4,20,0.99)', padding: '32px', borderRadius: '2px', border: '1px solid var(--violet-border)', maxWidth: '520px', width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {!showSavedReports ? (
                <>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)', marginBottom: '8px', fontSize: '0.9em', letterSpacing: '0.2em', textAlign: 'center' }}>FASCICOLO</h2>
                  <p style={{ color: 'rgba(139,92,246,0.4)', fontSize: '0.75em', textAlign: 'center', marginBottom: '28px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>SPECCHIO DELLA COSCIENZA</p>
                  <button onClick={handleFasciculo} style={{ width: '100%', background: 'rgba(139,92,246,0.1)', color: 'var(--text-primary)', padding: '16px', border: '1px solid var(--violet-border)', cursor: 'pointer', borderRadius: '2px', marginBottom: '12px', fontFamily: 'var(--font-display)', fontSize: '0.75em', letterSpacing: '0.15em' }}>
                    ✦ GENERA NUOVO FASCICOLO
                  </button>
                  <button onClick={() => setShowSavedReports(true)} style={{ width: '100%', background: 'none', color: 'rgba(139,92,246,0.7)', padding: '16px', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', borderRadius: '2px', marginBottom: '24px', fontFamily: 'var(--font-display)', fontSize: '0.75em', letterSpacing: '0.15em' }}>
                    {loadingReports ? '...' : `FASCICOLI SALVATI (${savedReports.length})`}
                  </button>
                  <button onClick={() => setShowFascicoloMenu(false)} style={{ background: 'none', border: 'none', color: 'rgba(156,163,175,0.4)', cursor: 'pointer', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', alignSelf: 'center' }}>CHIUDI</button>
                </>
              ) : selectedReport ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(139,92,246,0.6)', fontSize: '0.7em', letterSpacing: '0.15em' }}>
                      {new Date(selectedReport.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => downloadFascicolo(selectedReport.content)} style={{ background: 'none', border: '1px solid var(--violet-border)', color: 'var(--violet)', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)' }}>↓ SCARICA</button>
                      <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: '1px solid rgba(156,163,175,0.2)', color: 'rgba(156,163,175,0.5)', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)' }}>← INDIETRO</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '2px', border: '1px solid rgba(139,92,246,0.1)' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.8, color: 'var(--text-dim)', fontSize: '0.95em', margin: 0 }}>{selectedReport.content}</pre>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)', fontSize: '0.85em', letterSpacing: '0.2em' }}>FASCICOLI SALVATI</h2>
                    <button onClick={() => setShowSavedReports(false)} style={{ background: 'none', border: '1px solid rgba(156,163,175,0.2)', color: 'rgba(156,163,175,0.5)', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.7em', fontFamily: 'var(--font-display)' }}>← INDIETRO</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {savedReports.length === 0 ? (
                      <p style={{ color: 'rgba(139,92,246,0.3)', textAlign: 'center', padding: '40px 20px', fontFamily: 'var(--font-display)', fontSize: '0.7em', letterSpacing: '0.15em' }}>NESSUN FASCICOLO SALVATO</p>
                    ) : (
                      savedReports.map(report => (
                        <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(139,92,246,0.04)', marginBottom: '8px', borderRadius: '2px', border: '1px solid rgba(139,92,246,0.15)', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.85em', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                              {new Date(report.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <div style={{ color: 'rgba(139,92,246,0.4)', fontSize: '0.7em', marginTop: '3px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{report.messages_analyzed} MESSAGGI ANALIZZATI</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.4)', cursor: 'pointer', fontSize: '0.9em', padding: '4px 8px' }}>✕</button>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={() => { setShowSavedReports(false); setShowFascicoloMenu(false); }} style={{ background: 'none', border: 'none', color: 'rgba(156,163,175,0.4)', cursor: 'pointer', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', alignSelf: 'center', marginTop: '16px' }}>CHIUDI</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* FASCICOLO GENERATO */}
        {showFascicolo && (
          <div className="fascicolo-modal" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.97)', zIndex: 110, display: 'flex', flexDirection: 'column', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', maxWidth: '720px', width: '100%', margin: '0 auto 24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)', fontSize: '0.9em', letterSpacing: '0.2em' }}>FASCICOLO PSICOLOGICO</h2>
                {generatingFascicolo && <p style={{ color: 'rgba(139,92,246,0.4)', fontSize: '0.7em', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginTop: '4px' }}>GDS-01 STA ANALIZZANDO...</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!generatingFascicolo && fascicolo && (
                  <button onClick={() => downloadFascicolo(fascicolo)} style={{ background: 'none', border: '1px solid var(--violet-border)', color: 'var(--violet)', padding: '8px 16px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font-display)', fontSize: '0.7em', letterSpacing: '0.1em' }}>↓ SCARICA</button>
                )}
                <button onClick={() => setShowFascicolo(false)} style={{ background: 'none', border: '1px solid rgba(156,163,175,0.2)', color: 'rgba(156,163,175,0.5)', padding: '8px 16px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font-display)', fontSize: '0.7em', letterSpacing: '0.1em' }}>✕ CHIUDI</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxWidth: '720px', width: '100%', margin: '0 auto', background: 'rgba(8,4,20,0.9)', padding: '28px', borderRadius: '2px', border: '1px solid rgba(139,92,246,0.15)' }}>
              {generatingFascicolo && !fascicolo ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="dot-1" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                    <span className="dot-2" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                    <span className="dot-3" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', color: 'rgba(139,92,246,0.4)', fontSize: '0.7em', letterSpacing: '0.15em' }}>ANALISI IN CORSO</p>
                </div>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.9, color: 'var(--text-dim)', fontSize: '1em', margin: 0 }}>{fascicolo}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
