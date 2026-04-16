'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Pencil, Trash2, Phone, Mail, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/layout/Header';
import { formatWhatsApp } from '@/lib/utils';
import type { Attendant, AttendantFormData } from '@/types';

const EMPTY_FORM: AttendantFormData = {
  name: '',
  whatsapp: '',
  email: '',
  is_active: true,
};

function AttendantCardSkeleton() {
  return (
    <Card className="border border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded" />
          <Skeleton className="h-8 flex-1 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AttendantsPage() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AttendantFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function fetchAttendants() {
    try {
      const res = await fetch('/api/attendants');
      if (!res.ok) throw new Error('Falha ao buscar atendentes');
      const data = await res.json();
      setAttendants(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar atendentes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAttendants();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(att: Attendant) {
    setEditingId(att.id);
    setForm({
      name: att.name,
      whatsapp: att.whatsapp,
      email: att.email ?? '',
      is_active: att.is_active,
    });
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.whatsapp.trim()) {
      toast.error('Nome e WhatsApp são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/attendants/${editingId}` : '/api/attendants';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email?.trim() || null,
          is_active: form.is_active,
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      const saved = await res.json();

      if (editingId) {
        setAttendants((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...saved } : a))
        );
        toast.success('Atendente atualizado com sucesso!');
      } else {
        setAttendants((prev) => [...prev, saved]);
        toast.success('Atendente criado com sucesso!');
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar atendente');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/attendants/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar');
      setAttendants((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success('Atendente removido com sucesso!');
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover atendente');
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(att: Attendant) {
    try {
      const res = await fetch(`/api/attendants/${att.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !att.is_active }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      const updated = await res.json();
      setAttendants((prev) =>
        prev.map((a) => (a.id === att.id ? { ...a, ...updated } : a))
      );
      toast.success(
        `Atendente ${!att.is_active ? 'ativado' : 'desativado'} com sucesso!`
      );
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar status do atendente');
    }
  }

  // Sort by conversion_rate descending for medals
  const sortedAttendants = [...attendants].sort(
    (a, b) => (b.conversion_rate ?? 0) - (a.conversion_rate ?? 0)
  );

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Atendentes" />

      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Atendentes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie sua equipe de atendimento
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Novo Atendente
          </Button>
        </div>

        {/* Stats summary */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{attendants.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-400">
                  {attendants.filter((a) => a.is_active).length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">
                  {attendants.reduce((s, a) => s + (a.total_leads ?? 0), 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Conversões</p>
                <p className="text-2xl font-bold text-[#C2185B]">
                  {attendants.reduce((s, a) => s + (a.conversions ?? 0), 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              <AttendantCardSkeleton />
              <AttendantCardSkeleton />
              <AttendantCardSkeleton />
              <AttendantCardSkeleton />
            </>
          ) : sortedAttendants.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Nenhum atendente cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em &ldquo;Novo Atendente&rdquo; para começar
              </p>
            </div>
          ) : (
            sortedAttendants.map((att, index) => {
              const medal = medals[index];
              const convRate = att.conversion_rate ?? 0;

              return (
                <Card
                  key={att.id}
                  className={`border transition-all hover:shadow-lg hover:shadow-[#C2185B]/5 ${
                    !att.is_active ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {medal && (
                          <span className="text-xl flex-shrink-0">{medal}</span>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {att.name}
                          </h3>
                          <span
                            className={`text-xs font-medium ${
                              att.is_active
                                ? 'text-green-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {att.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={att.is_active}
                        onCheckedChange={() => handleToggleActive(att)}
                        aria-label={`Ativar/desativar ${att.name}`}
                      />
                    </div>

                    {/* Contact info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{formatWhatsApp(att.whatsapp)}</span>
                      </div>
                      {att.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{att.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/40 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-foreground">
                          {att.total_leads ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-green-400">
                          {att.conversions ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Vendas</p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-[#C2185B]">
                          {convRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Conv.</p>
                      </div>
                    </div>

                    {/* Conversion bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Taxa de Conversão</span>
                        <span>{convRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-[#C2185B] to-[#E91E63]"
                          style={{ width: `${Math.min(convRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => openEdit(att)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                        onClick={() => openDelete(att.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Atendente' : 'Novo Atendente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="att-name">Nome *</Label>
              <Input
                id="att-name"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="att-whatsapp">WhatsApp *</Label>
              <Input
                id="att-whatsapp"
                placeholder="11999990000"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="att-email">E-mail</Label>
              <Input
                id="att-email"
                type="email"
                placeholder="email@loja.com"
                value={form.email ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="att-active">Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Atendentes inativos não recebem novos leads
                </p>
              </div>
              <Switch
                id="att-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
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
            Tem certeza que deseja remover este atendente? Esta ação não pode ser desfeita.
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
