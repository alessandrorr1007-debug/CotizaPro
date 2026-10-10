// ============================================================================
// CotizaPro — Domain Models & Database Types
// ============================================================================

export type MemberRole = 'owner' | 'admin' | 'member';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  default_tax_rate: number;
  logo_url: string | null;
  consecutive_quote_number: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit_price: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_rate: number; // Porcentaje de 0 a 100
  subtotal: number;
  sort_order: number;
}

export interface Quote {
  id: string;
  business_id: string;
  client_id: string;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  valid_until: string;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_rate: number; // Porcentaje de 0 a 100
  tax_amount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: QuoteItem[];
}

export interface QuoteActivity {
  id: string;
  quote_id: string;
  user_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
