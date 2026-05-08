'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Film, Image as ImageIcon, Mic, Play, PlusCircle, RefreshCw, Trash2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/Header';

type GenerateMode = 'text2image' | 'image2video' | 'speaking';
type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';

interface HiggsfieldJob {
  id: string;
  requestId: string;
  mode: GenerateMode;
  prompt: string;
  status: JobStatus;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
}

const STORAGE_KEY = 'higgsfield_jobs';
const POLL_INTERVAL = 4000;

const MODE_LABELS: Record<GenerateMode, string> = {
  text2image: 'Texto → Imagem',
  image2video: 'Imagem → Vídeo',
  speaking: 'Foto Falante',
};

const MODE_ICONS: Record<GenerateMode, React.ElementType> = {
  text2image: ImageIcon,
  image2video: Film,
  speaking: Mic,
};

function statusVariant(s: JobStatus): 'default' | 'success' | 'warning' | 'destructive' {
  if (s === 'completed') return 'success';
  if (s === 'queued' || s === 'in_progress') return 'warning';
  return 'destructive';
}

function statusLabel(s: JobStatus) {
  const map: Record<JobStatus, string> = {
    queued: 'Na fila',
    in_progress: 'Gerando...',
    completed: 'Concluído',
    failed: 'Falhou',
    nsfw: 'Bloqueado',
  };
  return map[s] ?? s;
}

