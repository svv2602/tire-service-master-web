import { BaseModel } from './models';
import { User } from './user';
import { ServicePoint } from './servicePoint';
import { CarBrand, CarModel } from './car';
import { PaginationFilter } from './models';

// ✅ НОВАЯ СИСТЕМА СТАТУСОВ - строковые ключи вместо числовых enum
export type BookingStatusKey = 
  | 'pending'
  | 'confirmed' 
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_client'
  | 'cancelled_by_partner'
  | 'no_show';

// ✅ Интерфейс статуса бронирования из API
export interface BookingStatusInfo {
  key: BookingStatusKey;
  name: string;
  description?: string;
  color: string;
}

// ✅ Обратная совместимость - теперь BookingStatus это строка
export type BookingStatus = BookingStatusKey | string;

// ✅ Константы статусов для удобства использования
export const BOOKING_STATUSES = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED_BY_CLIENT: 'cancelled_by_client' as const,
  CANCELLED_BY_PARTNER: 'cancelled_by_partner' as const,
  NO_SHOW: 'no_show' as const,
} as const;

// ✅ ВРЕМЕННАЯ СОВМЕСТИМОСТЬ: BookingStatusEnum для старого кода
export enum BookingStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled_by_client', // Для обратной совместимости
  CANCELLED_BY_CLIENT = 'cancelled_by_client',
  CANCELLED_BY_PARTNER = 'cancelled_by_partner',
  NO_SHOW = 'no_show'
}

export interface ServiceRecipient {
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email?: string;
}

export interface Booking {
  id: string;
  client_id: string;
  service_point_id: string;
  car_id: string | null;
  car_type_id: string;
  slot_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  status: BookingStatus; // ✅ Теперь это строка, а не числовой ID
  service_category_id?: number;
  service_category?: {
    id: number;
    name: string;
    description?: string;
  };
  service_point?: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    city?: {
      id: number;
      name: string;
    };
  };
  services: {
    service_id: string;
    quantity: number;
    price: number;
  }[];
  service_recipient?: ServiceRecipient;
  booking_services?: BookingServiceDetails[];
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  service_id: number;
  quantity: number;
  price: number;
}

export interface BookingServiceDetails {
  id: number;
  service_id: number;
  service_name: string;
  price: number;
  quantity: number;
  total_price: number;
}

// Добавляем интерфейс BookingFormData для форм бронирования
export interface BookingFormData {
  // Шаг 0: Выбор категории услуг
  service_category_id: number;
  
  // Шаг 1: Город и точка обслуживания
  city_id: number | null;
  service_point_id: number | null;
  
  // Шаг 2: Дата и время
  booking_date: string;
  start_time: string;
  duration_minutes?: number; // Длительность выбранного слота
  
  // Получатель услуги (обязательно)
  service_recipient: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  
  // Шаг 4: Тип автомобиля
  car_type_id: number | null;
  car_brand: string;
  car_model: string;
  license_plate: string;
  
  // Шаг 5: Услуги (опционально)
  services: Array<{
    service_id: number;
    quantity: number;
    price: number;
  }>;
  
  // Шаг 6: Комментарий (опционально)
  notes: string;
  
  // Дополнительные поля для API совместимости
  status_id?: string;
}

export interface BookingFilter extends PaginationFilter {
  query?: string;
  status?: BookingStatus; // ✅ Строковый статус
  service_point_id?: number;
  client_id?: number;
  service_category_id?: number;
  date?: string;
  from_date?: string;
  to_date?: string;
  city_id?: number;
  sort_by?: string;
  sort_order?: string;
}

// Типы статусов бронирования
export interface BookingStatusConfig {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Типы причин отмены
export interface CancellationReason {
  id: string;
  name: string;
  description?: string;
  is_for_client: boolean;
  is_for_partner: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
} 