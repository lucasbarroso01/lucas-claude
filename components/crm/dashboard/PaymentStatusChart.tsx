'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CrmLead } from '@/types/crm'

interface PaymentStatusChartProps {
  leads: CrmLead[]
}

export function PaymentStatusChart({ leads }: PaymentStatusChartProps) {
  const buyers = leads.filter(l => l.status === 'buyer')

  const paid    = buyers.filter(l => l.payment_status === 'paid').length
  const partial = buyers.filter(l => l.payment_status === 'partial').length
  const unpaid  = buyers.filter(l => l.payment_status === 'unpaid').length

  const data = [
    { name: 'Pago',               value: paid,    color: '#10B981' },
    { name: 'Pago Parcialmente',  value: partial, color: '#F59E0B' },
    { name: 'Não Pagou',          value: unpaid,  color: '#EF4444' },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-5 h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Nenhum dado de pagamento disponível</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Situação de Pagamento</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={75}
            innerRadius={35}
            paddingAngle={3}
            dataKey="value"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
