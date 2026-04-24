'use client'

import React, { useState } from 'react'
import { CrmLead, STATUS_CONFIG, PAYMENT_STATUS_CONFIG, LeadStatus } from '@/types/crm'
import { formatCurrency, formatWhatsApp } from '@/lib/utils'
import { Button } from '@/components/crm/ui/liquid-glass-button'
import { MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useWhatsApp } from '@/hooks/crm/useWhatsApp'

interface LeadsTableProps {
  leads: CrmLead[]
  onUpdateLead: (id: string, updates: Partial<CrmLead>) => void
  onDeleteLead: (id: string) => void
}

export function LeadsTable({ leads, onUpdateLead, onDeleteLead }: LeadsTableProps) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const { sendMessage, sending } = useWhatsApp()

  const handleSendMessage = async (phone: string) => {
    const message =
      messageText ||
      'Olá! 👋\n\nEstou entrando em contato para falar sobre nossos serviços. Como podemos ajudar você hoje?'
    await sendMessage(phone, message)
  }

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const updates: Partial<CrmLead> = { status: newStatus }
    if (newStatus === 'buyer') updates.emoji = '💎'
    onUpdateLead(leadId, updates)
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Telefone</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Valor Total</th>
            <th className="px-4 py-3 text-left">Situação</th>
            <th className="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {leads.map(lead => (
            <React.Fragment key={lead.id}>
              <tr className="bg-gray-800/40 hover:bg-gray-700/40 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-white font-medium">
                    {lead.status === 'buyer' && '💎 '}
                    {lead.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {formatWhatsApp(lead.phone)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.emoji} {config.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {lead.total_value ? formatCurrency(lead.total_value) : '-'}
                </td>
                <td className="px-4 py-3">
                  {lead.status === 'buyer' ? (
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          PAYMENT_STATUS_CONFIG[lead.payment_status || 'unpaid'].color + '22',
                        color: PAYMENT_STATUS_CONFIG[lead.payment_status || 'unpaid'].color,
                      }}
                    >
                      {PAYMENT_STATUS_CONFIG[lead.payment_status || 'unpaid'].label}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedLead(expandedLead === lead.id ? null : lead.id)
                      }
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      {expandedLead === lead.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSendMessage(lead.phone)}
                      disabled={sending}
                      className="h-8 w-8 text-emerald-400 hover:text-emerald-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteLead(lead.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>

              {expandedLead === lead.id && (
                <tr className="bg-gray-800/20">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lead.status === 'buyer' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400">Valor Total do Projeto</label>
                            <input
                              type="number"
                              defaultValue={lead.total_value || ''}
                              onBlur={e =>
                                onUpdateLead(lead.id, {
                                  total_value: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                              placeholder="R$ 0,00"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Valor Pago</label>
                            <input
                              type="number"
                              defaultValue={lead.paid_amount || ''}
                              onBlur={e => {
                                const paid = parseFloat(e.target.value) || 0
                                const total = lead.total_value || 0
                                const paymentStatus =
                                  paid === 0 ? 'unpaid' : paid >= total ? 'paid' : 'partial'
                                onUpdateLead(lead.id, {
                                  paid_amount: paid,
                                  payment_status: paymentStatus,
                                })
                              }}
                              className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                              placeholder="R$ 0,00"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">Mensagem para WhatsApp</label>
                          <div className="flex gap-2 mt-1">
                            <textarea
                              value={messageText}
                              onChange={e => setMessageText(e.target.value)}
                              placeholder="Digite sua mensagem..."
                              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                              rows={2}
                            />
                            <Button
                              onClick={() => handleSendMessage(lead.phone)}
                              disabled={sending}
                              size="sm"
                            >
                              Enviar
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Observações</label>
                          <textarea
                            defaultValue={lead.notes || ''}
                            onBlur={e => onUpdateLead(lead.id, { notes: e.target.value })}
                            className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                            rows={2}
                            placeholder="Adicione observações sobre este lead..."
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
