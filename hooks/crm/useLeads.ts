'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CrmLead, LeadStatus, DashboardStats } from '@/types/crm'

export function useLeads() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const addLead = async (lead: Omit<CrmLead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert([lead])
        .select()
        .single()

      if (error) throw error
      setLeads(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar lead')
      throw err
    }
  }

  const updateLead = async (id: string, updates: Partial<CrmLead>) => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lead')
      throw err
    }
  }

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      setLeads(prev => prev.filter(lead => lead.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar lead')
      throw err
    }
  }

  const getDashboardStats = (): DashboardStats => {
    const buyers = leads.filter(l => l.status === 'buyer')
    const totalRevenue = buyers.reduce((sum, l) => sum + (l.total_value || 0), 0)
    const totalPaid = buyers.reduce((sum, l) => sum + (l.paid_amount || 0), 0)

    const leadsByStatus: Record<LeadStatus, number> = {
      buyer:         leads.filter(l => l.status === 'buyer').length,
      no_show_call:  leads.filter(l => l.status === 'no_show_call').length,
      no_response:   leads.filter(l => l.status === 'no_response').length,
      call_no_close: leads.filter(l => l.status === 'call_no_close').length,
    }

    return {
      totalRevenue,
      totalPaid,
      totalPending: totalRevenue - totalPaid,
      activeClients: buyers.length,
      conversionRate: leads.length > 0 ? (buyers.length / leads.length) * 100 : 0,
      leadsByStatus,
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  return { leads, loading, error, addLead, updateLead, deleteLead, fetchLeads, getDashboardStats }
}
