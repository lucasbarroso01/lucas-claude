'use client';

import { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import {
  Plus, Search, ExternalLink, ChevronRight, MessageCircle, Trash2,
} from 'lucide-react';
import { Lead, Campaign, FunnelStage } from '@/types';
import {
  formatDate, formatWhatsApp, getFunnelStageLabel,
  getStatusLabel, getStatusColor, getWhatsAppLink, generateCongratsMessage,
} from '@/lib/utils';

const mockLeads: Lead[] = [
  { id: '1', name: 'Laura Mendes', whatsapp: '11987654321', funnel_stage: 'won', status: 'buyer', purchase_value: 450, created_at: '2025-04-10T10:00:00Z', updated_at: '2025-04-10T10:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '2', name: 'Sofia Alves', whatsapp: '11976543210', funnel_stage: 'contacted', status: 'pending', created_at: '2025-04-14T09:00:00Z', updated_at: '2025-04-14T09:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '3', name: 'Camila Rocha', whatsapp: '11965432109', funnel_stage: 'negotiating', status: 'pending', created_at: '2025-04-13T14:00:00Z', updated_at: '2025-04-13T14:00:00Z', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '4', name: 'Amanda Costa', whatsapp: '11954321098', funnel_stage: 'new', status: 'pending', created_at: '2025-04-16T08:00:00Z', updated_at: '2025-04-16T08:00:00Z', campaign: { id: '3', name: 'Stories Promoção', source: 'Instagram', status: 'paused', total_leads: 33, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '5', name: 'Beatriz Lima', whatsapp: '11943210987', funnel_stage: 'lost', status: 'non_buyer', notes: 'Achou caro', created_at: '2025-04-12T11:00:00Z', updated_at: '2025-04-12T11:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '', updated_at: '' }, attendant: { id: '4', name: 'Fernanda Costa', whatsapp: '', is_active: false, created_at: '', updated_at: '' } },
  { id: '6', name: 'Carolina Silva', whatsapp: '11932109876', funnel_stage: 'won', status: 'buyer', purchase_value: 320, created_at: '2025-04-11T16:00:00Z', updated_at: '2025-04-11T16:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '7', name: 'Diana Souza', whatsapp: '11921098765', funnel_stage: 'contacted', status: 'pending', created_at: '2025-04-15T10:30:00Z', updated_at: '2025-04-15T10:30:00Z', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '8', name: 'Elena Ferreira', whatsapp: '11910987654', funnel_stage: 'won', status: 'buyer', purchase_value: 580, created_at: '2025-04-09T13:00:00Z', updated_at: '2025-04-09T13:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 87, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '9', name: 'Fabiana Nunes', whatsapp: '11909876543', funnel_stage: 'new', status: 'pending', created_at: '2025-04-16T07:00:00Z', updated_at: '2025-04-16T07:00:00Z', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 46, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '10', name: 'Giovana Pereira', whatsapp: '11898765432', funnel_stage: 'negotiating', status: 'pending', created_at: '2025-04-15T15:00:00Z', updated_at: '2025-04-15T15:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 54, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
];

const funnelStages: FunnelStage[] = ['new', 'contacted', 'negotiating', 'won', 'lost'];
const funnelOrder: Record<FunnelStage, number> = { new: 0, contacted: 1, negotiating: 2, won: 3, lost: 4 };

const emptyForm = { name: '', whatsapp: '', campaign_id: '', attendant_id: '', notes: '' };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [leadsRes, campRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/campaigns'),
      ]);
      const leadsData = await leadsRes.json();
      const campData = await campRes.json();
      setLeads(leadsData.leads || mockLeads);
      setCampaigns(campData.campaigns || []);
    } catch {
      setLeads(mockLeads);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.whatsapp.includes(search);
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      const matchStage = filterStage === 'all' || l.funnel_stage === filterStage;
      return matchSearch && matchStatus && matchStage;
    });
  }, [leads, search, filterStatus, filterStage]);

  async function handleCreateLead() {
    if (!form.name || !form.whatsapp) { toast.error('Nome e WhatsApp obrigatórios'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const newLead: Lead = data.lead || {
        id: Date.now().toString(), ...form, funnel_stage: 'new', status: 'pending',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success('Lead criado e distribuído!');
      setFormOpen(false);
      setForm(emptyForm);
    } catch {
      const newLead: Lead = {
        id: Date.now().toString(), ...form, funnel_stage: 'new', status: 'pending',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success('Lead criado! (modo demo)');
      setFormOpen(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function advanceStage(lead: Lead) {
    const currentIdx = funnelOrder[lead.funnel_stage];
    if (currentIdx >= 4) return;
    const nextStage = funnelStages[currentIdx + 1];
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnel_stage: nextStage }),
      });
    } catch {}
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, funnel_stage: nextStage } : l));
    toast.success(`Lead movido para: ${getFunnelStageLabel(nextStage)}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir lead?')) return;
    try { await fetch(`/api/leads/${id}`, { method: 'DELETE' }); } catch {}
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success('Lead removido!');
  }

  const stageDotColors: Record<string, string> = {
    new: 'bg-yellow-500',
    contacted: 'bg-blue-500',
    negotiating: 'bg-orange-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Gestão de Leads" />
      <div className="flex-1 p-6 space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="buyer">Comprador</SelectItem>
                <SelectItem value="non_buyer">Não Comprador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos estágios</SelectItem>
                {funnelStages.map((s) => (
                  <SelectItem key={s} value={s}>{getFunnelStageLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Campanha</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Atendente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estágio</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => { setSelectedLead(lead); setDetailOpen(true); }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={getWhatsAppLink(lead.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {formatWhatsApp(lead.whatsapp)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.campaign?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.attendant?.name || 'Não atribuído'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stageDotColors[lead.funnel_stage]}`} />
                          <span className="text-foreground text-xs">{getFunnelStageLabel(lead.funnel_stage)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {lead.funnel_stage !== 'won' && lead.funnel_stage !== 'lost' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Avançar no funil"
                              onClick={() => advanceStage(lead)}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Nome</p>
                  <p className="font-semibold mt-0.5">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">WhatsApp</p>
                  <a href={getWhatsAppLink(selectedLead.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-400 mt-0.5 block hover:underline">
                    {formatWhatsApp(selectedLead.whatsapp)}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Campanha</p>
                  <p className="mt-0.5">{selectedLead.campaign?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Atendente</p>
                  <p className="mt-0.5">{selectedLead.attendant?.name || 'Não atribuído'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Estágio do Funil</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${stageDotColors[selectedLead.funnel_stage]}`} />
                    <span>{getFunnelStageLabel(selectedLead.funnel_stage)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block ${getStatusColor(selectedLead.status)}`}>
                    {getStatusLabel(selectedLead.status)}
                  </span>
                </div>
                {selectedLead.purchase_value && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor da Compra</p>
                    <p className="font-semibold text-green-400 mt-0.5">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.purchase_value)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Data de Entrada</p>
                  <p className="mt-0.5">{formatDate(selectedLead.created_at)}</p>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Anotações</p>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedLead.notes}</p>
                </div>
              )}
              {selectedLead.status === 'buyer' && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">
                    Mensagem de parabéns sugerida:
                  </p>
                  <p className="text-sm mt-1 text-muted-foreground">{generateCongratsMessage(selectedLead.name)}</p>
                  <Button size="sm" className="mt-2 gap-1.5" onClick={() => {
                    navigator.clipboard?.writeText(generateCongratsMessage(selectedLead.name));
                    toast.success('Mensagem copiada!');
                  }}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Copiar Mensagem
                  </Button>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Mover no funil:</p>
                <div className="flex flex-wrap gap-2">
                  {funnelStages.map((stage) => (
                    <Button
                      key={stage}
                      variant={selectedLead.funnel_stage === stage ? 'default' : 'outline'}
                      size="sm"
                      onClick={async () => {
                        try {
                          await fetch(`/api/leads/${selectedLead.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ funnel_stage: stage }),
                          });
                        } catch {}
                        setLeads((prev) => prev.map((l) => l.id === selectedLead.id ? { ...l, funnel_stage: stage } : l));
                        setSelectedLead((prev) => prev ? { ...prev, funnel_stage: stage } : null);
                        toast.success(`Movido para: ${getFunnelStageLabel(stage)}`);
                      }}
                    >
                      {getFunnelStageLabel(stage)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Lead Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>O lead será automaticamente distribuído para um atendente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp *</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="11999990000" />
            </div>
            <div className="space-y-1.5">
              <Label>Campanha</Label>
              <Select value={form.campaign_id} onValueChange={(v) => setForm((f) => ({ ...f, campaign_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar campanha" /></SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Anotações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Informações adicionais..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateLead} disabled={saving}>
              {saving ? 'Criando...' : 'Criar e Distribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
