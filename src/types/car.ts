export interface CarBrand {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
  is_active: boolean;
  is_popular: boolean;
  models_count: number;
  created_at: string;
  updated_at: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_popular: boolean;
  year_start?: number;
  year_end?: number;
  brand?: CarBrand;
  created_at: string;
  updated_at: string;
}

export interface CarBrandFormData {
  name: string;
  code: string;
  logo_url?: string;
  is_active?: boolean;
  is_popular?: boolean;
}

export interface CarModelFormData {
  brand_id: number;
  name: string;
  code: string;
  is_active?: boolean;
  is_popular?: boolean;
  year_start?: number;
  year_end?: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  client_id: string;
  car_type_id: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
} 