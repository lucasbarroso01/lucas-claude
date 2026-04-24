export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const body = await request.json();
    const { leads = [], campaign_id } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'leads array is required and must not be empty' }, { status: 400 });
    }

    if (isPlaceholderUrl(supabaseUrl)) {
      // Mock round-robin distribution
      const mockAttendants = [
        { id: '1', name: 'Ana Silva' },
        { id: '2', name: 'Maria Santos' },
        { id: '3', name: 'Julia Lima' },
      ];

      const distribution: Record<string, { attendant_id: string; attendant_name: string; leads: typeof leads }> = {};
      mockAttendants.forEach((att) => {
        distribution[att.id] = { attendant_id: att.id, attendant_name: att.name, leads: [] };
      });

      leads.forEach((lead, index) => {
        const att = mockAttendants[index % mockAttendants.length];
        distribution[att.id].leads.push(lead);
      });

      const preview = {
        total_leads: leads.length,
        total_attendants: mockAttendants.length,
        distribution: Object.values(distribution).map((d) => ({
          attendant_id: d.attendant_id,
          attendant_name: d.attendant_name,
          leads_count: d.leads.length,
          leads: d.leads,
        })),
      };

      return NextResponse.json(preview, { status: 201 });
    }

    const supabase = createServerSupabaseClient();

    // Get active attendants
    const { data: attendants, error: attError } = await supabase
      .from('attendants')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (attError) throw attError;
    if (!attendants || attendants.length === 0) {
      return NextResponse.json({ error: 'No active attendants available' }, { status: 400 });
    }

    // Round-robin distribution
    const distribution: Record<string, { attendant_id: string; attendant_name: string; leads: typeof leads }> = {};
    attendants.forEach((att) => {
      distribution[att.id] = { attendant_id: att.id, attendant_name: att.name, leads: [] };
    });

    leads.forEach((lead, index) => {
      const att = attendants[index % attendants.length];
      distribution[att.id].leads.push(lead);
    });

    // Save leads to DB
    const insertData = leads.map((lead, index) => {
      const att = attendants[index % attendants.length];
      return {
        name: lead.name,
        whatsapp: lead.whatsapp,
        campaign_id: campaign_id ?? lead.campaign_id ?? null,
        attendant_id: att.id,
        funnel_stage: 'new',
        status: 'pending',
        notes: lead.notes ?? null,
      };
    });

    const { error: insertError } = await supabase.from('leads').insert(insertData);
    if (insertError) throw insertError;

    const preview = {
      total_leads: leads.length,
      total_attendants: attendants.length,
      distribution: Object.values(distribution).map((d) => ({
        attendant_id: d.attendant_id,
        attendant_name: d.attendant_name,
        leads_count: d.leads.length,
        leads: d.leads,
      })),
    };

    return NextResponse.json(preview, { status: 201 });
  } catch (error) {
    console.error('Distribution POST error:', error);
    return NextResponse.json({ error: 'Failed to distribute leads' }, { status: 500 });
  }
}
