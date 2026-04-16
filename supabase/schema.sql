-- =============================================
-- CRM E-commerce Schema para Supabase
-- Execute este arquivo no Supabase SQL Editor
-- =============================================

-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE funnel_stage AS ENUM ('new', 'contacted', 'negotiating', 'won', 'lost');
CREATE TYPE lead_status AS ENUM ('buyer', 'non_buyer', 'pending');
CREATE TYPE message_type AS ENUM ('congratulations', 'follow_up', 'custom');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'ended');

-- =============================================
-- TABELA: campaigns (campanhas/criativos)
-- =============================================

CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Instagram',
  status campaign_status DEFAULT 'active',
  total_leads INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: attendants (atendentes)
-- =============================================

CREATE TABLE attendants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: leads
-- =============================================

CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  attendant_id UUID REFERENCES attendants(id) ON DELETE SET NULL,
  funnel_stage funnel_stage DEFAULT 'new',
  status lead_status DEFAULT 'pending',
  notes TEXT,
  purchase_value DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: messages
-- =============================================

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  attendant_id UUID REFERENCES attendants(id) ON DELETE SET NULL,
  message_type message_type DEFAULT 'custom',
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX idx_leads_attendant_id ON leads(attendant_id);
CREATE INDEX idx_leads_funnel_stage ON leads(funnel_stage);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendants_updated_at
  BEFORE UPDATE ON attendants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualiza total_leads da campanha
CREATE OR REPLACE FUNCTION update_campaign_total_leads()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns SET total_leads = total_leads + 1 WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' AND OLD.campaign_id IS NOT NULL THEN
    UPDATE campaigns SET total_leads = GREATEST(total_leads - 1, 0) WHERE id = OLD.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
    IF OLD.campaign_id IS NOT NULL THEN
      UPDATE campaigns SET total_leads = GREATEST(total_leads - 1, 0) WHERE id = OLD.campaign_id;
    END IF;
    IF NEW.campaign_id IS NOT NULL THEN
      UPDATE campaigns SET total_leads = total_leads + 1 WHERE id = NEW.campaign_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_campaign_leads
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_campaign_total_leads();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para autenticação (ajuste conforme necessidade)
CREATE POLICY "Allow all for authenticated" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON attendants FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON messages FOR ALL USING (true);

-- =============================================
-- DADOS DE EXEMPLO (SEED)
-- =============================================

-- Campanhas de exemplo
INSERT INTO campaigns (name, source, status) VALUES
  ('Criativo Verão 2025', 'Instagram', 'active'),
  ('Anúncio Dia das Mães', 'Facebook', 'active'),
  ('Stories Promoção', 'Instagram', 'paused'),
  ('Campanha Reels', 'Instagram', 'active');

-- Atendentes de exemplo
INSERT INTO attendants (name, whatsapp, email) VALUES
  ('Ana Silva', '11999990001', 'ana@loja.com'),
  ('Maria Santos', '11999990002', 'maria@loja.com'),
  ('Julia Lima', '11999990003', 'julia@loja.com'),
  ('Fernanda Costa', '11999990004', 'fernanda@loja.com');
