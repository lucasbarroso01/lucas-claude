export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const MOCK_LEADS = [
  {
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
  },
  {
    id: '2',
    name: 'Beatriz Rocha',
    whatsapp: '11988880002',
    campaign_id: '2',
    attendant_id: '2',
    funnel_stage: 'negotiating',
    status: 'pending',
    notes: 'Interessada em promoção',
    purchase_value: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '2025-04-20T10:00:00Z', updated_at: '2025-04-20T10:00:00Z' },
    attendant: { id: '2', name: 'Maria Santos', whatsapp: '11999990002', email: 'maria@loja.com', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  },
  {
    id: '3',
    name: 'Daniela Alves',
    whatsapp: '11988880003',
    campaign_id: '3',
    attendant_id: '3',
    funnel_stage: 'contacted',
    status: 'pending',
    notes: null,
    purchase_value: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: { id: '3', name: 'Stories Promoção', source: 'Instagram', status: 'paused', total_leads: 33, created_at: '2025-02-10T10:00:00Z', updated_at: '2025-02-10T10:00:00Z' },
    attendant: { id: '3', name: 'Julia Lima', whatsapp: '11999990003', email: 'julia@loja.com', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  },
  {
    id: '4',
    name: 'Elisa Ferreira',
    whatsapp: '11988880004',
    campaign_id: '1',
    attendant_id: '1',
    funnel_stage: 'lost',
    status: 'non_buyer',
    notes: 'Não teve interesse',
    purchase_value: null,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
    attendant: { id: '1', name: 'Ana Silva', whatsapp: '11999990001', email: 'ana@loja.com', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  },
  {
    id: '5',
    name: 'Flávia Gomes',
    whatsapp: '11988880005',
    campaign_id: '4',
    attendant_id: '2',
    funnel_stage: 'new',
    status: 'pending',
    notes: null,
    purchase_value: null,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '2025-03-01T10:00:00Z', updated_at: '2025-03-01T10:00:00Z' },
    attendant: { id: '2', name: 'Maria Santos', whatsapp: '11999990002', email: 'maria@loja.com', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  },
];

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const attendant_id = searchParams.get('attendant_id');
    const campaign_id = searchParams.get('campaign_id');
    const search = searchParams.get('search');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    if (isPlaceholderUrl(supabaseUrl)) {
      let leads = [...MOCK_LEADS];
      if (status) leads = leads.filter((l) => l.status === status);
      if (attendant_id) leads = leads.filter((l) => l.attendant_id === attendant_id);
      if (campaign_id) leads = leads.filter((l) => l.campaign_id === campaign_id);
      if (search) {
        const s = search.toLowerCase();
        leads = leads.filter(
          (l) => l.name.toLowerCase().includes(s) || l.whatsapp.includes(s)
        );
      }
      if (date_from) leads = leads.filter((l) => l.created_at >= date_from);
      if (date_to) leads = leads.filter((l) => l.created_at <= date_to);
      return NextResponse.json(leads);
    }

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('leads')
      .select('*, campaign:campaigns(*), attendant:attendants(*)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (attendant_id) query = query.eq('attendant_id', attendant_id);
    if (campaign_id) query = query.eq('campaign_id', campaign_id);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (search) {
      query = query.or(`name.ilike.%${search}%,whatsapp.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Leads GET error:', error);
    return NextResponse.json(MOCK_LEADS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const body = await request.json();

    if (isPlaceholderUrl(supabaseUrl)) {
      const newLead = {
        id: String(Date.now()),
        name: body.name,
        whatsapp: body.whatsapp,
        campaign_id: body.campaign_id ?? null,
        attendant_id: '1',
        funnel_stage: 'new',
        status: 'pending',
        notes: body.notes ?? null,
        purchase_value: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(newLead, { status: 201 });
    }

    const supabase = createServerSupabaseClient();

    // Round-robin: find active attendant with fewest leads
    const { data: attendants } = await supabase
      .from('attendants')
      .select('id')
      .eq('is_active', true);

    let assignedAttendantId: string | null = null;

    if (attendants && attendants.length > 0) {
      const leadCounts = await Promise.all(
        attendants.map(async (att) => {
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('attendant_id', att.id);
          return { id: att.id, count: count ?? 0 };
        })
      );
      leadCounts.sort((a, b) => a.count - b.count);
      assignedAttendantId = leadCounts[0].id;
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: body.name,
        whatsapp: body.whatsapp,
        campaign_id: body.campaign_id ?? null,
        attendant_id: body.attendant_id ?? assignedAttendantId,
        funnel_stage: 'new',
        status: 'pending',
        notes: body.notes ?? null,
      })
      .select('*, campaign:campaigns(*), attendant:attendants(*)')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Leads POST error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
