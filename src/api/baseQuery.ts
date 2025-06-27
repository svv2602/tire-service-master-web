import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import config from '../config';

// Создаем базовый query с обработкой ошибок и авторизации
export const baseQuery = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
  prepareHeaders: (headers, { getState }) => {
    // Получаем токен только из Redux состояния
    const state = getState() as RootState;
    const accessToken = state.auth?.accessToken;
    
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    
    // Отладочная информация в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('baseQuery prepareHeaders:', {
        hasToken: !!accessToken,
        tokenSource: accessToken ? 'redux' : 'none'
      });
    }
    
    return headers;
  },
  credentials: 'include', // Важно для работы с HttpOnly cookies
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// Функция для проверки доступности API
export const checkApiAvailability = async () => {
  try {
    const response = await fetch(`${config.API_URL}${config.API_PREFIX}/health`, {
      credentials: 'include' // Добавлено для согласованности с основными запросами
    });
    const isAvailable = response.ok;
    console.log(`API ${isAvailable ? 'доступен' : 'недоступен'} по адресу ${config.API_URL}`);
    return isAvailable;
  } catch (error) {
    console.error('API недоступен:', error);
    return false;
  }
};
