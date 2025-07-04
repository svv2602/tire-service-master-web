import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { config } from '../config';

// Создаем базовый query
const baseQuery = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}`,
  credentials: 'include', // Включаем передачу cookies для cookie-based аутентификации
  prepareHeaders: (headers, { getState }) => {
    // При cookie-based аутентификации:
    // - Access токен может передаваться в заголовке Authorization (из Redux state) ИЛИ через cookies
    // - Cookies автоматически отправляются благодаря credentials: 'include'
    const state = getState() as any;
    const token = state.auth?.accessToken;
    const isAuthenticated = state.auth?.isAuthenticated;
    const user = state.auth?.user;
    
    // Если токен есть в Redux состоянии, добавляем его в заголовок
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Отладочная информация только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('BaseAPI prepareHeaders:', {
        hasAccessToken: !!token,
        isAuthenticated: !!isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует (используются cookies)',
        url: 'unknown',
        method: 'unknown'
      });
    }
    
    return headers;
  },
});

// Создаем baseQuery с автоматическим обновлением токенов
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Если получили 401 ошибку, пытаемся обновить токен
  if (result.error && result.error.status === 401) {
    console.log('BaseQuery: получена 401 ошибка, пытаемся обновить токен');
    
    // Пытаемся обновить токен
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        credentials: 'include',
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      console.log('BaseQuery: токен успешно обновлен');
      
      // Обновляем токен в состоянии
      const refreshData = refreshResult.data as any;
      if (refreshData.access_token || refreshData.tokens?.access) {
        // Импортируем action из authSlice
        const { updateAccessToken } = await import('../store/slices/authSlice');
        const newToken = refreshData.access_token || refreshData.tokens.access;
        
        // Обновляем токен в Redux состоянии
        api.dispatch(updateAccessToken(newToken));
        
        // localStorage больше не используем
        console.log('BaseQuery: токен обновлен в Redux');
      }
      
      // Повторяем оригинальный запрос
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log('BaseQuery: не удалось обновить токен, выходим из системы');
      // Если не удалось обновить токен, очищаем состояние
      const { logout } = await import('../store/slices/authSlice');
      api.dispatch(logout());
    }
  }
  
  return result;
};

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
  | 'Clients'
  | 'Booking' 
  | 'Review'
  | 'Availability'
  | 'CarBrands'
  | 'CarModels'
  | 'ClientCars'
  | 'CarType'
  | 'Schedule'
  | 'ServicePointPhoto'
  | 'ServiceCategory'
  | 'ServicePost'
  | 'ServicePointService'
  | 'SchedulePreview'
  | 'Settings'
  | 'CTAContent';

// Базовый API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
    'Clients',
    'Booking', 
    'Review',
    'Availability',
    'CarBrands',
    'CarModels',
    'ClientCars',
    'CarType',
    'Schedule',
    'ServicePointPhoto',
    'ServiceCategory',
    'ServicePost',
    'ServicePointService',
    'SchedulePreview',
    'Settings',
    'CTAContent'
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