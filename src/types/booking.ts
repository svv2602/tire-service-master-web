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

export interface BookingFormData {
  service_category_id?: number;
  service_point_id: number | null;
  client_id: number | null; // ✅ Поддержка гостевых бронирований (может быть null)
  car_id: number | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status?: BookingStatus; // ✅ Строковый статус вместо status_id
  status_id?: BookingStatus; // ✅ Добавлен для совместимости с формами
  total_price?: string;
  payment_method?: string;
  notes?: string;
  car_type_id?: number;
  services: BookingService[];
  // ✅ Поля получателя услуги (для гостевых бронирований)
  service_recipient_first_name: string;
  service_recipient_last_name: string;
  service_recipient_phone: string;
  service_recipient_email?: string;
  // ✅ Поля данных автомобиля (для гостевых бронирований)
  car_brand?: string;
  car_model?: string;
  license_plate?: string;
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