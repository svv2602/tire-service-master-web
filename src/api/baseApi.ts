import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import config from '../config';

// Создаем базовый query с поддержкой куки
const baseQuery = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
  credentials: 'include', // Важно для HttpOnly куки
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    const user = state.auth.user;
    
    // Краткое логирование только при необходимости
    if (process.env.NODE_ENV === 'development' && !token && !state.auth.isAuthenticated) {
      console.log('🔍 BaseAPI: Запрос без токена, используются cookies');
    }
    
    // Добавляем токен в заголовки, если он есть
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Обертка для обработки ошибок авторизации
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // Минимальное логирование только для auth запросов
  if (process.env.NODE_ENV === 'development') {
    const url = typeof args === 'string' ? args : args.url;
    if (url?.includes('auth/')) {
      console.log('🔐 Auth API запрос:', url);
    }
  }
  
  let result = await baseQuery(args, api, extraOptions);
  
  // Логирование только ошибок auth запросов
  if (process.env.NODE_ENV === 'development' && result.error) {
    const url = typeof args === 'string' ? args : args.url;
    if (url?.includes('auth/')) {
      console.log('❌ Auth API ошибка:', result.error.status, url);
    }
  }
  
  if (result.error && result.error.status === 401) {
    // Пытаемся обновить токен
    const refreshResult = await baseQuery(
      {
        url: 'auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      // Извлекаем новый токен из ответа
      const newToken = (refreshResult.data as any)?.access_token || (refreshResult.data as any)?.tokens?.access;
      
      if (newToken) {
        // Обновляем токен в Redux store
        api.dispatch({ type: 'auth/updateAccessToken', payload: newToken });
      }
      
      // Повторяем исходный запрос
      result = await baseQuery(args, api, extraOptions);
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Client', 'Partner', 'Booking', 'ServicePoint', 'Review', 'CarType', 'Service', 'City', 'Region', 'Article', 'ServiceCategory', 'Settings', 'CarBrands', 'Availability', 'CarModels', 'ClientCars', 'PageContent', 'Partners', 'Schedule', 'ServicePointService', 'ServicePointPhoto', 'ServicePost', 'SchedulePreview', 'FavoritePoints', 'SeasonalSchedule', 'BookingConflict', 'BookingConflictStatistics', 'PushSubscription', 'PushNotification', 'TelegramSubscription', 'TelegramNotification', 'TelegramStatistics', 'Notification', 'NotificationStats'],
  endpoints: () => ({}),
});

// Хук для инвалидации кэша
export const useInvalidateCache = () => {
  const dispatch = baseApi.util.resetApiState;
  
  const invalidateTag = (tag: string) => {
    console.log('🔄 Инвалидация кэша для тега:', tag);
    // Полный сброс кэша (упрощенный подход)
    dispatch();
  };
  
  const invalidateList = (tags?: string[]) => {
    console.log('🔄 Инвалидация кэша для тегов:', tags);
    // Полный сброс кэша (упрощенный подход)
    dispatch();
  };
  
  return {
    invalidateTag,
    invalidateList
  };
};