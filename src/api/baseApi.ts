import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';
import authService from '../services/authService';
import { ApiResponse } from '../types/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.API_URL}${config.API_PREFIX}`,
    prepareHeaders: (headers) => {
      // Получаем заголовок авторизации из сервиса
      const authHeader = authService.getAuthorizationHeader();
      if (authHeader) {
        headers.set('Authorization', authHeader);
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
          // Очищаем токен через сервис
          authService.setToken(null);
          
          // Проверяем, не находимся ли мы уже на странице логина
          const isLoginPage = window.location.pathname === '/login';
          if (!isLoginPage) {
            const currentPath = window.location.pathname + window.location.search;
            localStorage.setItem('returnPath', currentPath);
            window.location.href = '/login';
          }
          throw new Error('Unauthorized');
        }

        // Пытаемся получить детали ошибки из тела ответа
        const errorData = isJson ? await response.json() : await response.text();
        throw {
          status: response.status,
          data: errorData,
          message: errorData.message || `Ошибка ${response.status}: ${response.statusText}`
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