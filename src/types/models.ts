import { UserRole } from './user-role';
import { BookingStatus } from './booking';
import type { Client, ClientCar as ClientCarType, ClientFilter as ClientFilterType } from './client';
import type { User } from './user';

// Базовый интерфейс для всех моделей
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// Интерфейс для метаданных пагинации
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

// Интерфейс для ответа API с пагинацией
export interface ApiResponse<T> {
  data: T[];
  total?: number;
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    total?: number;
  };
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    total?: number;
  };
}

export interface ApiResponseSingle<T> {
  data: T;
}

// Экспортируем все типы
export type {
  Client,
  ClientCarType as ClientCar,
  UserRole,
  BookingStatus
};

// Модель пользователя
export { User };

// Модель партнера
export interface Partner {
  id: number;
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  is_active: boolean;
  region_id?: number;
  city_id?: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

// Модель сервисной точки
export interface ServicePoint {
  id: number;
  partner_id: number;
  name: string;
  description?: string;
  address: string;
  phone: string;
  contact_phone?: string;
  email: string;
  working_hours: string | Record<string, { start: string; end: string }>;
  region_id: number;
  city_id: number;
  is_active: boolean;
  post_count?: number;
  default_slot_duration?: number;
  latitude?: number | null;
  longitude?: number | null;
  status_id?: number;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  partner?: Partner;
  region?: Region;
  city?: City;
  photos?: ServicePointPhoto[];
}

// Модель фотографии сервисной точки
export interface ServicePointPhoto extends BaseModel {
  service_point_id: number;
  url: string;
  photo_url?: string;
  description?: string;
  is_main: boolean;
  sort_order?: number;
}

// Модель рабочих часов
export interface WorkingHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

// Модель категории услуг
export interface ServiceCategory extends BaseModel {
  name: string;
  description?: string;
  is_active: boolean;
}

// Модель услуги
export interface Service extends BaseModel {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category_id: number;
  is_active: boolean;
  category?: ServiceCategory;
}

// Бренд автомобиля
export interface CarBrand extends BaseModel {
  name: string;
  code: string;
  logo_url?: string;
  is_active: boolean;
  is_popular: boolean;
  models_count: number;
}

// Модель автомобиля
export interface CarModel extends BaseModel {
  brand_id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_popular: boolean;
  year_start?: number;
  year_end?: number;
  brand: CarBrand;
}

// Регион
export interface Region {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Город
export interface City extends BaseModel {
  name: string;
  region_id: number;
  is_active: boolean;
  region?: Region;
}

// Бронирования
export interface Booking {
  id: number;
  service_point_id: number;
  client_id: number;
  service_type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  service_point?: ServicePoint;
  client?: Client;
  clientCar?: {
    carBrand?: CarBrand;
    carModel?: CarModel;
  };
}

// Интерфейсы для форм
export interface BookingFormData {
  service_point_id: number;
  service_type: string;
  scheduled_at: string;
}

export interface PartnerFormData {
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  is_active: boolean;
  region_id?: number;
  city_id?: number;
  user?: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string };
}

export interface CityFormData {
  name: string;
  code: string;
  region_id: number;
  is_active: boolean;
}

export interface RegionFormData {
  name: string;
  code: string;
  is_active: boolean;
}

// Типы для фильтров
export interface ServicePointFilter {
  search?: string;
  query?: string;
  status?: string;
  service_point_id?: string;
  city_id?: number | string;
  cityId?: number | string;
  region_id?: number | string;
  regionId?: number | string;
  page?: number;
  per_page?: number;
}

export interface PartnerFilter {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  region_id?: number;
  city_id?: number;
}

export interface ClientFilter {
  query?: string;
  client_id?: string;
  page?: number;
  per_page?: number;
}

export interface CityFilter {
  page?: number;
  per_page?: number;
  search?: string;
  query?: string;
  is_active?: boolean;
  region_id?: number;
}

export interface RegionFilter {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface ReviewFilter {
  query?: string;
  rating?: number;
  status?: ReviewStatus | string;
  service_point_id?: number;
  review_id?: string;
  page?: number;
  per_page?: number;
}

export interface BookingFilter {
  query?: string;
  status?: string;
  booking_id?: string;
  page?: number;
  per_page?: number;
}

// Статус сервисной точки
export interface ServicePointStatus extends BaseModel {
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
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

// Типы статусов отзывов
export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface Review {
  id: number;
  service_point_id: number;
  client_id: number;
  rating: number;
  comment: string;
  text?: string;
  response?: string;
  status?: ReviewStatus;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  service_point?: ServicePoint;
  client?: Client;
  booking?: Booking;
}

export interface ServicePointFormData {
  name: string;
  partner_id?: string;
  description?: string;
  address: string;
  phone?: string;
  contact_phone?: string;
  email?: string;
  working_hours?: string;
  region_id?: number;
  city_id?: number;
  is_active?: boolean;
  post_count?: number;
  default_slot_duration?: number;
  latitude?: number | null;
  longitude?: number | null;
  status_id?: number;
  schedule?: WorkingHours[];
  services?: ServicePointService[];
  photos?: ServicePointPhoto[];
}

// Модель удобств
export interface Amenity extends BaseModel {
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

// Модель автомобиля
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  client_id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  service_point_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdateData {
  response?: string;
  status?: ReviewStatus;
  rating?: number;
  comment?: string;
}