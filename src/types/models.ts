import { UserRole } from './user-role';
import { BookingStatus } from './booking';
import type { Client, ClientCar as ClientCarType, ClientFilter as ClientFilterType } from './client';
import type { User } from './user';
import type { WorkingHoursSchedule, WorkingHours } from './working-hours';
import { Article } from './articles';

// Базовый интерфейс для всех моделей
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// Интерфейс для пагинации
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

// Общий интерфейс для ответа API
export interface ApiResponse<T> {
  data: T[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  message?: string;
  status?: number;
}

// Базовый интерфейс для фильтров с пагинацией
export interface PaginationFilter {
  page?: number;
  per_page?: number;
}

export interface ApiResponseSingle<T> {
  data: T;
}

// Экспортируем все типы
export type {
  Client,
  ClientCarType as ClientCar,
  UserRole,
  BookingStatus,
  WorkingHoursSchedule,
  WorkingHours
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
  logo?: string; // Добавляем поле для URL Active Storage логотипа
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
  name: string;
  description?: string;
  address: string;
  city_id: number;
  partner_id: number;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  work_status: 'working' | 'temporarily_closed' | 'maintenance' | 'suspended';
  post_count: number;
  default_slot_duration: number;
  // Добавляем JSON поле для контактов по категориям
  category_contacts: {
    [categoryId: string]: {
      phone: string;
      email?: string;
    };
  };
  status?: {
    id: number;
    name: string;
    color?: string;
  };
  city?: {
    id: number;
    name: string;
    region_id: number;
    region?: {
      id: number;
      name: string;
      code: string;
    };
  };
  partner?: {
    id: number;
    name: string;
    company_name: string;
  };
  working_hours: WorkingHoursSchedule;
  services: ServicePointService[];
  photos: ServicePointPhoto[];
  service_posts?: ServicePost[];
}

// Модель категории услуг
export interface ServiceCategory extends BaseModel {
  name: string;
  description?: string;
  is_active: boolean;
  services_count?: number;
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
  sort_order?: number; // Добавляем поле для сортировки
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
  cities_count: number;
  created_at: string;
  updated_at: string;
}

// Город
export interface City {
  id: number;
  name: string;
  region_id: number;
  region?: Region;
  is_active: boolean;
  service_points_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Бронирования
export interface Booking {
  id: number;
  client_id: number;
  service_point_id: number;
  car_id: number | null;
  car_type_id: number;
  slot_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  services: {
    service_id: number;
    quantity: number;
    price: number;
  }[];
  status_id: number;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  service_point?: ServicePoint & {
    city?: {
      id: number;
      name: string;
    };
  };
  client?: Client;
  car?: Car;
  service_recipient?: {
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    email?: string;
  };
  service_category?: {
    id: number;
    name: string;
    description?: string;
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
  company_description: string | undefined;
  contact_person: string | undefined;
  logo_url: string | undefined;
  logo_file?: File; // Добавляем поле для загрузки файла логотипа
  website: string | undefined;
  tax_number: string | undefined;
  legal_address: string | undefined;
  is_active: boolean;
  region_id: number | undefined;
  city_id: number | undefined;
  user_attributes?: {
    id?: number;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    password?: string;
    password_confirmation?: string;
    role_id?: number;
  };
}

export interface CityFormData {
  name: string;
  region_id: number;
  is_active: boolean;
}

export interface RegionFormData {
  name: string;
  code: string;
  is_active: boolean;
}

// Типы для фильтров
export interface ServicePointFilter extends PaginationFilter {
  search?: string;
  query?: string;
  status?: string;
  service_point_id?: string;
  city_id?: number;
  region_id?: number;
}

export interface PartnerFilter extends PaginationFilter {
  query?: string;
  is_active?: boolean;
  region_id?: number;
  city_id?: number;
}

export interface ClientFilter extends PaginationFilter {
  query?: string;
  client_id?: string;
  active?: boolean;
}

export interface CityFilter extends PaginationFilter {
  region_id?: number;
  query?: string;
}

export interface RegionFilter extends PaginationFilter {
  search?: string;
  is_active?: boolean;
}

export interface ReviewFilter extends PaginationFilter {
  query?: string;
  rating?: number;
  status?: ReviewStatus | string;
  service_point_id?: number;
  review_id?: string;
}

export interface BookingFilter extends PaginationFilter {
  query?: string;
  status?: string;
  booking_id?: string;
}

// Статус сервисной точки
export interface ServicePointStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ServicePointService {
  id?: number;
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
  _destroy?: boolean;
  service?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
}

// Типы статусов отзывов
export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface Review {
  id: number;
  service_point_id: number;
  client_id: number;
  user_id?: number; // Для совместимости с frontend
  rating: number;
  comment: string;
  text?: string; // Алиас для comment
  response?: string;
  status: ReviewStatus;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты с полными данными
  service_point?: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  client?: {
    id: number;
    first_name: string;
    last_name: string;
    user?: {
      id: number;
      email: string;
      phone: string;
      first_name: string;
      last_name: string;
    };
  };
  booking?: {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
  };
}

export interface ServicePointFormData {
  name: string;
  description?: string;
  address: string;
  city_id: number;
  region_id?: number;
  partner_id: number;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone: string;
  status_id: number;
  post_count: number;
  default_slot_duration: number;
  working_hours: WorkingHoursSchedule;
  services: ServicePointService[];
  photos: Photo[];
}

export interface FormValues extends ServicePointFormData {
  // Дополнительные поля для формы, если нужны
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

export interface ServicePointCreateRequest extends Omit<ServicePointFormData, 'photos'> {
  photos: Photo[];
}

export interface ServicePointUpdateRequest extends ServicePointCreateRequest {
  id: number;
}

// Базовый интерфейс для фотографий
export interface BasePhoto {
  url: string;
  description?: string;
}

// Интерфейс для фотографий
export interface Photo {
  id?: number;
  url: string;
  description?: string;
  is_main: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  service_point_id?: number;
  file?: File;
}

// Интерфейс для фотографий сервисной точки
export interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  file?: string;
  url: string;
  description?: string;
  is_main: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  _destroy?: boolean;
}

// Интерфейс для постов обслуживания
export interface ServicePost {
  id?: number;
  service_point_id?: number; // Для обратной совместимости
  name: string;
  description?: string;
  slot_duration: number;
  is_active: boolean;
  post_number: number;
  // ОБЯЗАТЕЛЬНОЕ поле категории услуг (убираем ?)
  service_category_id: number;
  service_category?: ServiceCategory;
  _destroy?: boolean;
  created_at?: string; // Для обратной совместимости
  updated_at?: string; // Для обратной совместимости
  
  // Индивидуальное расписание поста
  has_custom_schedule?: boolean; // Использует ли пост собственное расписание
  working_days?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  custom_hours?: {
    start: string; // Время начала работы поста (может отличаться от времени точки)
    end: string;   // Время окончания работы поста (может отличаться от времени точки)
  };
}

// Расширенный интерфейс для новой формы сервисной точки
export interface ServicePointFormDataNew {
  name: string;
  description?: string;
  address: string;
  city_id: number;
  region_id?: number; // Добавляем поле region_id для каскадной загрузки
  partner_id: number;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone: string;
  is_active: boolean;
  work_status: 'working' | 'temporarily_closed' | 'maintenance' | 'suspended';
  working_hours: WorkingHoursSchedule;
  services?: ServicePointService[];
  photos?: ServicePointPhoto[];
  service_posts?: ServicePost[];
}

// Ответ API для статей
export interface ArticlesResponse {
  data: Article[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
  meta: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Ответ API для городов
export interface CitiesResponse {
  data: City[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Интерфейс для контактов по категориям
export interface CategoryContact {
  phone: string;
  email?: string;
}