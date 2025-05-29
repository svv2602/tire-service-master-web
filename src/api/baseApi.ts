import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.API_URL}${config.API_PREFIX}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      headers.set('Accept', 'application/json');

      headers.set('Access-Control-Allow-Origin', '*');

      return headers;
    },
    responseHandler: async (response) => {
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
          window.location.href = '/login';
          return null;
        }
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
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
    'ServicePointService'
  ],
  endpoints: () => ({}),
}); 