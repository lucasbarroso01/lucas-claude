import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/higgsfield';

export async function GET(
  _request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const credentials = process.env.HF_CREDENTIALS;
    if (!credentials) {
      return NextResponse.json(
        { error: 'HF_CREDENTIALS não configurado' },
        { status: 503 }
      );
    }

    const data = await getJobStatus(params.requestId);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('Higgsfield status error:', err);
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
