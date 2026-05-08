import { NextRequest, NextResponse } from 'next/server';
import { getHiggsfieldClient } from '@/lib/higgsfield';

type GenerateMode = 'text2image' | 'image2video' | 'speaking';

const ENDPOINT_MAP: Record<GenerateMode, string> = {
  text2image: '/v1/text2image/soul',
  image2video: '/v1/image2video/dop',
  speaking: '/v1/speak/higgsfield',
};

export async function POST(request: NextRequest) {
  try {
    const credentials = process.env.HF_CREDENTIALS;
    if (!credentials) {
      return NextResponse.json(
        { error: 'HF_CREDENTIALS não configurado. Adicione no arquivo .env.local' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { mode, ...input } = body as { mode: GenerateMode; [key: string]: unknown };

    const endpoint = ENDPOINT_MAP[mode];
    if (!endpoint) {
      return NextResponse.json({ error: `Modo inválido: ${mode}` }, { status: 400 });
    }

    const client = getHiggsfieldClient();
    const result = await client.subscribe(endpoint, { input, withPolling: false });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Higgsfield generate error:', err);
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
