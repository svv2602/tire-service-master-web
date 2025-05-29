import { InternalAxiosRequestConfig } from 'axios';
import { User } from './user';
import { PaginationFilter } from './models';

// Расширяем конфигурацию axios
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Общий тип для пагинации
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
}

// Общий тип для ответа API
export interface ApiResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Общий тип для фильтров
export interface BaseFilter {
  page?: number;
  per_page?: number;
}

// Фильтр для городов
export interface CityFilter extends PaginationFilter {
  query?: string;
  region_id?: number;
}

// Фильтр для регионов
export interface RegionFilter extends BaseFilter {
  query?: string;
}

// Фильтр для сервисных точек
export interface ServicePointFilter extends BaseFilter {
  city_id?: string | number;
  region_id?: string | number;
  query?: string;
}

// Фильтр для клиентов
export interface ClientFilter extends BaseFilter {
  query?: string;
}

// Фильтр для бронирований
export interface BookingFilter extends BaseFilter {
  service_point_id?: string | number;
  client_id?: string | number;
  date_from?: string;
  date_to?: string;
  status?: string;
}

// Фильтр для отзывов
export interface ReviewFilter extends BaseFilter {
  service_point_id?: string | number;
  client_id?: string | number;
  rating?: number;
}

// Интерфейс для ошибки API
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Класс для ошибок запросов к API
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public code: string = 'API_ERROR',
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// Класс для ошибок сети
export class NetworkError extends Error {
  constructor(message: string = 'Ошибка сети') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Класс для ошибок аутентификации
export class AuthenticationError extends Error {
  constructor(message: string = 'Ошибка аутентификации') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Интерфейс для пагинации (старый формат)
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Интерфейс для реального формата API
export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

// Интерфейс для ответа с фотографиями сервисной точки
export interface ServicePointPhotoResponse {
  id: number;
  url: string;
  thumbnail_url: string;
  photo_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string | number | boolean>;
}

// Базовый интерфейс для поисковых параметров
export interface SearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// Удаляем дублирующий экспорт
// export type { QueryParams } from './api-requests'; 