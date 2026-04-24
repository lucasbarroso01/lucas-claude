export type LeadStatus = 'buyer' | 'no_show_call' | 'no_response' | 'call_no_close'
export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

export interface CrmLead {
  id: string
  name: string
  phone: string
  email?: string
  status: LeadStatus
  emoji?: string
  total_value?: number
  paid_amount?: number
  payment_status?: PaymentStatus
  project_type?: string
  notes?: string
  created_at: string
  updated_at: string
  last_contact?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalPaid: number
  totalPending: number
  activeClients: number
  conversionRate: number
  leadsByStatus: Record<LeadStatus, number>
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; emoji: string; color: string }> = {
  buyer:         { label: 'Compradores 💎',               emoji: '💎', color: '#10B981' },
  no_show_call:  { label: 'Não compareceu na call',        emoji: '🚫', color: '#F59E0B' },
  no_response:   { label: 'Não respondeu',                 emoji: '📵', color: '#6B7280' },
  call_no_close: { label: 'Entrou na call não fechou',     emoji: '🤝', color: '#EF4444' },
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  paid:    { label: 'Pago ✅',               color: '#10B981' },
  partial: { label: 'Pago Parcialmente ⚠️', color: '#F59E0B' },
  unpaid:  { label: 'Não Pagou ❌',         color: '#EF4444' },
}
