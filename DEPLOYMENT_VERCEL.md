# Deployment su Vercel - EgoVoid

## Problemi Comuni e Soluzioni

### ❌ Deploy Fallisce: Missing GEMINI_API_KEY

**Errore:**
```
Error: Chiave GEMINI_API_KEY mancante su Vercel
```

**Causa:** La variabile d'ambiente `GEMINI_API_KEY` non è configurata in Vercel

**Soluzione:**

1. Vai a https://vercel.com/dashboard
2. Seleziona il progetto **egovoid**
3. Clicca su **Settings** → **Environment Variables**
4. Aggiungi queste variabili:

```
NEXT_PUBLIC_SUPABASE_URL = https://hazhygxcgithuelpgjgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_c6ULCRHxWC1_98dC0vs_g_...
GEMINI_API_KEY = YOUR_GEMINI_API_KEY_HERE
```

5. Clicca **Save**
6. Torna a **Deployments** e clicca il menu **...** → **Redeploy**

## 📋 Checklist Completa per il Deploy

### Step 1: Preparare le API Keys

**Gemini API Key:**
- Vai a https://makersuite.google.com/app/apikey
- Crea una nuova API key
- Copia il valore (inizia con `AI...`)

**Supabase Keys:**
- Vai a https://app.supabase.com
- Seleziona il progetto `egovoid-chat`
- Settings → API
- Copia:
  - **Project URL** (es: `https://hazhygxcgithuelpgjgv.supabase.co`)
  - **Publishable Key (anon)** (inizia con `sb_publishable_`)

### Step 2: Configurare Vercel

1. **Accedi a Vercel:**
   ```
   https://vercel.com/dashboard
   ```

2. **Seleziona progetto:** egovoid

3. **Vai a Settings → Environment Variables**

4. **Aggiungi le variabili:**

   | Nome | Valore | Note |
   |------|--------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://hazhygxcgithuelpgjgv.supabase.co` | Public (next è obbligatorio) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Public (next è obbligatorio) |
   | `GEMINI_API_KEY` | `AI...` | **Secret** (no NEXT_PUBLIC) |

5. **Salva tutto**

### Step 3: Eseguire il Redeploy

1. Vai a **Deployments**
2. Seleziona il deployment più recente
3. Clicca il menu **...** in alto a destra
4. Seleziona **Redeploy**
5. Aspetta che il build completi

## 🔍 Verificare che Funziona

1. Apri https://egovoid.vercel.app
2. Scrivi un messaggio nella chat
3. Clicca "START TALKING"
4. Se ricevi una risposta da EgoVoid → ✅ Deploy corretto!
5. Se vedi errore "Chiave GEMINI_API_KEY mancante" → Ripeti Step 2

## 📊 Architettura Deploy

```
Vercel (Frontend + API)
├── Next.js App
├── API Routes
│   └── /api/gemini → chiama Google Gemini
│   └── usa GEMINI_API_KEY da env
└── Client Components
    └── Usano NEXT_PUBLIC_SUPABASE_*
    └── Connettono a Supabase

Supabase (Backend)
├── PostgreSQL Database
├── chat_sessions table
└── chat_messages table

Google Gemini
└── Risponde ai messaggi
```

## ⚠️ Differenza Public vs Secret

**Public (NEXT_PUBLIC_):**
- Visibile nel codice frontend
- Può essere letto dal browser
- Usa solo Supabase ANON KEY (accesso limitato)
- Sicuro perché la key non ha privilegi sensibili

**Secret (senza NEXT_PUBLIC):**
- SOLO server-side (API routes)
- Non appare nel codice frontend
- Usa GEMINI_API_KEY (accesso completo a Google)
- DEVE essere nascosto

## 🚨 Errori Comuni

### Errore: "Cannot read property 'undefined'" in /api/gemini
→ GEMINI_API_KEY non è definita in Vercel
→ Soluzione: Vai a Settings → Environment Variables, aggiungi GEMINI_API_KEY

### Errore: "Supabase connection failed"
→ NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY sbagliati
→ Soluzione: Verifica i valori in Supabase dashboard

### La chat non salva i messaggi
→ Supabase non è raggiungibile o le credenziali sono sbagliate
→ Soluzione: Verifica le variabili d'ambiente e i permessi della key

## 📱 Test Locale vs Production

**Locale (npm run dev):**
- Usa `.env.local`
- Non ha bisogno di NEXT_PUBLIC
- Puoi usare chiavi di test

**Production (Vercel):**
- Usa Environment Variables di Vercel
- DEVE avere NEXT_PUBLIC per le variabili public
- Usa GEMINI_API_KEY secret

## 🔄 Workflow Completo

1. **Sviluppo locale:**
   ```bash
   cp .env.example .env.local
   # Modifica .env.local con le tue chiavi
   npm run dev
   ```

2. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Fix: aggiunto DEPLOYMENT_VERCEL.md"
   git push origin main
   ```

3. **Vercel deployan automaticamente** (se connected)
   
4. **Se fallisce:**
   - Vai a Vercel Settings → Environment Variables
   - Aggiungi GEMINI_API_KEY
   - Clicca Redeploy

## 📞 Support

Se il deploy continua a fallire:
1. Controlla i **Build Logs** in Vercel (Deployments → Seleziona deployment → Logs)
2. Verifica che GEMINI_API_KEY sia aggiunta e non vuota
3. Assicurati che NEXT_PUBLIC_* siano public
4. Verifica che le chiavi Supabase siano corrette
