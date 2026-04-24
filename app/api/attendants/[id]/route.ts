export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

type Params = { id: string };

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { id } = params;
    const body = await request.json();

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json({
        id,
        name: body.name ?? 'Atendente',
        whatsapp: body.whatsapp ?? '11999990000',
        email: body.email ?? null,
        is_active: body.is_active ?? true,
        total_leads: 0,
        conversions: 0,
        conversion_rate: 0,
        updated_at: new Date().toISOString(),
      });
    }

    const supabase = createServerSupabaseClient();

    const allowed = ['name', 'whatsapp', 'email', 'is_active'];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('attendants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Recompute stats
    const { count: total_leads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('attendant_id', id);

    const { count: conversions } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('attendant_id', id)
      .eq('status', 'buyer');

    const tl = total_leads ?? 0;
    const conv = conversions ?? 0;
    const conversion_rate = tl > 0 ? Math.round((conv / tl) * 100 * 10) / 10 : 0;

    return NextResponse.json({ ...data, total_leads: tl, conversions: conv, conversion_rate });
  } catch (error) {
    console.error('Attendant PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update attendant' }, { status: 500 });
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

    const { error } = await supabase.from('attendants').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Attendant DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete attendant' }, { status: 500 });
  }
}
