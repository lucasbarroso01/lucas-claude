# CRM WhatsApp Leads — Loja de Roupas Femininas

Sistema CRM completo para gerenciar leads que chegam via WhatsApp a partir de anúncios pagos.

## Stack Técnica

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de dados**: Supabase (PostgreSQL)
- **UI Components**: Radix UI + shadcn/ui
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Ícones**: Lucide React

## Funcionalidades

| Página | Descrição |
|--------|-----------|
| `/` | Dashboard com KPIs, gráficos de barras e pizza, ranking de atendentes |
| `/leads` | Gerenciamento completo de leads com filtros e modal de detalhes |
| `/leads/buyers` | Compradores com envio de mensagem de parabéns |
| `/leads/non-buyers` | Não compradores com reengajamento |
| `/distribution` | Distribuição Round-Robin automática com visualização |
| `/funnel` | Funil Kanban com drag-and-drop |
| `/attendants` | CRUD de atendentes com métricas e ranking |
| `/campaigns` | CRUD de campanhas com métricas |
| `/simulation` | Modo demonstração com animação em tempo real |

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase.

### 3. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Copie as credenciais em **Settings → API**

### 4. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000

> **Modo demonstração**: Sem credenciais Supabase o sistema funciona com dados de exemplo.

## Deploy na Vercel

1. Push para GitHub
2. Importe em [vercel.com](https://vercel.com)
3. Configure as variáveis de ambiente
4. Clique em Deploy

## Modo Simulação

A página `/simulation` demonstra o sistema para clientes:
- Configure leads (1-500), atendentes (1-10) e taxa de conversão
- Veja os leads sendo distribuídos em tempo real com animação
- Resumo final com receita estimada e comissões por atendente

## Distribuição Round-Robin

O algoritmo em `lib/distribution.ts` distribui igualmente entre atendentes ativos, sempre atribuindo ao que tem menos leads — garantindo balanceamento contínuo.

**Exemplo**: 101 leads + 4 atendentes → 26, 25, 25, 25 leads.
