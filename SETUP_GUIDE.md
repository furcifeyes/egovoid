# EgoVoid Chat System - Setup Guide

## Implementation Overview

The EgoVoid chat system has been enhanced with **Supabase** for persistent chat history and message storage. This guide explains the new features and how to set them up.

## New Features

### 1. Chat Persistence with Supabase
- All chat messages are now stored in Supabase PostgreSQL database
- Users can create multiple chat sessions
- Previous conversations are archived and retrievable

### 2. Sidebar Navigation
- Click the menu button (☰) to toggle the sidebar
- View all previous chat sessions with dates
- Click any session to load its conversation history
- "NUOVA CHAT" button creates a new session

### 3. Fascicolo Generation (Logo Click)
- Click the EgoVoid logo to generate a fascicolo
- The fascicolo displays:
  - Current session ID
  - Complete message history of the session
  - All user inputs and AI responses

### 4. Message Display
- Chat history is displayed in the main content area
- Messages are color-coded:
  - User messages: #8b5cf6 (purple)
  - EgoVoid responses: #a78bfa (lighter purple)

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://hazhygxcgithuelpgjgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
GEMINI_API_KEY=your_gemini_api_key
```

To get your Supabase credentials:
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy the Project URL and Publishable Key (anon)

### Step 3: Verify Database Setup

The Supabase database should have two tables:

**chat_sessions table:**
- id (text, primary key)
- created_at (timestamp)

**chat_messages table:**
- id (uuid, auto-generated)
- session_id (text, foreign key)
- sender (text) - 'user' or 'egovoid'
- content (text)
- created_at (timestamp)

### Step 4: Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a New Chat
1. Click the menu icon (☰) to open the sidebar
2. Click "NUOVA CHAT"
3. Start typing your message and click "START TALKING"

### Viewing Previous Conversations
1. Open the sidebar
2. Select a session by date
3. The chat history loads automatically

### Generating a Fascicolo
1. Click the EgoVoid logo in the center
2. A dialog appears with your complete session data
3. Contains all messages and metadata

## Technical Details

### File Structure
```
src/
├── app/
│   └── page.tsx              # Main chat interface
├── lib/
│   └── supabase.ts           # Supabase client configuration
└── api/
    └── gemini/
        └── route.ts          # Gemini API integration
```

### Key Functions in page.tsx

- `loadSessions()` - Fetches all chat sessions
- `loadMessages(sid)` - Loads messages for a specific session
- `saveMessage()` - Persists individual messages to database
- `createSession()` - Creates new session in database
- `handleTalk()` - Processes user input and saves to Supabase
- `handleFasciculo()` - Generates fascicolo with full history

### Data Flow

```
User Input
    ↓
handle Talk()
    ↓
Save to Supabase (chat_messages)
    ↓
Call Gemini API
    ↓
Save AI Response
    ↓
Update UI with Messages
```

## Important Notes

⚠️ **Never commit `.env.local`** - Use `.env.example` as template
⚠️ **Publicable keys only** - NEXT_PUBLIC variables are exposed client-side
⚠️ **Message Storage** - All messages are stored indefinitely in Supabase

## Troubleshooting

### No Sessions Appear
- Check Supabase credentials in `.env.local`
- Verify database tables exist
- Check browser console for errors

### Messages Not Saving
- Ensure Supabase URL and key are correct
- Check network tab in browser dev tools
- Verify user has insert permissions on tables

### Fascicolo Shows Empty
- Make sure messages were saved successfully
- Check database directly in Supabase dashboard
- Reload the page and try again

## Future Enhancements

- User authentication (prevent anonymous access)
- Message editing and deletion
- Export conversations as PDF
- Search/filter chat history
- Timestamps on messages
- Real-time message sync with Realtime

## Cost

Supabase free tier includes:
- 500MB database storage
- 1GB bandwidth
- Unlimited API calls

This is sufficient for hundreds of conversations.

## Support

For issues or questions:
1. Check Supabase console for database errors
2. Review browser console for client-side errors
3. Verify environment variables are correctly set
