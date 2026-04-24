'use client'

import React from 'react'
import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import { DashboardStats } from '@/types/crm'
import { formatCurrency } from '@/lib/utils'

interface DashboardMetricsProps {
  stats: DashboardStats
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const metrics = [
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Valor total dos contratos',
    },
    {
      title: 'Valor Recebido',
      value: formatCurrency(stats.totalPaid),
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      description: 'Total já pago pelos clientes',
    },
    {
      title: 'Valor Pendente',
      value: formatCurrency(stats.totalPending),
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      description: 'Valor ainda a receber',
    },
    {
      title: 'Clientes Ativos',
      value: stats.activeClients,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      description: 'Clientes com 💎',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${metric.color} p-5 shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-white/70 mb-1">{metric.description}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-sm font-medium text-white/80 mt-1">{metric.title}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/5" />
          </div>
        )
      })}
    </div>
  )
}
