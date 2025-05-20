// Типы пользователей
export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'operator',
  MANAGER = 'manager',
  CLIENT = 'client'
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Типы для партнеров
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
  user?: User;
}

export interface PartnersState {
  partners: Partner[];
  selectedPartner: Partner | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Типы для сервисных точек
export interface ServicePoint {
  id: number;
  partner_id: number;
  name: string;
  description?: string;
  city_id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  status_id: number;
  post_count: number;
  default_slot_duration: number;
  rating: number;
  total_clients_served: number;
  average_rating: number;
  cancellation_rate: number;
  city?: City;
  partner?: Partner;
  status?: ServicePointStatus;
  photos?: ServicePointPhoto[];
  amenities?: Amenity[];
}

export interface ServicePointStatus {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  photo_url: string;
  sort_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface ServicePointsState {
  servicePoints: ServicePoint[];
  selectedServicePoint: ServicePoint | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Типы для клиентов
export interface Client {
  id: number;
  user_id: number;
  preferred_notification_method: 'push' | 'email' | 'sms';
  marketing_consent: boolean;
  user?: User;
  cars?: ClientCar[];
}

export interface ClientCar {
  id: number;
  client_id: number;
  brand_id: number;
  model_id: number;
  year: number;
  is_primary: boolean;
  license_plate?: string;
  tire_type_id?: number;
  brand?: CarBrand;
  model?: CarModel;
  tire_type?: TireType;
}

export interface CarBrand {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
}

export interface TireType {
  id: number;
  name: string;
  description?: string;
}

export interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Типы для бронирований
export interface Booking {
  id: number;
  client_id: number;
  service_point_id: number;
  car_id?: number;
  car_type_id?: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status_id: number;
  payment_status_id?: number;
  cancellation_reason_id?: number;
  cancellation_comment?: string;
  total_price?: number;
  payment_method?: string;
  notes?: string;
  client?: Client;
  service_point?: ServicePoint;
  car?: ClientCar;
  car_type?: CarType;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  cancellation_reason?: CancellationReason;
  booking_services?: BookingService[];
}

export interface BookingStatus {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentStatus {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface CancellationReason {
  id: number;
  name: string;
  description?: string;
  for_client: boolean;
  for_partner: boolean;
  is_active: boolean;
}

export interface BookingService {
  id: number;
  booking_id: number;
  service_id: number;
  quantity: number;
  price: number;
  service?: Service;
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  is_active: boolean;
  category?: ServiceCategory;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

export interface CarType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Типы для локаций
export interface Region {
  id: number;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface City {
  id: number;
  region_id: number;
  name: string;
  is_active: boolean;
  region?: Region;
}

// Общее состояние приложения
export interface RootState {
  auth: AuthState;
  partners: PartnersState;
  servicePoints: ServicePointsState;
  clients: ClientsState;
  bookings: BookingsState;
} 