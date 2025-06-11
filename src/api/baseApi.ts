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
      headers.set('Accept', 'application/json');
      return headers;
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