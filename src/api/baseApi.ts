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
// Защита от зацикливания refresh запросов
let isRefreshing = false;
let lastRefreshTime = 0;

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
    
    // Защита от зацикливания - увеличиваем интервал до 15 секунд
    const now = Date.now();
    if (isRefreshing || (now - lastRefreshTime < 15000)) {
      console.warn('⚠️ Refresh токена уже выполняется или был недавно, пропускаем', {
        isRefreshing,
        timeSinceLastRefresh: now - lastRefreshTime,
        timestamp: new Date().toISOString()
      });
      return result;
    }

    // Проверяем, что это не запрос на refresh (избегаем бесконечный цикл)
    const requestUrl = typeof args === 'string' ? args : args.url;
    if (requestUrl === 'auth/refresh') {
      console.log('❌ Ошибка refresh запроса, выходим из системы');
      api.dispatch({ type: 'auth/logout' });
      return result;
    }

    isRefreshing = true;
    lastRefreshTime = now;
    
    try {
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
        
        // Извлекаем новый токен из ответа
        const newToken = (refreshResult.data as any)?.access_token || (refreshResult.data as any)?.tokens?.access;
        
        if (newToken) {
          // Обновляем токен в Redux store
          api.dispatch({ type: 'auth/updateAccessToken', payload: newToken });
          console.log('🔄 Токен обновлен в Redux store');
        }
        
        // Повторяем исходный запрос
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.log('❌ Не удалось обновить токен');
        api.dispatch({ type: 'auth/logout' });
      }
    } finally {
      isRefreshing = false;
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Client', 'Partner', 'Booking', 'ServicePoint', 'Review', 'CarType', 'Service', 'City', 'Region', 'Article', 'ServiceCategory', 'Settings', 'CarBrands', 'Availability', 'CarModels', 'Notification', 'NotificationStats', 'ClientCars', 'PageContent', 'Partners', 'Schedule', 'ServicePointService', 'ServicePointPhoto', 'ServicePost', 'SchedulePreview', 'FavoritePoints', 'SeasonalSchedule', 'BookingConflict', 'BookingConflictStatistics', 'EmailTemplate', 'CustomVariable', 'TelegramSettings', 'TelegramSubscriptions', 'TelegramNotifications', 'NotificationChannelSettings', 'ChannelStatistics', 'SeoMetatag', 'Operator', 'OperatorAssignment', 'AuditLog', 'Order', 'PartnerApplication', 'TireSearch', 'Supplier', 'SupplierProducts', 'SupplierProduct', 'SupplierFilters', 'SupplierPriceVersions', 'TireCart', 'UnifiedTireCart', 'TireOrder', 'SupplierSizes'],
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

// ✅ Функция для полной очистки кэша с инвалидацией всех тегов
export const clearAllCacheData = (dispatch: any) => {
  console.log('🧹 Начинаем полную очистку кэша RTK Query...');
  
  // Все возможные теги в приложении
  const allTags = [
    'User', 'Client', 'Partner', 'Booking', 'ServicePoint', 'Review', 
    'CarType', 'Service', 'City', 'Region', 'Article', 'ServiceCategory', 
    'Settings', 'CarBrands', 'Availability', 'CarModels', 'Notification', 
    'NotificationStats', 'ClientCars', 'PageContent', 'Partners', 'Schedule', 
    'ServicePointService', 'ServicePointPhoto', 'ServicePost', 'SchedulePreview', 
    'FavoritePoints', 'SeasonalSchedule', 'BookingConflict', 'BookingConflictStatistics', 'Order',
    'Supplier', 'SupplierProducts', 'SupplierProduct', 'SupplierFilters',
    'TireCart', 'TireOrder'
  ] as const;
  
  // Инвалидируем каждый тег по отдельности
  allTags.forEach(tag => {
    try {
      dispatch(baseApi.util.invalidateTags([{ type: tag }]));
      console.log(`✅ Инвалидирован тег: ${tag}`);
    } catch (error) {
      console.warn(`⚠️ Ошибка инвалидации тега ${tag}:`, error);
    }
  });
  
  // Полный сброс состояния API
  try {
    dispatch(baseApi.util.resetApiState());
    console.log('✅ Полный сброс состояния API выполнен');
  } catch (error) {
    console.error('❌ Ошибка полного сброса состояния API:', error);
  }
  
  console.log('🧹 Полная очистка кэша RTK Query завершена');
};