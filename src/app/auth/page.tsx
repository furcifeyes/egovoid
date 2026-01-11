'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg border border-violet-600">
        <h1 className="text-4xl font-bold text-violet-400 text-center mb-8">EgoVoid</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google', 'github']} // Aggiungi altri se vuoi
          redirectTo="/" // Dopo login torna alla home
          onlyThirdPartyProviders={false} // Mostra anche email/password
          localization={{
            variables: {
              sign_in: {
                button_label: 'Accedi',
                email_label: 'Email',
                password_label: 'Password',
              },
              sign_up: {
                button_label: 'Registrati',
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
        />
      </div>
    </div>
  );
}