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
export interface Partner extends BaseModel {
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  is_active: boolean;
  user_id: number;
  user?: User;
  service_points_count?: number;
}

// Модель сервисной точки
export interface ServicePoint extends BaseModel {
  name: string;
  description?: string;
  address: string;
  city_id: number;
  partner_id: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
  phone?: string;
  email?: string;
  contact_phone?: string;
  working_hours: WorkingHours[];
  photos?: ServicePointPhoto[];
  amenities?: Amenity[];
  partner?: Partner;
  amenity_ids?: number[];
  service_ids?: number[];
  status_id?: number;
  
  // Дополнительные поля для совместимости с фронтендом
  post_count?: number;
  default_slot_duration?: number;
  rating?: number;
  total_clients_served?: number;
  average_rating?: number;
  cancellation_rate?: number;
  
  // Связанные объекты
  city?: City;
  status?: ServicePointStatus;
  services?: {
    id: number;
    name: string;
    price: number;
    category_id?: number;
    category?: ServiceCategory;
  }[];
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
  name: string;
  description?: string;
  icon?: string;
  parent_id?: number;
}

// Модель услуги
export interface Service extends BaseModel {
  name: string;
  description?: string;
  category_id: number;
  default_duration: number;
  default_price: number;
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
export interface Region extends BaseModel {
  name: string;
  code: string;
  cities_count: number;
}

// Город
export interface City extends BaseModel {
  region_id: number;
  name: string;
  code: string;
  is_active: boolean;
  region: Region;
  service_points_count: number;
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