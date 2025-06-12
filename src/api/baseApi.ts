import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

// Функция для получения токена из различных возможных ключей
const getAuthToken = (): string | null => {
  // Пробуем разные ключи, которые могут использоваться в приложении
  const possibleKeys = [
    config.AUTH_TOKEN_STORAGE_KEY, // основной ключ из конфига
    'tvoya_shina_auth_token',      // альтернативный ключ
    'tvoya_shina_token',           // основной ключ
    'auth_token',                  // общий ключ
    'access_token'                 // другой возможный ключ
  ];
  
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`🔑 Токен найден в localStorage под ключом: ${key}`);
      return token;
    }
  }
  
  console.log('❌ Токен не найден ни под одним из ключей:', possibleKeys);
  return null;
};

// Создаем базовый запрос с логированием
const baseQueryWithLogging = fetchBaseQuery({
  baseUrl: `${config.API_URL}${config.API_PREFIX}`,
  prepareHeaders: (headers, { endpoint, type }) => {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log(`🔐 [${endpoint}] Добавлен Authorization header с токеном`);
    } else {
      console.log(`⚠️ [${endpoint}] Токен отсутствует, запрос без авторизации`);
    }
    headers.set('Accept', 'application/json');
    
    // НЕ устанавливаем Content-Type для FormData - браузер сделает это автоматически
    // Это важно для правильной обработки multipart/form-data на сервере
    console.log(`📡 [${endpoint}] Подготовка headers для ${type}`);
    return headers;
  },
});

// Оборачиваем базовый запрос для логирования
const baseQueryWithDebug = async (args: any, api: any, extraOptions: any) => {
  console.log('🚀 RTK Query Request:', {
    endpoint: api.endpoint,
    args: args,
    method: args.method || 'GET',
    url: args.url || args,
    body: args.body
  });
  
  const result = await baseQueryWithLogging(args, api, extraOptions);
  
  console.log('📨 RTK Query Response:', {
    endpoint: api.endpoint,
    status: result.meta?.response?.status,
    success: !result.error,
    error: result.error,
    data: result.data
  });
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithDebug,
  tagTypes: [
    'Region',
    'Booking',
    'CarBrands',
    'CarModels',
    'ServicePoint',
    'ServicePost',
    'City',
    'Client',
    'Review',
    'Partners',
    'Service',
    'ServiceCategory',
    'Settings',
    'User',
    'ClientCars',
    'Schedule',
    'ServicePointPhoto',
    'ServicePointService',
    'Availability',
    'SchedulePreview',
    'Article',
    'PageContent',
    'ServiceItem',
    'HeroContent',
    'CTAContent'
  ],
  endpoints: () => ({}),
});