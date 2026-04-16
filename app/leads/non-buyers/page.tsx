'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { ExternalLink, Copy, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { Lead } from '@/types';
import { formatDate, formatWhatsApp, getWhatsAppLink, generateFollowUpMessage } from '@/lib/utils';

const mockNonBuyers: Lead[] = [
  { id: '5', name: 'Beatriz Lima', whatsapp: '11943210987', funnel_stage: 'lost', status: 'non_buyer', notes: 'Achou caro', created_at: '2025-04-12T11:00:00Z', updated_at: '2025-04-12T11:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '4', name: 'Fernanda Costa', whatsapp: '', is_active: false, created_at: '', updated_at: '' } },
  { id: '13', name: 'Juliana Ramos', whatsapp: '11865432109', funnel_stage: 'lost', status: 'non_buyer', notes: 'Não tinha o tamanho', created_at: '2025-04-11T09:00:00Z', updated_at: '2025-04-11T09:00:00Z', campaign: { id: '3', name: 'Stories Promoção', source: 'Instagram', status: 'paused', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '14', name: 'Karla Pinto', whatsapp: '11854321098', funnel_stage: 'lost', status: 'non_buyer', notes: 'Preferiu outra cor', created_at: '2025-04-10T15:00:00Z', updated_at: '2025-04-10T15:00:00Z', campaign: { id: '2', name: 'Anúncio Dia das Mães', source: 'Facebook', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '15', name: 'Luana Cardoso', whatsapp: '11843210987', funnel_stage: 'lost', status: 'non_buyer', notes: 'Sem dinheiro no momento', created_at: '2025-04-09T10:00:00Z', updated_at: '2025-04-09T10:00:00Z', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '16', name: 'Mariana Fonseca', whatsapp: '11832109876', funnel_stage: 'lost', status: 'non_buyer', created_at: '2025-04-08T14:00:00Z', updated_at: '2025-04-08T14:00:00Z', campaign: { id: '1', name: 'Criativo Verão 2025', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
];

export default function NonBuyersPage() {
  const [nonBuyers, setNonBuyers] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [msgOpen, setMsgOpen] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchNonBuyers();
  }, []);

  async function fetchNonBuyers() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=non_buyer');
      const data = await res.json();
      setNonBuyers(data.leads?.filter((l: Lead) => l.status === 'non_buyer') || mockNonBuyers);
    } catch {
      setNonBuyers(mockNonBuyers);
    } finally {
      setLoading(false);
    }
  }

  function openReengage(lead: Lead) {
    setSelectedLead(lead);
    setMsgOpen(true);
  }

  async function markAsSent(lead: Lead) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          message_type: 'follow_up',
          content: generateFollowUpMessage(lead.name),
        }),
      });
    } catch {}
    setSentIds((prev) => { const next = new Set(prev); next.add(lead.id); return next; });
    toast.success('Mensagem de reengajamento registrada!');
    setMsgOpen(false);
  }

  function startEditNote(lead: Lead) {
    setEditingNote(lead.id);
    setNoteText(lead.notes || '');
  }

  async function saveNote(lead: Lead) {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText }),
      });
    } catch {}
    setNonBuyers((prev) => prev.map((l) => l.id === lead.id ? { ...l, notes: noteText } : l));
    setEditingNote(null);
    toast.success('Motivo salvo!');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Não Compradores" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {nonBuyers.length} lead{nonBuyers.length !== 1 ? 's' : ''} não convertido{nonBuyers.length !== 1 ? 's' : ''}
          </p>
          <Badge variant="destructive">{nonBuyers.length} Não Compradores</Badge>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Atendente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Motivo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Reengajar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : nonBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">Nenhum não comprador</td>
                  </tr>
                ) : (
                  nonBuyers.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={getWhatsAppLink(lead.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-400 hover:text-green-300"
                        >
                          {formatWhatsApp(lead.whatsapp)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.attendant?.name || '-'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {editingNote === lead.id ? (
                          <div className="flex gap-2 items-start">
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="h-16 text-xs min-h-0"
                              placeholder="Motivo da não compra..."
                            />
                            <Button size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => saveNote(lead)}>
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            className="text-left text-muted-foreground hover:text-foreground transition-colors text-xs"
                            onClick={() => startEditNote(lead)}
                            title="Clique para editar"
                          >
                            {lead.notes || <span className="italic opacity-50">Adicionar motivo...</span>}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant={sentIds.has(lead.id) ? 'outline' : 'default'}
                          className="gap-1.5"
                          onClick={() => openReengage(lead)}
                        >
                          {sentIds.has(lead.id) ? (
                            <><CheckCircle className="w-3.5 h-3.5" />Enviado</>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5" />Reengajar</>
                          )}
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

      {/* Re-engage Dialog */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tentar Reengajar 💬</DialogTitle>
            <DialogDescription>
              Mensagem de follow-up para {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="py-3">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm leading-relaxed">{generateFollowUpMessage(selectedLead.name)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    navigator.clipboard?.writeText(generateFollowUpMessage(selectedLead.name));
                    toast.success('Mensagem copiada!');
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => markAsSent(selectedLead)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Enviado
                </Button>
              </div>
              <a
                href={getWhatsAppLink(selectedLead.whatsapp, generateFollowUpMessage(selectedLead.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-2 w-full py-2 px-4 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                onClick={() => markAsSent(selectedLead)}
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
