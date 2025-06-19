import { BaseModel } from './models';

// Интерфейс клиента
export interface Client extends BaseModel {
  user_id?: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  cars?: ClientCar[];
}

// Интерфейс для формы клиента
export interface ClientFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
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
  clientId: string;
  brand: string | { id: number; name: string }; // Может быть строкой или объектом
  model: string | { id: number; name: string }; // Может быть строкой или объектом
  year: number;
  license_plate: string;
  client_id?: number;
}

// Интерфейс для формы автомобиля клиента
export interface ClientCarFormData {
  brand: string;
  model: string;
  year: number;
  license_plate: string;
}

// Интерфейс для фильтрации автомобилей клиента
export interface ClientCarFilter {
  client_id?: number;
  query?: string;
  page?: number;
  per_page?: number;
} 