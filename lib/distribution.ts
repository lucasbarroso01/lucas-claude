import { Attendant, Lead, DistributionResult, DistributionPreview } from '@/types';

/**
 * Distribui leads entre atendentes usando Round-Robin justo.
 * Considera o histórico de leads para balanceamento contínuo.
 */
export function distributeLeadsRoundRobin(
  leads: Partial<Lead>[],
  attendants: Attendant[],
  currentCounts?: Record<string, number>
): DistributionPreview {
  const activeAttendants = attendants.filter((a) => a.is_active);

  if (activeAttendants.length === 0) {
    return {
      total_leads: leads.length,
      total_attendants: 0,
      distribution: [],
    };
  }

  // Inicializa contagem atual de leads por atendente
  const counts: Record<string, number> = {};
  activeAttendants.forEach((a) => {
    counts[a.id] = currentCounts?.[a.id] ?? a.total_leads ?? 0;
  });

  // Resultado da distribuição
  const distribution: DistributionResult[] = activeAttendants.map((a) => ({
    attendant_id: a.id,
    attendant_name: a.name,
    leads_count: 0,
    leads: [],
  }));

  const indexMap: Record<string, number> = {};
  activeAttendants.forEach((a, i) => {
    indexMap[a.id] = i;
  });

  // Distribui cada lead para o atendente com menos leads
  for (const lead of leads) {
    // Encontra atendente com menor contagem
    let minAttendant = activeAttendants[0];
    let minCount = counts[minAttendant.id];

    for (const attendant of activeAttendants) {
      const count = counts[attendant.id];
      if (count < minCount) {
        minCount = count;
        minAttendant = attendant;
      }
    }

    const idx = indexMap[minAttendant.id];
    distribution[idx].leads.push({ ...lead, attendant_id: minAttendant.id });
    distribution[idx].leads_count++;
    counts[minAttendant.id]++;
  }

  return {
    total_leads: leads.length,
    total_attendants: activeAttendants.length,
    distribution,
  };
}

/**
 * Distribuição simples Round-Robin puro (sem considerar histórico).
 * Útil para a simulação e demonstração.
 */
export function distributeRoundRobinSimple(
  totalLeads: number,
  totalAttendants: number
): number[] {
  if (totalAttendants === 0) return [];

  const base = Math.floor(totalLeads / totalAttendants);
  const remainder = totalLeads % totalAttendants;
  const counts: number[] = [];

  for (let i = 0; i < totalAttendants; i++) {
    counts.push(base + (i < remainder ? 1 : 0));
  }

  return counts;
}

/**
 * Gera nomes aleatórios para simulação
 */
const firstNames = [
  'Ana', 'Beatriz', 'Camila', 'Daniela', 'Elena', 'Fernanda', 'Gabriela',
  'Helena', 'Isabela', 'Juliana', 'Karla', 'Laura', 'Mariana', 'Natalia',
  'Olivia', 'Patricia', 'Roberta', 'Sandra', 'Tatiana', 'Valeria',
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa',
  'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Mendes',
];

export function generateSimulatedLeads(count: number): Partial<Lead>[] {
  const leads: Partial<Lead>[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    leads.push({
      name: `${firstName} ${lastName}`,
      whatsapp: `11${number}`,
      funnel_stage: 'new',
      status: 'pending',
    });
  }
  return leads;
}

/**
 * Gera atendentes simulados
 */
const attendantNames = [
  'Ana Silva', 'Beatriz Santos', 'Camila Oliveira', 'Daniela Costa',
  'Elena Ferreira', 'Fernanda Lima', 'Gabriela Pereira', 'Helena Souza',
  'Isabela Mendes', 'Juliana Almeida',
];

export function generateSimulatedAttendants(count: number): Attendant[] {
  return attendantNames.slice(0, count).map((name, i) => ({
    id: `sim-${i}`,
    name,
    whatsapp: `1199999${String(i).padStart(4, '0')}`,
    is_active: true,
    total_leads: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
