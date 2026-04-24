export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { searchParams } = new URL(request.url);
    const lead_id = searchParams.get('lead_id');

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id query param is required' }, { status: 400 });
    }

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json([
        {
          id: 'msg1',
          lead_id,
          attendant_id: '1',
          message_type: 'congratulations',
          content: '🎉 Parabéns pela sua compra! Seu pedido está confirmado. Qualquer dúvida, estou aqui. 💕',
          sent_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          attendant: { name: 'Ana Silva' },
        },
      ]);
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('messages')
      .select('*, attendant:attendants(name)')
      .eq('lead_id', lead_id)
      .order('sent_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const body = await request.json();
    const { lead_id, attendant_id, message_type, content } = body;

    if (!lead_id || !message_type || !content) {
      return NextResponse.json(
        { error: 'lead_id, message_type, and content are required' },
        { status: 400 }
      );
    }

    if (isPlaceholderUrl(supabaseUrl)) {
      const newMessage = {
        id: String(Date.now()),
        lead_id,
        attendant_id: attendant_id ?? null,
        message_type,
        content,
        sent_at: new Date().toISOString(),
      };
      return NextResponse.json(newMessage, { status: 201 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        lead_id,
        attendant_id: attendant_id ?? null,
        message_type,
        content,
        sent_at: new Date().toISOString(),
      })
      .select('*, attendant:attendants(name)')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
