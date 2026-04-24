'use client'

import React, { useState } from 'react'
import { useLeads } from '@/hooks/crm/useLeads'
import { DashboardMetrics } from '@/components/crm/dashboard/DashboardMetrics'
import { RevenueChart } from '@/components/crm/dashboard/RevenueChart'
import { PaymentStatusChart } from '@/components/crm/dashboard/PaymentStatusChart'
import { LeadsTable } from '@/components/crm/leads/LeadsTable'
import { Button } from '@/components/crm/ui/liquid-glass-button'
import { STATUS_CONFIG, LeadStatus, CrmLead } from '@/types/crm'
import { Plus, BarChart3, Users, RefreshCw, Sparkles, Loader2 } from 'lucide-react'

export default function CrmPage() {
  const {
    leads,
    loading,
    addLead,
    updateLead,
    deleteLead,
    getDashboardStats,
    fetchLeads,
  } = useLeads()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    status: 'no_response' as LeadStatus,
  })
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads'>('dashboard')
  const [submitting, setSubmitting] = useState(false)

  const stats = getDashboardStats()

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) return
    setSubmitting(true)
    try {
      await addLead({
        name: newLead.name,
        phone: newLead.phone,
        status: newLead.status,
      })
      setNewLead({ name: '', phone: '', status: 'no_response' })
      setShowAddModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateLead = async (id: string, updates: Partial<CrmLead>) => {
    try {
      await updateLead(id, updates)
    } catch {
      // silently ignore
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Confirmar exclusão deste lead?')) return
    await deleteLead(id)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-emerald-950/30 to-gray-900 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12)_0%,_transparent_70%)]" />
        <div className="relative px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Emerald CRM</h1>
              <p className="text-xs text-gray-400">Gestão de Leads Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLeads()}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Novo Lead
            </Button>
          </div>
        </div>
      </header>

      {/* ── Navigation ── */}
      <nav className="px-6 py-3 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'leads'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Leads
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="p-6 space-y-6">
        {activeTab === 'dashboard' ? (
          <>
            <DashboardMetrics stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <RevenueChart leads={leads} />
              <PaymentStatusChart leads={leads} />
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div
                  key={key}
                  className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{config.emoji}</span>
                    <span className="text-2xl font-bold text-white">
                      {stats.leadsByStatus[key as LeadStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-tight">{config.label}</p>
                </div>
              ))}
            </div>

            {/* Conversion rate */}
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Taxa de Conversão</span>
                <span className="text-emerald-400 font-bold text-lg">
                  {stats.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Todos os Leads</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                {leads.length} leads
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum lead cadastrado ainda</p>
                <Button size="sm" onClick={() => setShowAddModal(true)} className="mt-4">
                  Adicionar Primeiro Lead
                </Button>
              </div>
            ) : (
              <LeadsTable
                leads={leads}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
              />
            )}
          </div>
        )}
      </main>

      {/* ── Add Lead Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">Novo Lead</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Telefone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="(62) 99176-7644"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <select
                  value={newLead.status}
                  onChange={e =>
                    setNewLead({ ...newLead, status: e.target.value as LeadStatus })
                  }
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.emoji} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddLead}
                disabled={submitting || !newLead.name || !newLead.phone}
                className="flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
