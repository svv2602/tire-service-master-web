import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Создаем базовый query
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1`,
  credentials: 'include', // Включаем передачу cookies для cookie-based аутентификации
  prepareHeaders: (headers, { getState }) => {
    // При cookie-based аутентификации:
    // - Access токен может передаваться в заголовке Authorization (из Redux state) ИЛИ через cookies
    // - Cookies автоматически отправляются благодаря credentials: 'include'
    const state = getState() as any;
    const token = state.auth?.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Если токена нет в состоянии, API попытается использовать токен из cookies
    
    // ВАЖНО: НЕ устанавливаем Content-Type для FormData!
    // RTK Query автоматически определит FormData и не установит Content-Type,
    // позволяя браузеру установить правильные заголовки multipart/form-data
    
    // Отладочная информация только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('BaseAPI prepareHeaders:', {
        hasAccessToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует',
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
        api.dispatch(updateAccessToken(refreshData.access_token || refreshData.tokens.access));
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