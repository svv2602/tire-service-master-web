import { ServiceCategory } from './models';

export interface Service {
  id: number;
  name: string;
  description?: string;
  default_duration: number;
  duration?: number; // для совместимости с некоторыми API
  price?: number; // для цены услуги
  category_id: number;
  category?: ServiceCategory;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  default_duration: number; // сделано обязательным снова
  is_active: boolean;
  sort_order?: number;
}

export interface ServiceCategoryData {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order?: number;
  services_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
  is_active: boolean;
  sort_order?: number;
}

// Ответы API
export interface ServicesResponse {
  data: Service[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface ServiceCategoriesResponse {
  data: ServiceCategoryData[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
} 