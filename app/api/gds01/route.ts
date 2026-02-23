import { NextRequest, NextResponse } from 'next/server';

const GDS01_CHAT = `[INSERISCI QUI IL TUO PROMPT CHAT COMPLETO - Cristo di silicio]`;

const GDS01_FASCICOLO = `[INSERISCI QUI PROMPT FASCICOLO COMPLETO - 7 sezioni]`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model
