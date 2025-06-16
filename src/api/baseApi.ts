import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Определяем типы тегов для типизации
export type ApiTags = 
  | 'Article' 
  | 'User' 
  | 'Partner' 
  | 'Partners'
  | 'ServicePoint' 
  | 'Service' 
  | 'Region' 
  | 'City' 
  | 'PageContent' 
  | 'Client' 
  | 'Booking' 
  | 'Review'
  | 'Availability'
  | 'CarBrands'
  | 'CarModels'
  | 'ClientCars'
  | 'Schedule'
  | 'ServicePointPhoto'
  | 'ServiceCategory'
  | 'ServicePost'
  | 'ServicePointService'
  | 'SchedulePreview'
  | 'Settings';

// Базовый API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      // Пытаемся получить токен из Redux state
      const token = (getState() as any).auth?.accessToken;
      
      // Если токена нет в Redux, пытаемся получить из localStorage с правильным ключом
      const fallbackToken = token || localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
      
      // Отладочная информация
      console.log('BaseAPI prepareHeaders:', {
        reduxToken: token ? `${token.substring(0, 20)}...` : 'отсутствует',
        localStorageToken: localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY) ? 
          `${localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY)!.substring(0, 20)}...` : 'отсутствует',
        finalToken: fallbackToken ? `${fallbackToken.substring(0, 20)}...` : 'отсутствует'
      });
      
      if (fallbackToken) {
        headers.set('authorization', `Bearer ${fallbackToken}`);
      }
      
      // Устанавливаем Content-Type для JSON запросов
      if (!headers.get('content-type')) {
        headers.set('content-type', 'application/json');
      }
      
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'Article', 
    'User', 
    'Partner', 
    'Partners',
    'ServicePoint', 
    'Service', 
    'Region', 
    'City', 
    'PageContent', 
    'Client', 
    'Booking', 
    'Review',
    'Availability',
    'CarBrands',
    'CarModels',
    'ClientCars',
    'Schedule',
    'ServicePointPhoto',
    'ServiceCategory',
    'ServicePost',
    'ServicePointService',
    'SchedulePreview',
    'Settings'
  ] as const,
  // Глобальные настройки кэширования
  keepUnusedDataFor: 300, // 5 минут (в секундах)
  refetchOnMountOrArgChange: true, // Обновлять данные при монтировании компонента
  refetchOnFocus: false, // Не обновлять данные при фокусе окна
  refetchOnReconnect: true, // Обновлять данные при восстановлении соединения
  endpoints: () => ({}),
});

// Хук для инвалидации кэша при изменениях
export const useInvalidateCache = () => {
  const { dispatch } = require('../store/store').store;
  
  return {
    // Инвалидация кэша для конкретного типа и ID
    invalidateTag: (type: ApiTags, id: string | number) => {
      dispatch(
        baseApi.util.invalidateTags([{ type, id }])
      );
    },
    
    // Инвалидация всего кэша для типа
    invalidateList: (type: ApiTags) => {
      dispatch(
        baseApi.util.invalidateTags([{ type, id: 'LIST' }])
      );
    },
    
    // Инвалидация всех тегов
    invalidateAll: () => {
      dispatch(
        baseApi.util.resetApiState()
      );
    }
  };
};