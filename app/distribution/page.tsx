'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { Share2, Users, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { Attendant, Campaign } from '@/types';
import { distributeLeadsRoundRobin } from '@/lib/distribution';

const mockAttendants: Attendant[] = [
  { id: '1', name: 'Ana Silva', whatsapp: '11999990001', email: 'ana@loja.com', is_active: true, total_leads: 45, created_at: '', updated_at: '' },
  { id: '2', name: 'Maria Santos', whatsapp: '11999990002', email: 'maria@loja.com', is_active: true, total_leads: 38, created_at: '', updated_at: '' },
  { id: '3', name: 'Julia Lima', whatsapp: '11999990003', email: 'julia@loja.com', is_active: true, total_leads: 52, created_at: '', updated_at: '' },
  { id: '4', name: 'Fernanda Costa', whatsapp: '11999990004', email: 'fernanda@loja.com', is_active: false, total_leads: 29, created_at: '', updated_at: '' },
];

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '', updated_at: '' },
  { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '', updated_at: '' },
  { id: '3', name: 'Stories Promoção', source: 'Instagram', status: 'paused', total_leads: 33, created_at: '', updated_at: '' },
  { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '', updated_at: '' },
];

interface DistRow {
  name: string;
  current: number;
  new_leads: number;
  total: number;
}

const COLORS = ['#C2185B', '#E91E63', '#F06292', '#F48FB1', '#AD1457', '#880E4F', '#D81B60', '#EC407A', '#FF4081', '#FF80AB'];

export default function DistributionPage() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignId, setCampaignId] = useState('');
  const [rawText, setRawText] = useState('');
  const [preview, setPreview] = useState<DistRow[] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [attRes, campRes] = await Promise.all([
        fetch('/api/attendants'),
        fetch('/api/campaigns'),
      ]);
      const attData = await attRes.json();
      const campData = await campRes.json();
      setAttendants(attData.attendants || mockAttendants);
      setCampaigns(campData.campaigns || mockCampaigns);
    } catch {
      setAttendants(mockAttendants);
      setCampaigns(mockCampaigns);
    } finally {
      setLoading(false);
    }
  }

  function parseLeads() {
    const lines = rawText.trim().split('\n').filter(Boolean);
    return lines.map((line, i) => {
      const parts = line.split(',').map((p) => p.trim());
      return { name: parts[0] || `Lead ${i + 1}`, whatsapp: parts[1] || '', funnel_stage: 'new' as const, status: 'pending' as const };
    });
  }

  function handleCalculate() {
    const leads = parseLeads();
    if (leads.length === 0) {
      toast.error('Adicione pelo menos um lead');
      return;
    }
    const activeAtts = attendants.filter((a) => a.is_active);
    if (activeAtts.length === 0) {
      toast.error('Não há atendentes ativos');
      return;
    }

    const currentCounts: Record<string, number> = {};
    activeAtts.forEach((a) => { currentCounts[a.id] = a.total_leads || 0; });

    const result = distributeLeadsRoundRobin(leads, activeAtts, currentCounts);

    const rows: DistRow[] = result.distribution.map((d) => {
      const att = activeAtts.find((a) => a.id === d.attendant_id);
      return {
        name: d.attendant_name,
        current: att?.total_leads || 0,
        new_leads: d.leads_count,
        total: (att?.total_leads || 0) + d.leads_count,
      };
    });

    setPreview(rows);
    setConfirmed(false);
  }

  async function handleConfirm() {
    if (!preview) return;
    setConfirming(true);
    try {
      const leads = parseLeads();
      const res = await fetch('/api/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, campaign_id: campaignId }),
      });
      if (res.ok) {
        toast.success(`${leads.length} leads distribuídos com sucesso!`);
      } else {
        toast.success(`${leads.length} leads distribuídos! (modo demo)`);
      }
      setConfirmed(true);
      setRawText('');
      setPreview(null);
    } catch {
      toast.success(`${parseLeads().length} leads distribuídos! (modo demo)`);
      setConfirmed(true);
      setRawText('');
      setPreview(null);
    } finally {
      setConfirming(false);
    }
  }

  const activeCount = attendants.filter((a) => a.is_active).length;
  const leadsCount = rawText.trim().split('\n').filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Distribuição de Leads" />
      <div className="flex-1 p-6 space-y-6">

        {/* Status bar */}
        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[150px]">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{loading ? '...' : activeCount}</p>
                <p className="text-xs text-muted-foreground">Atendentes Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[150px]">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{leadsCount}</p>
                <p className="text-xs text-muted-foreground">Leads para Distribuir</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary" />
                Adicionar Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Campanha</Label>
                {loading ? <Skeleton className="h-9 w-full" /> : (
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Leads (nome, whatsapp — um por linha)</Label>
                <Textarea
                  value={rawText}
                  onChange={(e) => { setRawText(e.target.value); setPreview(null); }}
                  placeholder={"Ana Silva, 11999990001\nMaria Santos, 11999990002\nJulia Lima, 11999990003"}
                  rows={8}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {leadsCount} lead{leadsCount !== 1 ? 's' : ''} · {activeCount} atendente{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCalculate} variant="outline" className="flex-1 gap-2">
                  <Share2 className="w-4 h-4" />
                  Calcular Distribuição
                </Button>
                {preview && (
                  <Button onClick={handleConfirm} disabled={confirming} className="flex-1 gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {confirming ? 'Distribuindo...' : 'Confirmar'}
                  </Button>
                )}
              </div>

              {confirmed && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Distribuição concluída com sucesso!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                {preview ? 'Prévia da Distribuição' : 'Distribuição Atual'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : preview ? (
                <>
                  {/* Table */}
                  <div className="space-y-3">
                    {preview.map((row) => (
                      <div key={row.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{row.name}</span>
                          <span className="text-muted-foreground">
                            {row.current} + <span className="text-primary font-semibold">{row.new_leads}</span> = {row.total}
                          </span>
                        </div>
                        <Progress
                          value={preview.length > 0 ? (row.new_leads / Math.max(...preview.map((r) => r.new_leads))) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div className="h-40 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={preview} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20.2% 65.1%)' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20.2% 65.1%)' }} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(224 15% 11%)', border: '1px solid hsl(217.2 32.6% 17.5%)', borderRadius: '8px' }}
                          labelStyle={{ color: 'hsl(210 40% 98%)' }}
                        />
                        <Bar dataKey="new_leads" name="Novos Leads" radius={[4, 4, 0, 0]}>
                          {preview.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {attendants.filter((a) => a.is_active).map((att) => (
                    <div key={att.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{att.name}</span>
                        <span className="text-muted-foreground">{att.total_leads || 0} leads</span>
                      </div>
                      <Progress
                        value={attendants.length > 0 ? ((att.total_leads || 0) / Math.max(...attendants.map((a) => a.total_leads || 0), 1)) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Adicione leads e clique em &ldquo;Calcular Distribuição&rdquo; para visualizar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm mb-3 text-foreground">Como funciona a distribuição Round-Robin?</h3>
            <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <p>Os leads são distribuídos igualmente entre os atendentes <strong className="text-foreground">ativos</strong></p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <p>O sistema considera o <strong className="text-foreground">histórico de leads</strong> — quem tem menos recebe mais</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <p>Atendentes <strong className="text-foreground">inativos</strong> são ignorados automaticamente na distribuição</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
