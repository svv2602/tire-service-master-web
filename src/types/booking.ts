import { BaseModel } from './models';
import { User } from './user';
import { ServicePoint } from './servicePoint';
import { CarBrand, CarModel } from './car';
import { PaginationFilter } from './models';

export enum BookingStatusEnum {
  PENDING = 1,
  COMPLETED = 2,
  CANCELLED = 3
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
  status_id: number;
  services: {
    service_id: string;
    quantity: number;
    price: number;
  }[];
  status: BookingStatus;
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
  service_point_id: number;
  client_id: number;
  car_id: number | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status_id?: number;
  total_price?: string;
  payment_method?: string;
  notes?: string;
  car_type_id?: number;
  services: BookingService[];
}

export interface BookingFilter extends PaginationFilter {
  query?: string;
  status_id?: number;
  service_point_id?: number;
  client_id?: number;
  date?: string;
  from_date?: string;
  to_date?: string;
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