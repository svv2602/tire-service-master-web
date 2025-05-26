import { UserRole } from './user-role';

// Базовая модель
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// Модель пользователя
export interface User extends BaseModel {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

// Модель партнера
export interface Partner {
  id: number;
  user_id: number;
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id?: number;
  city_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  user?: User;
  region?: Region;
  city?: City;
  
  // Дополнительные поля для обратной совместимости
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  additional_info?: string;
}

export interface PartnerFormData {
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id?: number | '';
  city_id?: number | '';
  
  // Данные пользователя (для создания нового партнера)
  user?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    password?: string;
  };
}

// Модель сервисной точки
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
  day: number;
  open_time: string;
  close_time: string;
  is_day_off: boolean;
}

// Модель удобств
export interface Amenity extends BaseModel {
  name: string;
  icon?: string;
  description?: string;
}

// Модель категории услуг
export interface ServiceCategory extends BaseModel {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Модель услуги
export interface Service extends BaseModel {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category?: ServiceCategory;
  created_at: string;
  updated_at: string;
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
export interface Region extends BaseModel {
  name: string;
  code: string;
  is_active: boolean;
  cities: City[];
}

// Город
export interface City extends BaseModel {
  region_id: number;
  name: string;
  is_active: boolean;
  region?: Region;
}

// Менеджеры
export interface Manager extends BaseModel {
  user: User;
  partner_id: number;
  position: string;
  access_level: number;
  service_points: ServicePoint[];
}

// Клиенты и автомобили
export interface Client extends BaseModel {
  user: User;
  cars: Car[];
  bookings_count: number;
}

export interface Car extends BaseModel {
  client_id: number;
  brand_id: number;
  brand: CarBrand;
  model_id: number;
  model: CarModel;
  year: number;
  registration_number: string;
  vin?: string;
}

// Бронирования
export interface Booking extends BaseModel {
  client_id: number;
  client: Client;
  service_point_id: number;
  service_point: ServicePoint;
  car_id: number;
  car: Car;
  services: BookingService[];
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  total_price: number;
  start_time: string;
  end_time: string;
  cancellation_reason?: string;
  notes?: string;
}

export interface BookingService extends BaseModel {
  booking_id: number;
  service_id: number;
  service: Service;
  quantity: number;
  price: number;
}

export interface BookingStatus extends BaseModel {
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentStatus extends BaseModel {
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
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
}