function loadJobs(): HiggsfieldJob[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveJobs(jobs: HiggsfieldJob[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export default function HiggsfieldPage() {
  const [mode, setMode] = useState<GenerateMode>('text2image');
  const [jobs, setJobs] = useState<HiggsfieldJob[]>([]);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [dopModel, setDopModel] = useState<'dop-lite' | 'dop-turbo' | 'dop-standard'>('dop-standard');
  const [imageSize, setImageSize] = useState('1024x1536');
  const [imageQuality, setImageQuality] = useState<'720p' | '1080p'>('720p');

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setJobs(loadJobs());
  }, []);

  const updateJob = useCallback((requestId: string, patch: Partial<HiggsfieldJob>) => {
    setJobs((prev) => {
      const updated = prev.map((j) => (j.requestId === requestId ? { ...j, ...patch } : j));
      saveJobs(updated);
      return updated;
    });
  }, []);

  const pollPending = useCallback(async (currentJobs: HiggsfieldJob[]) => {
    const pending = currentJobs.filter(
      (j) => j.status === 'queued' || j.status === 'in_progress'
    );
    if (pending.length === 0) return;

    await Promise.allSettled(
      pending.map(async (job) => {
        try {
          const res = await fetch(`/api/higgsfield/status/${job.requestId}`);
          if (!res.ok) return;
          const data = await res.json();

          const patch: Partial<HiggsfieldJob> = { status: data.status };
          if (data.images?.[0]?.url) patch.imageUrl = data.images[0].url;
          if (data.video?.url) patch.videoUrl = data.video.url;

          updateJob(job.requestId, patch);
        } catch {
          // ignore individual poll errors
        }
      })
    );
  }, [updateJob]);

  useEffect(() => {
    pollingRef.current = setInterval(() => {
      setJobs((current) => {
        pollPending(current);
        return current;
      });
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pollPending]);

  function buildInput() {
    if (mode === 'text2image') {
      return {
        mode,
        prompt,
        width_and_height: imageSize,
        quality: imageQuality,
        batch_size: 1,
        enhance_prompt: true,
      };
    }
    if (mode === 'image2video') {
      return {
        mode,
        model: dopModel,
        prompt,
        input_images: [{ type: 'image_url', image_url: imageUrl }],
        enhance_prompt: true,
      };
    }
    // speaking
    return {
      mode,
      prompt,
      input_image: { type: 'image_url', image_url: imageUrl },
      input_audio: { type: 'audio_url', audio_url: audioUrl },
      quality: 'high',
      duration: 10,
    };
  }

  function validateInput(): string | null {
    if (!prompt.trim()) return 'O prompt é obrigatório';
    if (mode === 'image2video' && !imageUrl.trim()) return 'A URL da imagem é obrigatória';
    if (mode === 'speaking' && !imageUrl.trim()) return 'A URL da imagem é obrigatória';
    if (mode === 'speaking' && !audioUrl.trim()) return 'A URL do áudio é obrigatória';
    return null;
  }

  async function handleGenerate() {
    const validationError = validateInput();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildInput()),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao iniciar geração');
        return;
      }

      const newJob: HiggsfieldJob = {
        id: String(Date.now()),
        requestId: data.request_id,
        mode,
        prompt: prompt.trim(),
        status: data.status ?? 'queued',
        createdAt: new Date().toISOString(),
      };

      setJobs((prev) => {
        const updated = [newJob, ...prev];
        saveJobs(updated);
        return updated;
      });

      toast.success('Geração iniciada! Acompanhe o status na galeria.');
      setPrompt('');
      setImageUrl('');
      setAudioUrl('');
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão com o Higgsfield');
    } finally {
      setGenerating(false);
    }
  }

  function handleDelete(id: string) {
    setJobs((prev) => {
      const updated = prev.filter((j) => j.id !== id);
      saveJobs(updated);
      return updated;
    });
    toast.success('Item removido');
  }

  async function handleRefreshJob(job: HiggsfieldJob) {
    try {
      const res = await fetch(`/api/higgsfield/status/${job.requestId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      const patch: Partial<HiggsfieldJob> = { status: data.status };
      if (data.images?.[0]?.url) patch.imageUrl = data.images[0].url;
      if (data.video?.url) patch.videoUrl = data.video.url;

      updateJob(job.requestId, patch);
      toast.success('Status atualizado');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  }

  const pendingCount = jobs.filter(
    (j) => j.status === 'queued' || j.status === 'in_progress'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Higgsfield AI" />

      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#C2185B]" />
              Higgsfield AI
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gere imagens e vídeos com IA para suas campanhas
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning" className="gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {pendingCount} gerando...
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Generator Panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#C2185B]" />
                Novo Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode selector */}
              <div className="space-y-1.5">
                <Label>Modo</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(MODE_LABELS) as GenerateMode[]).map((m) => {
                    const Icon = MODE_ICONS[m];
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                          mode === m
                            ? 'border-[#C2185B] bg-[#C2185B]/10 text-[#C2185B]'
                            : 'border-border text-muted-foreground hover:border-[#C2185B]/50 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {MODE_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-1.5">
                <Label htmlFor="hf-prompt">Prompt *</Label>
                <Textarea
                  id="hf-prompt"
                  rows={3}
                  placeholder={
                    mode === 'text2image'
                      ? 'Ex: Modelo usando vestido floral em cenário praiano...'
                      : mode === 'image2video'
                      ? 'Ex: Movimento suave, câmera aproximando...'
                      : 'Ex: Fale sobre a nova coleção de verão...'
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Image URL (image2video + speaking) */}
              {(mode === 'image2video' || mode === 'speaking') && (
                <div className="space-y-1.5">
                  <Label htmlFor="hf-image-url">URL da Imagem *</Label>
                  <Input
                    id="hf-image-url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Audio URL (speaking only) */}
              {mode === 'speaking' && (
                <div className="space-y-1.5">
                  <Label htmlFor="hf-audio-url">URL do Áudio *</Label>
                  <Input
                    id="hf-audio-url"
                    placeholder="https://..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                  />
                </div>
              )}

              {/* text2image options */}
              {mode === 'text2image' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tamanho</Label>
                    <Select value={imageSize} onValueChange={setImageSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Quadrado (1024×1024)</SelectItem>
                        <SelectItem value="1024x1536">Retrato (1024×1536)</SelectItem>
                        <SelectItem value="1536x1024">Paisagem (1536×1024)</SelectItem>
                        <SelectItem value="1536x2048">Retrato HD (1536×2048)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Qualidade</Label>
                    <Select
                      value={imageQuality}
                      onValueChange={(v) => setImageQuality(v as '720p' | '1080p')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* image2video model */}
              {mode === 'image2video' && (
                <div className="space-y-1.5">
                  <Label>Modelo</Label>
                  <Select value={dopModel} onValueChange={(v) => setDopModel(v as typeof dopModel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dop-lite">DOP Lite (rápido)</SelectItem>
                      <SelectItem value="dop-standard">DOP Standard</SelectItem>
                      <SelectItem value="dop-turbo">DOP Turbo (HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Gerar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Film className="w-4 h-4 text-[#C2185B]" />
                Galeria
                {jobs.length > 0 && (
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {jobs.length} item{jobs.length !== 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    Nenhuma geração ainda
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use o painel ao lado para gerar seu primeiro conteúdo
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {jobs.map((job) => {
                    const Icon = MODE_ICONS[job.mode];
                    const isActive = job.status === 'queued' || job.status === 'in_progress';
                    return (
                      <div
                        key={job.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        {/* Result media */}
                        {job.status === 'completed' && job.imageUrl && (
                          <div className="relative bg-muted/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={job.imageUrl}
                              alt={job.prompt}
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}
                        {job.status === 'completed' && job.videoUrl && (
                          <div className="bg-black">
                            <video
                              src={job.videoUrl}
                              controls
                              className="w-full max-h-48"
                              preload="metadata"
                            />
                          </div>
                        )}

                        {/* Info row */}
                        <div className="flex items-start gap-3 p-3">
                          <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {job.prompt}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant={statusVariant(job.status)} className="text-xs">
                                {isActive && <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />}
                                {statusLabel(job.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {MODE_LABELS[job.mode]}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleRefreshJob(job)}
                                title="Atualizar status"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            )}
                            {job.status === 'completed' && job.videoUrl && (
                              <a
                                href={job.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  title="Abrir vídeo"
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                              onClick={() => handleDelete(job.id)}
                              title="Remover"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
