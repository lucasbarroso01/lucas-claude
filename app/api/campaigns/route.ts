import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
  { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '2025-04-20T10:00:00Z', updated_at: '2025-04-20T10:00:00Z' },
  { id: '3', name: 'Stories Promoção', source: 'Instagram', status: 'paused', total_leads: 33, created_at: '2025-02-10T10:00:00Z', updated_at: '2025-02-10T10:00:00Z' },
  { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '2025-03-01T10:00:00Z', updated_at: '2025-03-01T10:00:00Z' },
];

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json(MOCK_CAMPAIGNS);
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compute total_leads for each campaign
    const campaignsWithLeads = await Promise.all(
      (data ?? []).map(async (campaign) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);
        return { ...campaign, total_leads: count ?? 0 };
      })
    );

    return NextResponse.json(campaignsWithLeads);
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json(MOCK_CAMPAIGNS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const body = await request.json();

    if (isPlaceholderUrl(supabaseUrl)) {
      const newCampaign = {
        id: String(Date.now()),
        name: body.name,
        source: body.source,
        status: body.status ?? 'active',
        total_leads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(newCampaign, { status: 201 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        source: body.source,
        status: body.status ?? 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, total_leads: 0 }, { status: 201 });
  } catch (error) {
    console.error('Campaigns POST error:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
