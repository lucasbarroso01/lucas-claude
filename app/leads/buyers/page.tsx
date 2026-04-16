'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { ExternalLink, MessageCircle, Copy, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Lead } from '@/types';
import { formatDate, formatCurrency, formatWhatsApp, getWhatsAppLink, generateCongratsMessage } from '@/lib/utils';

const mockBuyers: Lead[] = [
  { id: '1', name: 'Laura Mendes', whatsapp: '11987654321', funnel_stage: 'won', status: 'buyer', purchase_value: 450, created_at: '2025-04-10T10:00:00Z', updated_at: '2025-04-10T10:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '6', name: 'Carolina Silva', whatsapp: '11932109876', funnel_stage: 'won', status: 'buyer', purchase_value: 320, created_at: '2025-04-11T16:00:00Z', updated_at: '2025-04-11T16:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '8', name: 'Elena Ferreira', whatsapp: '11910987654', funnel_stage: 'won', status: 'buyer', purchase_value: 580, created_at: '2025-04-09T13:00:00Z', updated_at: '2025-04-09T13:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '11', name: 'Helena Moura', whatsapp: '11887654321', funnel_stage: 'won', status: 'buyer', purchase_value: 290, created_at: '2025-04-08T11:00:00Z', updated_at: '2025-04-08T11:00:00Z', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '12', name: 'Isabela Torres', whatsapp: '11876543210', funnel_stage: 'won', status: 'buyer', purchase_value: 720, created_at: '2025-04-07T09:00:00Z', updated_at: '2025-04-07T09:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
];

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState<Lead | null>(null);
  const [msgOpen, setMsgOpen] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBuyers();
  }, []);

  async function fetchBuyers() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=buyer');
      const data = await res.json();
      setBuyers(data.leads?.filter((l: Lead) => l.status === 'buyer') || mockBuyers);
    } catch {
      setBuyers(mockBuyers);
    } finally {
      setLoading(false);
    }
  }

  function openCongrats(buyer: Lead) {
    setSelectedBuyer(buyer);
    setMsgOpen(true);
  }

  async function markAsSent(buyer: Lead) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: buyer.id,
          message_type: 'congratulations',
          content: generateCongratsMessage(buyer.name),
        }),
      });
    } catch {}
    setSentIds((prev) => { const next = new Set(prev); next.add(buyer.id); return next; });
    toast.success('Mensagem registrada como enviada!');
    setMsgOpen(false);
  }

  const totalRevenue = buyers.reduce((s, b) => s + (b.purchase_value || 0), 0);
  const avgTicket = buyers.length > 0 ? totalRevenue / buyers.length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Compradores" />
      <div className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buyers.length}</p>
                <p className="text-sm text-muted-foreground">Total de Compradores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Atendente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Campanha</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Parabéns</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : buyers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhum comprador ainda
                    </td>
                  </tr>
                ) : (
                  buyers.map((buyer) => (
                    <tr key={buyer.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{buyer.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={getWhatsAppLink(buyer.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-400 hover:text-green-300"
                        >
                          {formatWhatsApp(buyer.whatsapp)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{buyer.attendant?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{buyer.campaign?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-400">
                        {formatCurrency(buyer.purchase_value || 0)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(buyer.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        {sentIds.has(buyer.id) ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Enviado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant={sentIds.has(buyer.id) ? 'outline' : 'default'}
                          className="gap-1.5"
                          onClick={() => openCongrats(buyer)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Parabéns
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Congratulations Dialog */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Parabéns 🎉</DialogTitle>
            <DialogDescription>
              Mensagem automática de parabéns para {selectedBuyer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedBuyer && (
            <div className="py-3">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm leading-relaxed">{generateCongratsMessage(selectedBuyer.name)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    navigator.clipboard?.writeText(generateCongratsMessage(selectedBuyer.name));
                    toast.success('Mensagem copiada!');
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => markAsSent(selectedBuyer)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Enviado
                </Button>
              </div>
              <a
                href={getWhatsAppLink(selectedBuyer.whatsapp, generateCongratsMessage(selectedBuyer.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-2 w-full py-2 px-4 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                onClick={() => markAsSent(selectedBuyer)}
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no WhatsApp
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
