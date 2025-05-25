import { CarBrand, CarModel, Service, ServiceCategory } from './models';
import { SearchParams } from './api';

// Базовые фильтры
export interface FilterParams {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Запросы для аутентификации
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  client: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    preferred_notification_method?: 'email' | 'phone' | 'push';
    marketing_consent?: boolean;
  };
}

// Запросы для пользователей
export interface CreateUserRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

// Запросы для работы с партнерами
export interface CreatePartnerRequest {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  partner: {
    company_name: string;
    company_description?: string;
    contact_person: string;
    logo_url?: string;
    website?: string;
    tax_number: string;
    legal_address: string;
  };
}

export interface UpdatePartnerRequest {
  company_name?: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
}

// Запросы для работы с сервисными точками
export interface CreateServicePointRequest {
  name: string;
  description?: string;
  address: string;
  city_id: number;
  latitude: number;
  longitude: number;
  working_hours: Array<{
    day: number;
    open_time: string;
    close_time: string;
    is_day_off: boolean;
  }>;
  amenity_ids?: number[];
}

export interface UpdateServicePointRequest {
  name?: string;
  description?: string;
  address?: string;
  city_id?: number;
  latitude?: number;
  longitude?: number;
  working_hours?: Array<{
    day: number;
    open_time: string;
    close_time: string;
    is_day_off: boolean;
  }>;
  amenity_ids?: number[];
}

// Запросы для работы с услугами
export interface CreateServiceRequest {
  name: string;
  description?: string;
  category_id: number;
  default_duration: number;
  default_price: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category_id?: number;
  default_duration?: number;
  default_price?: number;
  is_active?: boolean;
}

// Запросы для работы с категориями услуг
export interface CreateServiceCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  parent_id?: number;
}

export interface UpdateServiceCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  parent_id?: number;
}

// Запросы для клиентов
export interface CreateClientRequest {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

export interface UpdateClientRequest {
  user?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

// Запросы для брендов автомобилей
export interface CreateCarBrandRequest {
  name: string;
  code: string;
  logo_url?: string;
  is_active?: boolean;
  is_popular?: boolean;
}

export interface UpdateCarBrandRequest {
  name?: string;
  code?: string;
  logo_url?: string;
  is_active?: boolean;
  is_popular?: boolean;
}

// Запросы для моделей автомобилей
export interface CreateCarModelRequest {
  brand_id: number;
  name: string;
  code: string;
  is_active?: boolean;
  is_popular?: boolean;
  year_start?: number;
  year_end?: number;
}

export interface UpdateCarModelRequest {
  name?: string;
  code?: string;
  is_active?: boolean;
  is_popular?: boolean;
  year_start?: number;
  year_end?: number;
}

// Параметры поиска для различных сущностей
export interface ServicePointFilters extends SearchParams {
  city_id?: number;
  partner_id?: number;
  is_active?: boolean;
  has_photos?: boolean;
  amenity_ids?: number[];
}

export interface ServiceFilters extends SearchParams {
  category_id?: number;
  is_active?: boolean;
  price_min?: number;
  price_max?: number;
}

export interface PartnerFilters extends SearchParams {
  is_active?: boolean;
  city_id?: number;
} 