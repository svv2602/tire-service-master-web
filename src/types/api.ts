import { InternalAxiosRequestConfig } from 'axios';
import { User } from './user';

// Расширяем конфигурацию axios
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Базовый интерфейс для ответа API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  errors?: Record<string, string[]>;
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