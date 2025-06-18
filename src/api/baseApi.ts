import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';

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
      // При cookie-based аутентификации:
      // - Access токен передается в заголовке Authorization (из Redux state)
      // - Refresh токен автоматически передается через HttpOnly cookies
      const state = getState() as any;
      const token = state.auth?.accessToken;
      const isInitialized = state.auth?.isInitialized;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      } else {
        // Если токен отсутствует, но есть пользователь в localStorage,
        // возможно нужно восстановить сессию
        const hasStoredUser = !!localStorage.getItem('tvoya_shina_user');
        if (hasStoredUser && isInitialized) {
          console.warn('BaseAPI: Токен отсутствует, но пользователь есть в localStorage. Возможно нужен refresh.');
        } else if (!isInitialized) {
          console.log('BaseAPI: Аутентификация еще не инициализирована');
        } else {
          console.warn('BaseAPI: Токен отсутствует в Redux state');
        }
      }
      
      // ВАЖНО: НЕ устанавливаем Content-Type для FormData!
      // RTK Query автоматически определит FormData и не установит Content-Type,
      // позволяя браузеру установить правильные заголовки multipart/form-data
      
      // Отладочная информация только в режиме разработки
      if (process.env.NODE_ENV === 'development') {
        console.log('BaseAPI prepareHeaders:', {
          hasAccessToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует',
          url: (getState() as any).api?.config?.url || 'unknown',
          method: (getState() as any).api?.config?.method || 'unknown'
        });
      }
      
      return headers;
    },
    // Включаем cookies для всех запросов (используется для refresh токена)
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
  const dispatch = useDispatch();
  
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