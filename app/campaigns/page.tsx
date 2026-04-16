'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import type { Campaign, CampaignFormData, CampaignStatus } from '@/types';

const EMPTY_FORM: CampaignFormData = {
  name: '',
  source: 'Instagram',
  status: 'active',
};

const SOURCE_OPTIONS = [
  { value: 'Instagram', label: 'Instagram', icon: '📸' },
  { value: 'Facebook', label: 'Facebook', icon: '📘' },
  { value: 'TikTok', label: 'TikTok', icon: '🎵' },
  { value: 'Google', label: 'Google', icon: '🔍' },
];

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'active', label: 'Ativa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'ended', label: 'Encerrada' },
];

function statusBadgeVariant(status: CampaignStatus) {
  if (status === 'active') return 'success';
  if (status === 'paused') return 'warning';
  return 'destructive';
}

function statusLabel(status: CampaignStatus) {
  if (status === 'active') return 'Ativa';
  if (status === 'paused') return 'Pausada';
  return 'Encerrada';
}

function sourceIcon(source: string) {
  const found = SOURCE_OPTIONS.find((s) => s.value === source);
  return found ? found.icon : '🌐';
}

function CampaignRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded" />
        <Skeleton className="h-8 w-16 rounded" />
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Falha ao buscar campanhas');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      source: campaign.source,
      status: campaign.status,
    });
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Nome da campanha é obrigatório');
      return;
    }
    if (!form.source) {
      toast.error('Selecione uma fonte');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          source: form.source,
          status: form.status,
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      const saved = await res.json();

      if (editingId) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...saved } : c))
        );
        toast.success('Campanha atualizada com sucesso!');
      } else {
        setCampaigns((prev) => [saved, ...prev]);
        toast.success('Campanha criada com sucesso!');
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar campanha');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar');
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Campanha removida com sucesso!');
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover campanha');
    } finally {
      setDeleting(false);
    }
  }

  const totalLeads = campaigns.reduce((s, c) => s + (c.total_leads ?? 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Campanhas" />

      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Campanhas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie suas campanhas de marketing
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Campanha
          </Button>
        </div>

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-400">{activeCampaigns.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Pausadas</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {campaigns.filter((c) => c.status === 'paused').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-[#C2185B]">{totalLeads}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campaigns list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#C2185B]" />
              Lista de Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                <CampaignRowSkeleton />
                <CampaignRowSkeleton />
                <CampaignRowSkeleton />
                <CampaignRowSkeleton />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Nenhuma campanha cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em &ldquo;Nova Campanha&rdquo; para começar
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Source icon */}
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl flex-shrink-0">
                      {sourceIcon(campaign.source)}
                    </div>

                    {/* Name + source */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{campaign.source}</p>
                    </div>

                    {/* Status badge */}
                    <Badge
                      variant={statusBadgeVariant(campaign.status)}
                      className="flex-shrink-0 hidden sm:flex"
                    >
                      {statusLabel(campaign.status)}
                    </Badge>

                    {/* Leads count */}
                    <div className="text-center flex-shrink-0 hidden md:block">
                      <p className="text-lg font-bold text-foreground">{campaign.total_leads ?? 0}</p>
                      <p className="text-xs text-muted-foreground">leads</p>
                    </div>

                    {/* Created at */}
                    <div className="text-sm text-muted-foreground flex-shrink-0 hidden lg:block w-28 text-right">
                      {formatDate(campaign.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => openEdit(campaign)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                        onClick={() => openDelete(campaign.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Campanha' : 'Nova Campanha'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="camp-name">Nome *</Label>
              <Input
                id="camp-name"
                placeholder="Ex: Criativo Verão 2025"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="camp-source">Fonte *</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
              >
                <SelectTrigger id="camp-source">
                  <SelectValue placeholder="Selecione a fonte" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="camp-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as CampaignStatus }))
                }
              >
                <SelectTrigger id="camp-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#C2185B] hover:bg-[#AD1457] text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover esta campanha? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Removendo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
