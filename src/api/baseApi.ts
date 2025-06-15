import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Базовый API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
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