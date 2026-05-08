import { createHiggsfieldClient } from '@higgsfield/client/v2';

export function getHiggsfieldClient() {
  const credentials = process.env.HF_CREDENTIALS;
  if (!credentials) throw new Error('HF_CREDENTIALS não configurado');
  return createHiggsfieldClient({ credentials });
}

export const HIGGSFIELD_BASE_URL = 'https://platform.higgsfield.ai';

export async function getJobStatus(requestId: string) {
  const credentials = process.env.HF_CREDENTIALS;
  if (!credentials) throw new Error('HF_CREDENTIALS não configurado');

  const res = await fetch(`${HIGGSFIELD_BASE_URL}/requests/${requestId}/status`, {
    headers: {
      Authorization: `Key ${credentials}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Erro ao verificar status: ${res.status}`);
  }

  return res.json();
}
