import { UserRole } from './user-role';
import { BookingStatus } from './booking';
import type { Client, ClientCar as ClientCarType, ClientFilter as ClientFilterType } from './client';

// Базовый интерфейс для всех моделей
export interface BaseModel {
  id: string;
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
  total: number;
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
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
export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Модель партнера
export interface Partner {
  id: string;
  user_id: number;
  name?: string;
  company_name: string;
  company_description?: string;
  description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  phone?: string;
  email?: string;
  region_id: number;
  city_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты - делаем user более гибким для совместимости с API
  user?: User | {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  region?: Region;
  city?: City;
}

// Модель сервисной точки
export interface ServicePoint {
  id: string;
  partner_id: string;
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
  id: string;
  name: string;
  code?: string;
  is_active?: boolean;
}

// Город
export interface City {
  id: string;
  name: string;
  region_id: string;
  code?: string;
  is_active?: boolean;
  region?: Region;
}

// Бронирования
export interface Booking {
  id: string;
  service_point_id: string;
  client_id: string;
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
  service_point_id: string;
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
  query?: string;
  status?: string;
  service_point_id?: string;
  city_id?: number | string;
  region_id?: number | string;
  page?: number;
  per_page?: number;
}

export interface PartnerFilter {
  query?: string;
  status?: string;
  partner_id?: string;
  page?: number;
  per_page?: number;
}

export interface ClientFilter {
  query?: string;
  client_id?: string;
  page?: number;
  per_page?: number;
}

export interface CityFilter {
  query?: string;
  region_id?: string;
  page?: number;
  per_page?: number;
}

export interface RegionFilter {
  query?: string;
  page?: number;
  per_page?: number;
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
  id: string;
  service_point_id: string;
  client_id: string;
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

// Этот интерфейс перемещён в файл client.ts и импортирован как Client
// Не используется здесь больше, так как импортируется из client.ts
// Сохранен для справки
/*
export interface Client extends BaseModel {
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  user?: User;
  cars?: ClientCarType[];
*/
// }

// Модель удобств
export interface Amenity extends BaseModel {
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

// Модель автомобиля
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  client_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  service_point_id: string;
  booking_id?: string;
  rating: number;
  comment: string;
}

export interface ReviewUpdateData {
  response?: string;
  status?: ReviewStatus;
  rating?: number;
  comment?: string;
}