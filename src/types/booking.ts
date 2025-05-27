import { BaseModel } from './models';
import { User } from './user';
import { ServicePoint } from './servicePoint';
import { CarBrand, CarModel } from './car';

export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type BookingStatus = BookingStatusEnum;

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
  services: {
    service_id: string;
    quantity: number;
    price: number;
  }[];
  status: BookingStatus;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  serviceId: string;
  price: number;
  duration: number;
}

export interface BookingFormData {
  client_id: string;
  service_point_id: string;
  car_id?: string;
  car_type_id: string;
  scheduled_at: string;
  notes?: string;
  status: BookingStatus;
}

export interface BookingFilter {
  query?: string;
  status?: BookingStatus;
  service_point_id?: string;
  page?: number;
  per_page?: number;
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

// Типы статусов платежей
export interface PaymentStatus {
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