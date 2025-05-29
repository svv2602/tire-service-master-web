import { ServiceCategory } from './models';

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: ServiceCategory;
  category_id?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category_id: number;
  is_active: boolean;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
  is_active: boolean;
}

// Тип для связи сервиса с точкой обслуживания
export interface ServicePointService {
  id: number;
  service_point_id: number;
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServicesResponse {
  data: Service[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
} 