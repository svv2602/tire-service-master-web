import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';

// Базовая конфигурация API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || '',
    prepareHeaders: (headers, { getState }) => {
      // Получаем токен из состояния auth
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  endpoints: () => ({}),
  // Теги для инвалидации кэша
  tagTypes: [
    'Partners',
    'ServicePoints',
    'Regions',
    'Cities',
    'Bookings',
    'Clients',
    'CarBrands',
    'CarModels',
    'Users',
    'Services',
    'Reviews',
    'Schedule',
  ],
}); 