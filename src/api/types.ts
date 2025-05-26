import { Partner, City } from '../types/models';

// Типы для пользователей
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для авторизации
export interface UserCredentials {
  email: string;
  password: string;
}

// Типы для регистрации
export interface UserRegistration extends UserCredentials {
  first_name: string;
  last_name: string;
  phone?: string;
}

// Типы для сброса пароля
export interface PasswordReset {
  email: string;
  reset_token?: string;
  new_password?: string;
}

export type { AxiosResponse } from 'axios';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export interface TireType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CarType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  service_point_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: User;
  service_point?: ServicePoint;
}

export interface Schedule {
  id: number;
  service_point_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  url: string;
  description?: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePointService {
  id: number;
  service_point_id: number;
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category?: ServiceCategory;
  created_at: string;
  updated_at: string;
}

export interface ServicePoint {
  id: number;
  partner_id: number;
  name: string;
  description?: string;
  city_id: number;
  address: string;
  contact_phone: string;
  is_active: boolean;
  post_count: number;
  default_slot_duration: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  review_count?: number;
  partner?: Partner;
  city?: City;
  schedule: Array<{
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_working_day: boolean;
    created_at: string;
    updated_at: string;
  }>;
  services: Array<{
    id: number;
    service_id: number;
    price: number;
    duration: number;
    is_available: boolean;
    service?: Service;
    created_at: string;
    updated_at: string;
  }>;
  photos: Array<{
    id: number;
    url: string;
    description?: string;
    is_main: boolean;
    created_at: string;
    updated_at: string;
  }>;
  reviews: Array<{
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    user?: User;
    created_at: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
}
