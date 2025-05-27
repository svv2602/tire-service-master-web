import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

// Создаем базовый API с RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User', 
    'Booking', 
    'ServicePoint', 
    'City', 
    'Region', 
    'Client', 
    'Review', 
    'Partners', 
    'CarBrands', 
    'CarModels',
    'Service',
    'ServiceCategory',
    'Settings',
    'ClientCars',
    'Schedule',
    'ServicePointPhoto',
    'ServicePointService'
  ],
  endpoints: () => ({}),
}); 