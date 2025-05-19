import apiClient from './api';
import { authApi, partnersApi, servicePointsApi, clientsApi, referencesApi } from './api';
import { bookingsApi, Booking, BookingService, BookingFilters } from './bookings';
import { settingsApi, SystemSettings } from './settings';
import { usersApi, User, UserProfile, UserCredentials, PasswordReset } from './users';

// Экспорт всех API
export {
  apiClient,
  authApi,
  partnersApi,
  servicePointsApi,
  clientsApi,
  referencesApi,
  bookingsApi,
  settingsApi,
  usersApi
};

// Экспорт типов
export type {
  Booking,
  BookingService,
  BookingFilters,
  SystemSettings,
  User,
  UserProfile,
  UserCredentials,
  PasswordReset
};

// Настройка API URL
export const setupApiBaseUrl = (baseUrl: string) => {
  apiClient.defaults.baseURL = baseUrl;
};

// По умолчанию экспортируем apiClient
export default apiClient; 