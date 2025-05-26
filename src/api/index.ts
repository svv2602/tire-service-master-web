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
import { servicesApi, useGetServicesQuery, useDeleteServiceMutation } from './services';

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
  servicesApi,
  useGetServicesQuery,
  useDeleteServiceMutation,
};

export * from './baseApi';
export * from './partners.api';
export * from './servicePoints.api';
export * from './regions.api';
export * from './cities.api';
export * from './carBrands.api';
export * from './carModels.api';
export * from './services.api';
export * from './bookings.api';
export * from './clients.api';
export * from './reviews.api';

// Экспорт типов
export type { Partner } from '../types/partner';
export type { ServicePoint } from '../types/servicePoint';
export type { Region, City } from '../types/location';
export type { CarBrand, CarModel } from '../types/car';
export type { Service, ServiceCategory, ServicePointService } from '../types/service';
export type { Booking, BookingService, BookingFilter } from '../types/booking';
export { BookingStatus } from '../types/booking';
export type { Client, ClientCar, ClientFilter } from '../types/client';
export type { Review, ReviewFilter } from '../types/review';

// Другие API будут добавлены по мере их создания