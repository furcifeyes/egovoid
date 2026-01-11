'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data?.session) {
        localStorage.setItem('egovoid_session', JSON.stringify(data.session));
        localStorage.setItem('egovoid_userId', data.session.user.id);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '10px', border: '2px solid #8b5cf6', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: '#d946ef', textAlign: 'center', marginBottom: '30px', fontSize: '2.5rem' }}>EgoVoid</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#a78bfa', display: 'block', marginBottom: '8px' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuo@email.com" required style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #8b5cf6', borderRadius: '5px', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#a78bfa', display: 'block', marginBottom: '8px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #8b5cf6', borderRadius: '5px', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 'bold', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Login in corso...' : 'Accedi'}
          </button>
        </form>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
          Non hai un account? <Link href="/auth/signup" style={{ color: '#d946ef', textDecoration: 'none' }}>Registrati</Link>
        </p>
      </div>
    </div>
  );
}
