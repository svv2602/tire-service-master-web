import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import config from '../config';

// Создаем базовый query с обработкой ошибок и авторизации
export const baseQuery = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
  prepareHeaders: (headers, { getState }) => {
    // Получаем токен из localStorage для обеспечения актуальности
    const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
    
    if (token) {
      // Убираем префикс Bearer если он уже есть
      const formattedToken = token.replace(/^Bearer\s+/i, '').trim();
      headers.set('authorization', `Bearer ${formattedToken}`);
    }
    
    return headers;
  },
  credentials: 'same-origin', // Для поддержки куки в том же домене
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// Функция для проверки доступности API
export const checkApiAvailability = async () => {
  try {
    const response = await fetch(`${config.API_URL}${config.API_PREFIX}/health`);
    const isAvailable = response.ok;
    console.log(`API ${isAvailable ? 'доступен' : 'недоступен'} по адресу ${config.API_URL}`);
    return isAvailable;
  } catch (error) {
    console.error('API недоступен:', error);
    return false;
  }
};
