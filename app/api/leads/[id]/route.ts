export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

const MOCK_LEAD = {
  id: '1',
  name: 'Carla Mendes',
  whatsapp: '11988880001',
  campaign_id: '1',
  attendant_id: '1',
  funnel_stage: 'won',
  status: 'buyer',
  notes: 'Comprou vestido verão',
  purchase_value: 450,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
  attendant: { id: '1', name: 'Ana Silva', whatsapp: '11999990001', email: 'ana@loja.com', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  messages: [
    {
      id: 'msg1',
      lead_id: '1',
      attendant_id: '1',
      message_type: 'congratulations',
      content: '🎉 Parabéns pela sua compra, Carla! Seu pedido está confirmado. Qualquer dúvida, estou aqui. 💕',
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

type Params = { id: string };

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { id } = params;

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json({ ...MOCK_LEAD, id });
    }

    const supabase = createServerSupabaseClient();

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, campaign:campaigns(*), attendant:attendants(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const { data: messages } = await supabase
      .from('messages')
      .select('*, attendant:attendants(name)')
      .eq('lead_id', id)
      .order('sent_at', { ascending: true });

    return NextResponse.json({ ...lead, messages: messages ?? [] });
  } catch (error) {
    console.error('Lead GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { id } = params;
    const body = await request.json();

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json({ ...MOCK_LEAD, id, ...body, updated_at: new Date().toISOString() });
    }

    const supabase = createServerSupabaseClient();

    const allowed = ['funnel_stage', 'status', 'attendant_id', 'notes', 'purchase_value'];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select('*, campaign:campaigns(*), attendant:attendants(*)')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Lead PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { id } = params;

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json({ success: true });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
