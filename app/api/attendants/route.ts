export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const MOCK_ATTENDANTS = [
  { id: '1', name: 'Ana Silva', whatsapp: '11999990001', email: 'ana@loja.com', is_active: true, total_leads: 45, conversions: 12, conversion_rate: 26.7, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'Maria Santos', whatsapp: '11999990002', email: 'maria@loja.com', is_active: true, total_leads: 38, conversions: 15, conversion_rate: 39.5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '3', name: 'Julia Lima', whatsapp: '11999990003', email: 'julia@loja.com', is_active: true, total_leads: 52, conversions: 18, conversion_rate: 34.6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '4', name: 'Fernanda Costa', whatsapp: '11999990004', email: 'fernanda@loja.com', is_active: false, total_leads: 29, conversions: 8, conversion_rate: 27.6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json(MOCK_ATTENDANTS);
    }

    const supabase = createServerSupabaseClient();

    const { data: attendants, error } = await supabase
      .from('attendants')
      .select('*')
      .order('name');

    if (error) throw error;

    // Compute stats for each attendant
    const attendantsWithStats = await Promise.all(
      (attendants ?? []).map(async (att) => {
        const { count: total_leads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('attendant_id', att.id);

        const { count: conversions } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('attendant_id', att.id)
          .eq('status', 'buyer');

        const tl = total_leads ?? 0;
        const conv = conversions ?? 0;
        const conversion_rate = tl > 0 ? Math.round((conv / tl) * 100 * 10) / 10 : 0;

        return { ...att, total_leads: tl, conversions: conv, conversion_rate };
      })
    );

    return NextResponse.json(attendantsWithStats);
  } catch (error) {
    console.error('Attendants GET error:', error);
    return NextResponse.json(MOCK_ATTENDANTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const body = await request.json();

    if (isPlaceholderUrl(supabaseUrl)) {
      const newAttendant = {
        id: String(Date.now()),
        name: body.name,
        whatsapp: body.whatsapp,
        email: body.email ?? null,
        is_active: body.is_active ?? true,
        total_leads: 0,
        conversions: 0,
        conversion_rate: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(newAttendant, { status: 201 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('attendants')
      .insert({
        name: body.name,
        whatsapp: body.whatsapp,
        email: body.email ?? null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, total_leads: 0, conversions: 0, conversion_rate: 0 }, { status: 201 });
  } catch (error) {
    console.error('Attendants POST error:', error);
    return NextResponse.json({ error: 'Failed to create attendant' }, { status: 500 });
  }
}
