// =============================================
// TypeScript Types for the CRM System
// =============================================

export type FunnelStage = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';
export type LeadStatus = 'buyer' | 'non_buyer' | 'pending';
export type MessageType = 'congratulations' | 'follow_up' | 'custom';
export type CampaignStatus = 'active' | 'paused' | 'ended';

export interface Campaign {
  id: string;
  name: string;
  source: string;
  status: CampaignStatus;
  total_leads: number;
  created_at: string;
  updated_at: string;
}

export interface Attendant {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  total_leads?: number;
  conversions?: number;
  conversion_rate?: number;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  campaign_id?: string;
  attendant_id?: string;
  funnel_stage: FunnelStage;
  status: LeadStatus;
  notes?: string;
  purchase_value?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  campaign?: Campaign;
  attendant?: Attendant;
  messages?: Message[];
}

export interface Message {
  id: string;
  lead_id: string;
  attendant_id?: string;
  message_type: MessageType;
  content: string;
  sent_at: string;
  // Joined
  attendant?: Attendant;
  lead?: Lead;
}

// =============================================
// Dashboard KPIs
// =============================================

export interface DashboardKPIs {
  totalLeadsToday: number;
  totalLeadsWeek: number;
  totalLeadsMonth: number;
  conversionRate: number;
  totalBuyers: number;
  totalRevenue: number;
  leadsByAttendant: AttendantStats[];
  leadsByDay: DayStats[];
  leadsByStage: StageStats[];
}

export interface AttendantStats {
  attendant_id: string;
  name: string;
  total_leads: number;
  conversions: number;
  conversion_rate: number;
  total_revenue: number;
}

export interface DayStats {
  date: string;
  count: number;
}

export interface StageStats {
  stage: FunnelStage;
  count: number;
  label: string;
}

// =============================================
// Distribution
// =============================================

export interface DistributionResult {
  attendant_id: string;
  attendant_name: string;
  leads_count: number;
  leads: Partial<Lead>[];
}

export interface DistributionPreview {
  total_leads: number;
  total_attendants: number;
  distribution: DistributionResult[];
}

// =============================================
// Forms
// =============================================

export interface LeadFormData {
  name: string;
  whatsapp: string;
  campaign_id?: string;
  notes?: string;
}

export interface AttendantFormData {
  name: string;
  whatsapp: string;
  email?: string;
  is_active: boolean;
}

export interface CampaignFormData {
  name: string;
  source: string;
  status: CampaignStatus;
}

// =============================================
// CSV Import
// =============================================

export interface CSVLeadRow {
  nome: string;
  whatsapp: string;
  campanha?: string;
  notas?: string;
}

export interface ImportPreview {
  valid: CSVLeadRow[];
  invalid: { row: CSVLeadRow; error: string }[];
}

// =============================================
// Simulation
// =============================================

export interface SimulationConfig {
  totalLeads: number;
  totalAttendants: number;
  conversionRate: number;
  averageTicket: number;
  speed: 'slow' | 'normal' | 'fast';
}

export interface SimulationResult {
  totalLeads: number;
  totalBuyers: number;
  totalRevenue: number;
  distribution: SimulationAttendantResult[];
}

export interface SimulationAttendantResult {
  name: string;
  leads: number;
  buyers: number;
  revenue: number;
  commission: number;
}
