export interface Partner {
  id: string;
  user_id: number;
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id: number;
  city_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  user?: {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  region?: {
    id: string;
    name: string;
  };
  city?: {
    id: string;
    name: string;
  };
}

export interface PartnerFormData {
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id?: number;
  city_id?: number;
  is_active?: boolean;
  user?: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    password?: string;
  };
}

export interface PartnerFilter {
  query?: string;
  status?: string;
  page?: number;
  per_page?: number;
} 