import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  ],
  endpoints: () => ({}),
});