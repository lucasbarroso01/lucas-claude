'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { ExternalLink, GripVertical, DollarSign } from 'lucide-react';
import { Lead, FunnelStage } from '@/types';
import { formatWhatsApp, getWhatsAppLink, formatCurrency } from '@/lib/utils';

const STAGE_CONFIG: Record<FunnelStage, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  new: { label: 'Novo', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', emoji: '🟡' },
  contacted: { label: 'Contatado', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', emoji: '🔵' },
  negotiating: { label: 'Em Negociação', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', emoji: '🟠' },
  won: { label: 'Comprou', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', emoji: '🟢' },
  lost: { label: 'Não Comprou', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', emoji: '🔴' },
};

const ALL_STAGES: FunnelStage[] = ['new', 'contacted', 'negotiating', 'won', 'lost'];

const seedLeads: Lead[] = [
  { id: '1', name: 'Amanda Costa', whatsapp: '11954321098', funnel_stage: 'new', status: 'pending', created_at: '', updated_at: '', campaign: { id: '1', name: 'Criativo Verão', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '2', name: 'Fabiana Nunes', whatsapp: '11909876543', funnel_stage: 'new', status: 'pending', created_at: '', updated_at: '', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '3', name: 'Sofia Alves', whatsapp: '11976543210', funnel_stage: 'contacted', status: 'pending', created_at: '', updated_at: '', campaign: { id: '2', name: 'Dia das Mães', source: 'Facebook', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '2', name: 'Maria Santos', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '4', name: 'Diana Souza', whatsapp: '11921098765', funnel_stage: 'contacted', status: 'pending', created_at: '', updated_at: '', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '5', name: 'Camila Rocha', whatsapp: '11965432109', funnel_stage: 'negotiating', status: 'pending', created_at: '', updated_at: '', campaign: { id: '4', name: 'Campanha Reels', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '6', name: 'Giovana Pereira', whatsapp: '11898765432', funnel_stage: 'negotiating', status: 'pending', created_at: '', updated_at: '', campaign: { id: '2', name: 'Dia das Mães', source: 'Facebook', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '3', name: 'Julia Lima', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '7', name: 'Laura Mendes', whatsapp: '11987654321', funnel_stage: 'won', status: 'buyer', purchase_value: 450, created_at: '', updated_at: '', campaign: { id: '1', name: 'Criativo Verão', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '8', name: 'Elena Ferreira', whatsapp: '11910987654', funnel_stage: 'won', status: 'buyer', purchase_value: 580, created_at: '', updated_at: '', campaign: { id: '1', name: 'Criativo Verão', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '1', name: 'Ana Silva', whatsapp: '', is_active: true, created_at: '', updated_at: '' } },
  { id: '9', name: 'Beatriz Lima', whatsapp: '11943210987', funnel_stage: 'lost', status: 'non_buyer', notes: 'Achou caro', created_at: '', updated_at: '', campaign: { id: '1', name: 'Criativo Verão', source: 'Instagram', status: 'active', total_leads: 0, created_at: '', updated_at: '' }, attendant: { id: '4', name: 'Fernanda Costa', whatsapp: '', is_active: false, created_at: '', updated_at: '' } },
];

function LeadCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  return (
    <div className={`rounded-lg border bg-card p-3 space-y-2 cursor-grab active:cursor-grabbing select-none shadow-sm transition-all ${isDragging ? 'opacity-50 scale-95' : 'hover:border-primary/40'}`}>
      <div className="flex items-start justify-between gap-1">
        <p className="font-medium text-sm text-foreground leading-tight">{lead.name}</p>
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <a
          href={getWhatsAppLink(lead.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-green-400 hover:text-green-300"
          onClick={(e) => e.stopPropagation()}
        >
          {formatWhatsApp(lead.whatsapp)}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        {lead.purchase_value && (
          <span className="text-green-400 font-medium">{formatCurrency(lead.purchase_value)}</span>
        )}
      </div>
      {lead.attendant && (
        <p className="text-xs text-muted-foreground">{lead.attendant.name}</p>
      )}
      {lead.campaign && (
        <p className="text-xs text-muted-foreground/60 truncate">{lead.campaign.name}</p>
      )}
    </div>
  );
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}

export default function FunnelPage() {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<Lead | null>(null);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [pendingMove, setPendingMove] = useState<{ leadId: string; stage: FunnelStage } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getLeadsByStage = (stage: FunnelStage) => leads.filter((l) => l.funnel_stage === stage);
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const overId = String(over.id);

    // Determine target stage
    let targetStage: FunnelStage | null = null;
    if (ALL_STAGES.includes(overId as FunnelStage)) {
      targetStage = overId as FunnelStage;
    } else {
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) targetStage = overLead.funnel_stage;
    }

    if (!targetStage) return;
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead || currentLead.funnel_stage === targetStage) return;

    if (targetStage === 'won') {
      // Ask for purchase value
      setPendingMove({ leadId, stage: targetStage });
      setPurchaseModal(currentLead);
      setPurchaseValue('');
      return;
    }

    applyMove(leadId, targetStage, targetStage === 'lost' ? 'non_buyer' : undefined);
  }

  function applyMove(leadId: string, stage: FunnelStage, status?: string, value?: number) {
    setLeads((prev) => prev.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        funnel_stage: stage,
        status: status as Lead['status'] || (stage === 'won' ? 'buyer' : stage === 'lost' ? 'non_buyer' : l.status),
        purchase_value: value ?? l.purchase_value,
      };
    }));
    // API call
    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ funnel_stage: stage, status: status || (stage === 'won' ? 'buyer' : stage === 'lost' ? 'non_buyer' : undefined), purchase_value: value }),
    }).catch(() => {});
  }

  function confirmPurchase() {
    if (!pendingMove || !purchaseModal) return;
    const val = parseFloat(purchaseValue.replace(',', '.'));
    applyMove(pendingMove.leadId, 'won', 'buyer', isNaN(val) ? undefined : val);
    toast.success(`${purchaseModal.name} movida para Comprou! 🎉`);
    setPurchaseModal(null);
    setPendingMove(null);
  }

  const totalWonRevenue = getLeadsByStage('won').reduce((s, l) => s + (l.purchase_value || 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Funil de Vendas" />
      <div className="flex-1 p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
            {ALL_STAGES.map((stage) => {
              const config = STAGE_CONFIG[stage];
              const stageLeads = getLeadsByStage(stage);
              return (
                <div
                  key={stage}
                  id={stage}
                  className={`flex flex-col rounded-xl border ${config.border} ${config.bg} min-w-[220px] w-[220px] flex-shrink-0`}
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-3 py-2.5 border-b ${config.border}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.emoji}</span>
                      <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                      {stageLeads.length}
                    </span>
                  </div>
                  {stage === 'won' && totalWonRevenue > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-400 border-b border-green-500/20">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(totalWonRevenue)}
                    </div>
                  )}

                  {/* Drop zone */}
                  <SortableContext items={stageLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex-1 p-2 space-y-2 min-h-[100px]">
                      {stageLeads.map((lead) => (
                        <SortableLeadCard key={lead.id} lead={lead} />
                      ))}
                      {stageLeads.length === 0 && (
                        <p className="text-xs text-muted-foreground/40 text-center pt-4 italic">
                          Arraste leads aqui
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeLead && <LeadCard lead={activeLead} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Purchase Value Modal */}
      <Dialog open={!!purchaseModal} onOpenChange={(open) => { if (!open) { setPurchaseModal(null); setPendingMove(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Venda 🎉</DialogTitle>
            <DialogDescription>
              {purchaseModal?.name} realizou uma compra! Qual foi o valor?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Valor da Compra (R$)</Label>
              <Input
                type="text"
                placeholder="Ex: 350,00"
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPurchaseModal(null); setPendingMove(null); }}>
              Cancelar
            </Button>
            <Button onClick={confirmPurchase} className="gap-2">
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
