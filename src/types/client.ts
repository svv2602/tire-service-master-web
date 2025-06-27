import { BaseModel } from './models';
import { User } from './user';
import { CarBrand, CarModel } from './car';

// Интерфейс клиента
export interface Client extends BaseModel {
  user_id: number;
  preferred_notification_method?: 'push' | 'email' | 'sms';
  marketing_consent?: boolean;
  user?: User;
  cars?: ClientCar[];
  name?: string;
  // Добавляем прямые доступы к полям пользователя для обратной совместимости
  get first_name(): string;
  get last_name(): string;
  get middle_name(): string | undefined;
  get email(): string | undefined;
  get phone(): string | undefined;
  get is_active(): boolean;
}

// Интерфейс для формы клиента
export interface ClientFormData {
  user_attributes: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  };
  preferred_notification_method?: 'push' | 'email' | 'sms';
  marketing_consent?: boolean;
}

// Интерфейс для фильтрации клиентов
export interface ClientFilter {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Интерфейс автомобиля клиента
export interface ClientCar extends BaseModel {
  client_id: number;
  brand_id: number;
  model_id: number;
  year: number;
  is_primary: boolean;
  license_plate: string;
  car_type_id?: number;
  tire_type_id?: number;
  brand?: CarBrand;
  model?: CarModel;
  tire_type?: TireType;
}

// Тип шин
export interface TireType {
  id: number;
  name: string;
  description?: string;
}

// Состояние клиентов в Redux
export interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Интерфейс для формы автомобиля клиента
export interface ClientCarFormData {
  brand_id: number;
  model_id: number;
  year: number;
  license_plate: string;
  car_type_id?: number;
  is_primary?: boolean;
}

// Интерфейс для фильтрации автомобилей клиента
export interface ClientCarFilter {
  client_id?: number;
  query?: string;
  page?: number;
  per_page?: number;
}

// Интерфейсы для API
export interface ClientCreateData {
  user: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    password: string;
    password_confirmation: string;
  };
  client: {
    preferred_notification_method?: 'push' | 'email' | 'sms';
    marketing_consent?: boolean;
  };
}

export interface ClientUpdateData {
  user: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  };
} 