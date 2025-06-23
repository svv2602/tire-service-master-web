import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import config from '../config';

// Создаем базовый query с обработкой ошибок и авторизации
export const baseQuery = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
  prepareHeaders: (headers, { getState }) => {
    // Получаем токен из localStorage для обеспечения актуальности
    const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
    
    // Получаем токен из Redux состояния (если есть)
    const state = getState() as RootState;
    const stateToken = state.auth?.accessToken;
    
    // Используем токен из Redux состояния или из localStorage
    const accessToken = stateToken || token;
    
    if (accessToken) {
      // Убираем префикс Bearer если он уже есть
      const formattedToken = accessToken.replace(/^Bearer\s+/i, '').trim();
      headers.set('authorization', `Bearer ${formattedToken}`);
      
      // Если токены не совпадают, обновляем localStorage
      if (stateToken && token !== stateToken) {
        localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, stateToken);
      }
    }
    
    // Отладочная информация в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('baseQuery prepareHeaders:', {
        hasLocalStorageToken: !!token,
        hasStateToken: !!stateToken,
        tokenSource: stateToken ? 'redux' : (token ? 'localStorage' : 'none')
      });
    }
    
    return headers;
  },
  credentials: 'include', // Изменено с 'same-origin' на 'include' для поддержки кросс-доменных куки
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
