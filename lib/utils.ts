import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatWhatsApp(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return whatsapp;
}

export function validateBrazilianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export function getWhatsAppLink(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${encoded}`;
}

export function generateCongratsMessage(name: string): string {
  return `🎉 Parabéns pela sua compra, ${name}! Seu pedido está confirmado. Qualquer dúvida, estou aqui. 💕`;
}

export function generateFollowUpMessage(name: string): string {
  return `Olá ${name}! 😊 Vi que você se interessou pelos nossos produtos. Posso te ajudar com alguma dúvida? Temos condições especiais hoje! 💄✨`;
}

export function getFunnelStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contatado',
    negotiating: 'Em Negociação',
    won: 'Comprou',
    lost: 'Não Comprou',
  };
  return labels[stage] || stage;
}

export function getFunnelStageColor(stage: string): string {
  const colors: Record<string, string> = {
    new: 'bg-yellow-500',
    contacted: 'bg-blue-500',
    negotiating: 'bg-orange-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  };
  return colors[stage] || 'bg-gray-500';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    buyer: 'Comprador',
    non_buyer: 'Não Comprador',
    pending: 'Pendente',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    buyer: 'text-green-400 bg-green-400/10',
    non_buyer: 'text-red-400 bg-red-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
}

export function generateMedalEmoji(rank: number): string {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return `${rank + 1}º`;
}

export function calculateConversionRate(total: number, conversions: number): number {
  if (total === 0) return 0;
  return Math.round((conversions / total) * 100 * 10) / 10;
}
