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
    
    // 🔍 ПОДРОБНОЕ ЛОГИРОВАНИЕ
    console.log('🔍 BaseAPI prepareHeaders:', {
      hasAccessToken: !!token,
      isAuthenticated: state.auth.isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует (используются cookies)',
      baseUrl: `${config.API_URL}${config.API_PREFIX}/`,
      headersCount: headers.entries ? Array.from(headers.entries()).length : 'unknown'
    });
    
    // Добавляем токен в заголовки, если он есть
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('✅ Добавлен Authorization header с токеном');
    } else {
      console.log('ℹ️ Токен отсутствует, полагаемся на cookies');
    }
    
    return headers;
  },
});

// Обертка для обработки ошибок авторизации
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // 🔍 ЛОГИРОВАНИЕ ЗАПРОСА
  console.log('🚀 BaseAPI запрос:', {
    url: typeof args === 'string' ? args : args.url,
    method: typeof args === 'string' ? 'GET' : args.method || 'GET',
    body: typeof args === 'string' ? undefined : args.body,
    fullUrl: `${config.API_URL}${config.API_PREFIX}/${typeof args === 'string' ? args : args.url}`,
    timestamp: new Date().toISOString()
  });
  
  let result = await baseQuery(args, api, extraOptions);
  
  // 🔍 ЛОГИРОВАНИЕ ОТВЕТА
  console.log('📥 BaseAPI ответ:', {
    status: result.error?.status || 'success',
    hasError: !!result.error,
    hasData: !!result.data,
    errorData: result.error?.data,
    timestamp: new Date().toISOString()
  });
  
  if (result.error && result.error.status === 401) {
    console.log('🔄 Получена 401 ошибка, пытаемся обновить токен...');
    
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
      console.log('✅ Токен успешно обновлен');
      // Повторяем исходный запрос
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log('❌ Не удалось обновить токен');
      // Можно добавить логику для перенаправления на страницу входа
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Client', 'Partner', 'Booking', 'ServicePoint', 'Review', 'CarType', 'Service', 'City', 'Region', 'Article', 'ServiceCategory', 'Settings', 'CarBrands', 'Availability', 'CarModels', 'ClientCars', 'PageContent', 'Partners', 'Schedule', 'ServicePointService', 'ServicePointPhoto', 'ServicePost', 'SchedulePreview', 'FavoritePoints', 'SeasonalSchedule'],
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