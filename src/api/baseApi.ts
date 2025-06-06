import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

// Функция для попытки обновления токена
const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('tvoya_shina_refresh_token');
  if (!refreshTokenValue) {
    return null;
  }

  try {
    const response = await fetch(`${config.API_URL}${config.API_PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshTokenValue
      })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, data.auth_token);
      if (data.refresh_token) {
        localStorage.setItem('tvoya_shina_refresh_token', data.refresh_token);
      }
      return data.auth_token;
    }
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
  }

  return null;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.API_URL}${config.API_PREFIX}`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // Не устанавливаем Content-Type для FormData, браузер сделает это автоматически
      headers.set('Accept', 'application/json');

      headers.set('Access-Control-Allow-Origin', '*');

      return headers;
    },
    responseHandler: async (response) => {
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔄 Токен истек, пытаемся обновить...');
          
          // Пытаемся обновить токен
          const newToken = await refreshToken();
          
          if (newToken) {
            console.log('✅ Токен успешно обновлен');
            // Перезагружаем страницу чтобы повторить запрос с новым токеном
            window.location.reload();
            return null;
          } else {
            console.log('❌ Не удалось обновить токен, перенаправляем на логин');
            localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
            localStorage.removeItem('tvoya_shina_refresh_token');
            localStorage.removeItem('tvoya_shina_user');
            window.location.href = '/login';
            return null;
          }
        }
        
        // Пытаемся получить детали ошибки из ответа
        const errorData = isJson ? await response.json() : await response.text();
        throw {
          status: response.status,
          data: errorData,
          message: `Ошибка ${response.status}: ${response.statusText}`
        };
      }

      return isJson ? response.json() : response.text();
    },
  }),
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