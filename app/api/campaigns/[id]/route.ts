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
        name: body.name ?? 'Campanha',
        source: body.source ?? 'Instagram',
        status: body.status ?? 'active',
        total_leads: 0,
        updated_at: new Date().toISOString(),
      });
    }

    const supabase = createServerSupabaseClient();

    const allowed = ['name', 'source', 'status'];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Recompute total_leads
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id);

    return NextResponse.json({ ...data, total_leads: count ?? 0 });
  } catch (error) {
    console.error('Campaign PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
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

    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Campaign DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
