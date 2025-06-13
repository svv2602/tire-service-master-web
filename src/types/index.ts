// Типы для аутентификации
export { UserRole } from './user-role';

// Types for car brands
export interface CarBrand {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
  is_active: boolean;
  is_popular: boolean;
  models_count: number;
  car_models?: CarModel[];
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_popular: boolean;
  year_start?: number;
  year_end?: number;
  brand?: CarBrand;
}

// Types for regions and cities
export interface Region {
  id: number;
  name: string;
  code?: string;
  is_active: boolean;
  cities?: City[];
}

export interface RegionsState {
  regions: Region[];
  selectedRegion: Region | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

export interface City {
  id: number;
  region_id: number;
  name: string;
  code?: string;
  is_active: boolean;
  region?: {
    id: number;
    name: string;
    code?: string;
    is_active: boolean;
  };
}

export interface CitiesState {
  cities: City[];
  selectedCity: City | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
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
}

export interface UserCredentials {
  email: string;
  password: string;
}

// Основные типы пользователей
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  role: string;
  client_id?: number;
  partner_id?: number;
  manager_id?: number;
  is_active?: boolean;
  last_login?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  profile?: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
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
  address?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  region_id?: number;
  city_id?: number;
  region?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
  user?: User;
  description?: string;
  additional_info?: string;
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
  services?: {
    id: number;
    name: string;
    price: number;
    category_id?: number;
    category?: ServiceCategory;
  }[];
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
  name: string;
  description?: string;
  category_id: number;
  default_duration: number;
  is_active: boolean;
  sort_order: number;
  category?: ServiceCategory;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
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

// Состояние для пользователей
export interface UsersState {
  users: User[];
  selectedUser: User | null;
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
  cities?: City[];
}

// Types for cities
export interface City {
  id: number;
  region_id: number;
  name: string;
  code?: string;
  is_active: boolean;
  region?: {
    id: number;
    name: string;
    code?: string;
    is_active: boolean;
  };
}

export interface CitiesState {
  cities: City[];
  selectedCity: City | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Общее состояние приложения
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
  services: ServicesState;
  dashboard: DashboardState;
}

export interface RegionsState {
  regions: Region[];
  selectedRegion: Region | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Redux стейт для услуг
export interface ServicesState {
  services: Service[];
  selectedService: Service | null;
  serviceCategories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Redux стейт для дашборда
export interface DashboardState {
  stats: {
    partners_count: number;
    service_points_count: number;
    clients_count: number;
    bookings_count: number;
    completed_bookings_count: number;
    canceled_bookings_count: number;
    bookings_by_month: number[];
    revenue_by_month: number[];
  } | null;
  loading: boolean;
  error: string | null;
}

// Типы для управления контентом клиентских страниц
export interface PageContentBlock {
  id: string;
  type: 'hero' | 'services' | 'cta' | 'text' | 'features' | 'testimonials';
  title: string;
  subtitle?: string;
  content: any; // Гибкая структура для разных типов контента
  isActive: boolean;
  order: number;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    showIcon?: boolean;
    itemsPerRow?: number;
    maxItems?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: string;
  pageName: string; // 'main', 'services', 'about', etc.
  pageTitle: string;
  pageDescription: string;
  blocks: PageContentBlock[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string; // Можно хранить название иконки или emoji
  price: {
    min: number;
    max: number;
  };
  duration: string;
  features: string[];
  isPopular: boolean;
  category: string;
  isActive: boolean;
  order: number;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  buttonText: string;
  buttonLink: string;
  showSearch: boolean;
}

export interface CTAContent {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
}