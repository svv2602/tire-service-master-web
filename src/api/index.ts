import apiClient from './api';
import { authApi } from './auth';
import { partnersApi, useGetPartnersQuery } from './partners';
import { servicePointsApi, useGetServicePointsQuery } from './service-points';
import { citiesApi } from './cities';
import { regionsApi } from './regions';
import { serviceCategoriesApi, useGetServiceCategoriesQuery } from './serviceCategories';
import { scheduleApi, useGetScheduleQuery } from './schedule';
import { servicePointServicesApi, useGetServicePointServicesQuery } from './servicePointServices';
import { servicePointPhotosApi, useGetServicePointPhotosQuery } from './servicePointPhotos';
import { bookingsApi, useGetBookingsQuery } from './bookings';
import { clientsApi, useGetClientsQuery } from './clients';
import { settingsApi } from './settings';
import { usersApi } from './users';
import { carBrandsApi } from './carBrands';
import { carModelsApi } from './carModels';
import { dashboardApi } from './dashboard';
import { tireTypesApi } from './tireTypes';
import { carTypesApi } from './carTypes';
import { reviewsApi } from './reviews';

// Настройка API URL
export const setupApiBaseUrl = (baseUrl: string) => {
  apiClient.defaults.baseURL = baseUrl;
};

// Экспорт всех API и хуков
export {
  apiClient,
  authApi,
  partnersApi,
  useGetPartnersQuery,
  servicePointsApi,
  useGetServicePointsQuery,
  citiesApi,
  regionsApi,
  serviceCategoriesApi,
  useGetServiceCategoriesQuery,
  scheduleApi,
  useGetScheduleQuery,
  servicePointServicesApi,
  useGetServicePointServicesQuery,
  servicePointPhotosApi,
  useGetServicePointPhotosQuery,
  bookingsApi,
  useGetBookingsQuery,
  clientsApi,
  useGetClientsQuery,
  settingsApi,
  usersApi,
  carBrandsApi,
  carModelsApi,
  dashboardApi,
  tireTypesApi,
  carTypesApi,
  reviewsApi,
};