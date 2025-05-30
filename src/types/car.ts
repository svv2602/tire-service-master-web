export interface CarBrand {
  id: number;
  name: string;
  logo: string | null;
  is_active: boolean;
  models_count: number;
  created_at: string;
  updated_at: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brand?: CarBrand;
}

export interface CarBrandFormData {
  name: string;
  logo?: File | null;
  is_active?: boolean;
}

export interface CarModelFormData {
  brand_id: number;
  name: string;
  is_active?: boolean;
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