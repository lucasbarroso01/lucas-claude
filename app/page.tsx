'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import type { DashboardKPIs } from '@/types';

const PIE_COLORS = ['#C2185B', '#E91E63', '#F06292', '#F48FB1', '#FCE4EC'];

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}

function KPICard({ title, value, icon, gradient, subtitle }: KPICardProps) {
  return (
    <Card className={`relative overflow-hidden border-0 ${gradient}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card className="border-0 bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const topAttendants = data?.leadsByAttendant
    ? [...data.leadsByAttendant]
        .sort((a, b) => b.conversion_rate - a.conversion_rate)
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <KPICard
                title="Total Leads Hoje"
                value={data?.totalLeadsToday ?? 0}
                icon={<Calendar className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#C2185B] to-[#880E4F]"
                subtitle="Novos leads nas últimas 24h"
              />
              <KPICard
                title="Total Leads Semana"
                value={data?.totalLeadsWeek ?? 0}
                icon={<CalendarDays className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#E91E63] to-[#C2185B]"
                subtitle="Últimos 7 dias"
              />
              <KPICard
                title="Total Leads Mês"
                value={data?.totalLeadsMonth ?? 0}
                icon={<CalendarRange className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#9C27B0] to-[#6A1B9A]"
                subtitle="Mês atual"
              />
              <KPICard
                title="Taxa de Conversão"
                value={`${data?.conversionRate ?? 0}%`}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#1976D2] to-[#0D47A1]"
                subtitle="Leads convertidos em compradores"
              />
              <KPICard
                title="Total Compradores"
                value={data?.totalBuyers ?? 0}
                icon={<UserCheck className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#388E3C] to-[#1B5E20]"
                subtitle="Clientes que realizaram compra"
              />
              <KPICard
                title="Receita Total"
                value={formatCurrency(data?.totalRevenue ?? 0)}
                icon={<DollarSign className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-[#F57C00] to-[#E65100]"
                subtitle="Valor total das vendas"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Bar Chart: Leads por dia */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#C2185B]" />
                Leads por Dia (Últimos 7 Dias)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data?.leadsByDay ?? []}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f2e',
                        border: '1px solid rgba(194,24,91,0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#C2185B', fontWeight: 600 }}
                      cursor={{ fill: 'rgba(194,24,91,0.08)' }}
                    />
                    <Bar
                      dataKey="count"
                      name="Leads"
                      fill="#C2185B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart: Distribuição por estágio */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C2185B]" />
                Distribuição por Estágio
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data?.leadsByStage ?? []}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {(data?.leadsByStage ?? []).map((entry, index) => (
                        <Cell
                          key={`cell-${entry.stage}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f2e',
                        border: '1px solid rgba(194,24,91,0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ranking de Atendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C2185B]" />
              Ranking de Atendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : topAttendants.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhum dado de atendente disponível.
              </p>
            ) : (
              <div className="space-y-2">
                {topAttendants.map((att, index) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const medal = medals[index] ?? `${index + 1}º`;
                  const barWidth = topAttendants[0].conversion_rate > 0
                    ? (att.conversion_rate / topAttendants[0].conversion_rate) * 100
                    : 0;

                  return (
                    <div
                      key={att.attendant_id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">{medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-foreground truncate">
                            {att.name}
                          </span>
                          <span className="text-sm font-semibold text-[#C2185B] flex-shrink-0 ml-2">
                            {att.conversion_rate}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-[#C2185B] to-[#E91E63] transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{att.total_leads} leads</span>
                          <span className="text-[#4ade80]">{att.conversions} conversões</span>
                          <span>{formatCurrency(att.total_revenue)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
