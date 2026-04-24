export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const MOCK_DATA = {
  totalLeadsToday: 12,
  totalLeadsWeek: 67,
  totalLeadsMonth: 220,
  conversionRate: 32.5,
  totalBuyers: 53,
  totalRevenue: 26850,
  leadsByAttendant: [
    { attendant_id: '1', name: 'Ana Silva', total_leads: 45, conversions: 12, conversion_rate: 26.7, total_revenue: 6200 },
    { attendant_id: '2', name: 'Maria Santos', total_leads: 38, conversions: 15, conversion_rate: 39.5, total_revenue: 7850 },
    { attendant_id: '3', name: 'Julia Lima', total_leads: 52, conversions: 18, conversion_rate: 34.6, total_revenue: 9400 },
    { attendant_id: '4', name: 'Fernanda Costa', total_leads: 29, conversions: 8, conversion_rate: 27.6, total_revenue: 3400 },
  ],
  leadsByDay: [
    { date: 'Seg', count: 8 },
    { date: 'Ter', count: 12 },
    { date: 'Qua', count: 15 },
    { date: 'Qui', count: 9 },
    { date: 'Sex', count: 18 },
    { date: 'Sáb', count: 14 },
    { date: 'Dom', count: 12 },
  ],
  leadsByStage: [
    { stage: 'new', count: 45, label: 'Novo' },
    { stage: 'contacted', count: 38, label: 'Contatado' },
    { stage: 'negotiating', count: 22, label: 'Negociando' },
    { stage: 'won', count: 53, label: 'Comprou' },
    { stage: 'lost', count: 22, label: 'Não Comprou' },
  ],
};

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('your-project') || url === 'https://xxxx.supabase.co';
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isPlaceholderUrl(supabaseUrl)) {
      return NextResponse.json(MOCK_DATA);
    }

    const supabase = createServerSupabaseClient();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total leads today
    const { count: totalLeadsToday } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    // Total leads this week
    const { count: totalLeadsWeek } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart);

    // Total leads this month
    const { count: totalLeadsMonth } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart);

    // Total buyers and revenue
    const { data: buyersData } = await supabase
      .from('leads')
      .select('purchase_value')
      .eq('status', 'buyer');

    const totalBuyers = buyersData?.length ?? 0;
    const totalRevenue = buyersData?.reduce((sum, l) => sum + (l.purchase_value ?? 0), 0) ?? 0;

    // Total leads for conversion rate
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const conversionRate =
      totalLeads && totalLeads > 0
        ? Math.round((totalBuyers / totalLeads) * 100 * 10) / 10
        : 0;

    // Leads by attendant
    const { data: attendantsData } = await supabase
      .from('attendants')
      .select('id, name');

    const leadsByAttendant = await Promise.all(
      (attendantsData ?? []).map(async (att) => {
        const { count: total_leads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('attendant_id', att.id);

        const { data: convData } = await supabase
          .from('leads')
          .select('purchase_value')
          .eq('attendant_id', att.id)
          .eq('status', 'buyer');

        const conversions = convData?.length ?? 0;
        const total_revenue = convData?.reduce((sum, l) => sum + (l.purchase_value ?? 0), 0) ?? 0;
        const conversion_rate =
          total_leads && total_leads > 0
            ? Math.round((conversions / total_leads) * 100 * 10) / 10
            : 0;

        return {
          attendant_id: att.id,
          name: att.name,
          total_leads: total_leads ?? 0,
          conversions,
          conversion_rate,
          total_revenue,
        };
      })
    );

    // Leads by day (last 7 days)
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const leadsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString());

      leadsByDay.push({ date: dayLabels[dayStart.getDay()], count: count ?? 0 });
    }

    // Leads by funnel stage
    const stages = [
      { stage: 'new', label: 'Novo' },
      { stage: 'contacted', label: 'Contatado' },
      { stage: 'negotiating', label: 'Negociando' },
      { stage: 'won', label: 'Comprou' },
      { stage: 'lost', label: 'Não Comprou' },
    ];

    const leadsByStage = await Promise.all(
      stages.map(async ({ stage, label }) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('funnel_stage', stage);
        return { stage, count: count ?? 0, label };
      })
    );

    return NextResponse.json({
      totalLeadsToday: totalLeadsToday ?? 0,
      totalLeadsWeek: totalLeadsWeek ?? 0,
      totalLeadsMonth: totalLeadsMonth ?? 0,
      conversionRate,
      totalBuyers,
      totalRevenue,
      leadsByAttendant,
      leadsByDay,
      leadsByStage,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(MOCK_DATA);
  }
}
