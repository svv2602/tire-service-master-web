// Импорты
import type { Client, ClientCar, ClientsState } from './client';
import type { User } from './user';
import { UserRole } from './user-role';

// Экспорты
export { UserRole } from './user-role';
export type { User } from './user';
export * from './client';

// Типы для бронирований
export interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status_id: number;
  payment_status_id: number;
  service_point_id: number;
  client_id: number;
  car_type_id: number;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  notes?: string;
  client?: Client;
  service_point?: ServicePoint;
  car?: ClientCar;
  car_type?: CarType;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
}

export interface BookingStatus {
  id: number;
  name: string;
  color: string;
}

export interface PaymentStatus {
  id: number;
  name: string;
  color: string;
}

// Типы для точек обслуживания
export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  city_id: number;
  partner_id: number;
  is_active: boolean;
  work_status: 'open' | 'closed' | 'temporarily_closed';
  created_at: string;
  updated_at: string;
  city?: City;
  partner?: Partner;
  photos?: ServicePointPhoto[];
  amenities?: Amenity[];
}

export interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  photo_url: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

// Типы для партнеров
export interface Partner {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для авто
export interface CarType {
  id: number;
  name: string;
  description?: string;
}

export interface CarBrand {
  id: number;
  name: string;
  logo_url?: string;
}

export interface CarModel {
  id: number;
  name: string;
  brand_id: number;
  brand?: CarBrand;
}

// Типы для локаций
export interface City {
  id: number;
  name: string;
  region_id: number;
  region?: Region;
  is_active?: boolean;
}

export interface Region {
  id: number;
  name: string;
  is_active?: boolean;
}

// Типы для Redux состояний
export interface RootState {
  auth: AuthState;
  partners: PartnersState;
  servicePoints: ServicePointsState;
  clients: ClientsState;
  bookings: BookingsState;
  users: UsersState;
  regions: RegionsState;
  cities: CitiesState;
  carBrands: CarBrandsState;
  carModels: CarModelsState;
  serviceCategories: ServiceCategoriesState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PartnersState {
  partners: Partner[];
  selectedPartner: Partner | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface ServicePointsState {
  servicePoints: ServicePoint[];
  selectedServicePoint: ServicePoint | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface RegionsState {
  regions: Region[];
  selectedRegion: Region | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface CitiesState {
  cities: City[];
  selectedCity: City | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  filteredByRegion: City[];
}

export interface CarBrandsState {
  carBrands: CarBrand[];
  selectedCarBrand: CarBrand | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface CarModelsState {
  carModels: CarModel[];
  selectedCarModel: CarModel | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  filteredByBrand: CarModel[];
}

export interface ServiceCategoriesState {
  serviceCategories: ServiceCategory[];
  selectedServiceCategory: ServiceCategory | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

// Типы для пагинации
export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// Типы для фильтров
export interface BaseFilter {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
}

// Типы для отзывов
export interface Review {
  id: number;
  client_id: number;
  service_point_id: number;
  rating: number;
  comment: string;
  reply?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  service_point?: ServicePoint;
}

// Типы для контента страниц
export interface PageContent {
  id: number;
  page_key: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для статей
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category_id?: number;
  category?: ArticleCategory;
}

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Типы для настроек
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  group?: string;
  created_at: string;
  updated_at: string;
}

// Типы для уведомлений
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  related_id?: number;
  related_type?: string;
  created_at: string;
  updated_at: string;
}