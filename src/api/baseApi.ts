import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Базовый API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      // Пытаемся получить токен из Redux state
      const token = (getState() as any).auth?.token;
      
      // Если токена нет в Redux, пытаемся получить из localStorage
      const fallbackToken = token || localStorage.getItem('authToken');
      
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