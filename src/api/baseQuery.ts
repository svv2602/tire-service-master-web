import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { apiClient } from './api';

// Создаем базовый query с обработкой ошибок и авторизации
export const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/v1/',
  prepareHeaders: (headers, { getState }) => {
    // Получаем токен из состояния auth
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// Функция для проверки доступности API
export const checkApiAvailability = async () => {
  try {
    const response = await apiClient.get('/api/v1/health');
    return response.status === 200;
  } catch (error) {
    console.error('API недоступен:', error);
    return false;
  }
};
