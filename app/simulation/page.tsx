'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import {
  Play, Pause, RefreshCw, Users, DollarSign, TrendingUp, Zap, Download,
} from 'lucide-react';
import { generateSimulatedAttendants, distributeRoundRobinSimple } from '@/lib/distribution';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#C2185B', '#E91E63', '#F06292', '#F48FB1', '#AD1457', '#880E4F', '#D81B60', '#EC407A', '#FF4081', '#FF80AB'];

type SimStep = 'config' | 'running' | 'done';

interface AttendantSim {
  id: string;
  name: string;
  leads: number;
  buyers: number;
  target: number;
}

export default function SimulationPage() {
  const [step, setStep] = useState<SimStep>('config');
  const [totalLeads, setTotalLeads] = useState(100);
  const [numAttendants, setNumAttendants] = useState(4);
  const [conversionRate, setConversionRate] = useState(30);
  const [avgTicket, setAvgTicket] = useState(350);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [paused, setPaused] = useState(false);

  const [attendants, setAttendants] = useState<AttendantSim[]>([]);
  const [distributed, setDistributed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedRef = useRef(false);

  const speedMs = speed === 'slow' ? 120 : speed === 'normal' ? 40 : 8;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function startSimulation() {
    const genAtts = generateSimulatedAttendants(numAttendants);
    const targets = distributeRoundRobinSimple(totalLeads, numAttendants);
    const sims: AttendantSim[] = genAtts.map((a, i) => ({
      id: a.id,
      name: a.name,
      leads: 0,
      buyers: 0,
      target: targets[i] || 0,
    }));
    setAttendants(sims);
    setDistributed(0);
    setPaused(false);
    pausedRef.current = false;
    setStep('running');

    let current = 0;
    const local = sims.map((a) => ({ ...a }));

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      if (current >= totalLeads) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Compute buyers
        const final = local.map((a) => ({
          ...a,
          buyers: Math.round(a.leads * (conversionRate / 100)),
        }));
        setAttendants(final);
        setStep('done');
        return;
      }
      // Find attendant with min leads to simulate round-robin
      let minIdx = 0;
      for (let i = 1; i < local.length; i++) {
        if (local[i].leads < local[minIdx].leads) minIdx = i;
      }
      local[minIdx].leads++;
      current++;
      setDistributed(current);
      setAttendants([...local]);
    }, speedMs);
  }

  function togglePause() {
    const newPaused = !paused;
    setPaused(newPaused);
    pausedRef.current = newPaused;
  }

  function resetSim() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep('config');
    setDistributed(0);
    setAttendants([]);
    setPaused(false);
    pausedRef.current = false;
  }

  const totalBuyers = attendants.reduce((s, a) => s + a.buyers, 0);
  const totalRevenue = totalBuyers * avgTicket;
  const commissionRate = 0.1;

  const chartData = attendants.map((a) => ({
    name: a.name.split(' ')[0],
    leads: a.leads,
    buyers: a.buyers,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Modo Simulação" />
      <div className="flex-1 p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Simulador de Distribuição</h2>
            <p className="text-sm text-muted-foreground">Demonstre o sistema para clientes em tempo real</p>
          </div>
        </div>

        {/* Config Step */}
        {step === 'config' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuração da Simulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Número de Leads</Label>
                    <span className="text-primary font-bold text-lg">{totalLeads}</span>
                  </div>
                  <input
                    type="range" min={1} max={500} value={totalLeads}
                    onChange={(e) => setTotalLeads(Number(e.target.value))}
                    className="w-full accent-[#C2185B]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span><span>500</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Número de Atendentes</Label>
                    <span className="text-primary font-bold text-lg">{numAttendants}</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={numAttendants}
                    onChange={(e) => setNumAttendants(Number(e.target.value))}
                    className="w-full accent-[#C2185B]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span><span>10</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Taxa de Conversão</Label>
                    <span className="text-primary font-bold text-lg">{conversionRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full accent-[#C2185B]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span><span>100%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ticket Médio (R$)</Label>
                  <Input
                    type="number"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Velocidade</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slow', 'normal', 'fast'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${speed === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                      >
                        {s === 'slow' ? '🐢 Lenta' : s === 'normal' ? '🚶 Normal' : '🚀 Rápida'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={startSimulation} className="w-full gap-2" size="lg">
                  <Play className="w-4 h-4" />
                  Iniciar Simulação
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prévia dos Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-400' },
                    { label: 'Compradores Est.', value: Math.round(totalLeads * conversionRate / 100), icon: TrendingUp, color: 'text-green-400' },
                    { label: 'Receita Estimada', value: formatCurrency(Math.round(totalLeads * conversionRate / 100) * avgTicket), icon: DollarSign, color: 'text-primary' },
                    { label: 'Leads/Atendente', value: `~${Math.ceil(totalLeads / numAttendants)}`, icon: Users, color: 'text-orange-400' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <item.icon className={`w-4 h-4 ${item.color} mb-1`} />
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <p className="text-sm font-medium mb-3">Distribuição por atendente:</p>
                  {distributeRoundRobinSimple(totalLeads, numAttendants).slice(0, numAttendants).map((count, i) => {
                    const name = generateSimulatedAttendants(numAttendants)[i]?.name.split(' ')[0] || `Atendente ${i + 1}`;
                    return (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="text-foreground font-medium">{count}</span>
                        </div>
                        <Progress value={(count / totalLeads) * 100} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Running Step */}
        {step === 'running' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Distribuindo leads em tempo real...</h3>
                <p className="text-sm text-muted-foreground">{distributed} de {totalLeads} leads distribuídos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={togglePause} className="gap-2">
                  {paused ? <><Play className="w-4 h-4" />Continuar</> : <><Pause className="w-4 h-4" />Pausar</>}
                </Button>
                <Button variant="ghost" onClick={resetSim} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reiniciar
                </Button>
              </div>
            </div>

            <Progress value={(distributed / totalLeads) * 100} className="h-3" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {attendants.map((att, idx) => (
                <Card key={att.id} className="overflow-hidden">
                  <div className="h-1" style={{ background: COLORS[idx % COLORS.length] }} />
                  <CardContent className="pt-4 space-y-2">
                    <p className="font-semibold text-sm text-foreground">{att.name}</p>
                    <div className="text-3xl font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                      {att.leads}
                    </div>
                    <p className="text-xs text-muted-foreground">leads recebidos</p>
                    <Progress value={att.target > 0 ? (att.leads / att.target) * 100 : 0} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">Meta: {att.target}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-foreground">Simulação concluída! 🎉</h3>
                <p className="text-sm text-muted-foreground">{totalLeads} leads distribuídos entre {numAttendants} atendentes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetSim} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Nova Simulação
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => toast.success('Dados importados para demonstração!')}
                >
                  <Download className="w-4 h-4" />
                  Usar Estes Dados
                </Button>
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Compradores', value: totalBuyers, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Receita Estimada', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attendant table */}
            <Card>
              <CardHeader><CardTitle className="text-base">Resultado por Atendente</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Atendente</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Leads</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Compradores</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Receita</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Comissão (10%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendants.map((att, idx) => {
                      const revenue = att.buyers * avgTicket;
                      const commission = revenue * commissionRate;
                      return (
                        <tr key={att.id} className="border-b border-border/50">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                              {att.name}
                            </div>
                          </td>
                          <td className="py-2.5 text-right">{att.leads}</td>
                          <td className="py-2.5 text-right text-green-400 font-medium">{att.buyers}</td>
                          <td className="py-2.5 text-right text-primary font-medium">{formatCurrency(revenue)}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(commission)}</td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold">
                      <td className="py-2.5 text-foreground">Total</td>
                      <td className="py-2.5 text-right">{totalLeads}</td>
                      <td className="py-2.5 text-right text-green-400">{totalBuyers}</td>
                      <td className="py-2.5 text-right text-primary">{formatCurrency(totalRevenue)}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(totalRevenue * commissionRate)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">Distribuição Final</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215 20.2% 65.1%)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(215 20.2% 65.1%)' }} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(224 15% 11%)', border: '1px solid hsl(217.2 32.6% 17.5%)', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(210 40% 98%)' }}
                      />
                      <Bar dataKey="leads" name="Leads" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                      <Bar dataKey="buyers" name="Compradores" radius={[4, 4, 0, 0]} fill="#4ade80" opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
