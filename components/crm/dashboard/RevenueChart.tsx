'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CrmLead } from '@/types/crm'

interface RevenueChartProps {
  leads: CrmLead[]
}

export function RevenueChart({ leads }: RevenueChartProps) {
  const buyers = leads.filter(l => l.status === 'buyer')

  const data = buyers.map(lead => ({
    name: lead.name.split(' ')[0],
    total: lead.total_value || 0,
    paid: lead.paid_amount || 0,
    pending: (lead.total_value || 0) - (lead.paid_amount || 0),
  }))

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-5 h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Nenhum comprador cadastrado ainda</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Receita por Cliente</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={v => `R$${v}`} stroke="#9CA3AF" tick={{ fontSize: 11 }} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="paid" name="Pago" stackId="a" radius={[0, 0, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill="#10B981" />)}
          </Bar>
          <Bar dataKey="pending" name="Pendente" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill="#F59E0B" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Pago
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Pendente
        </span>
      </div>
    </div>
  )
}
