// Экспортируем базовые модули
export * from './baseApi';
export * from './baseQuery';
export * from './api';

// Экспортируем API модули
export * from './auth.api';
export * from './bookings.api';
export * from './carBrands.api';
export * from './carModels.api';
export * from './cities.api';
export * from './clients.api';
export * from './partners.api';
export * from './regions.api';
export * from './reviews.api';
export * from './schedule.api';
export * from './servicePoints.api';
export * from './services.api';
export * from './settings.api';
export * from './users.api';

// Экспортируем базовые типы
export * from '../types/models';

// Экспортируем все API и хуки
export {
  usersApi,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type UsersResponse,
  type UsersQueryParams,
} from './users.api';

export {
  clientsApi,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientCarsQuery,
  useGetClientCarByIdQuery,
  useCreateClientCarMutation,
  useUpdateClientCarMutation,
  useDeleteClientCarMutation,
} from './clients.api';

// Экспортируем хуки для брендов автомобилей
export {
  carBrandsApi,
  useGetCarBrandsQuery,
  useGetCarBrandByIdQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
} from './carBrands.api';

// Экспортируем хуки для моделей автомобилей
export {
  carModelsApi,
  useGetCarModelsQuery,
  useGetCarModelsByBrandIdQuery,
  useGetCarModelByIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
  useToggleCarModelActiveMutation,
} from './carModels.api';

// Экспортируем базовые типы
export type { UserFormData, UserCredentials, PasswordReset, PasswordResetConfirm } from '../types/user';
export type { User, Booking, ServicePoint, City, Region, Review } from '../types/models';
export type { Client } from '../types/client';
export type { BookingStatusEnum, PaymentStatus } from '../types/booking';
export type { CarBrand, CarModel, CarBrandFormData, CarModelFormData } from '../types/car';

// Экспортируем базовый запрос
export { baseQuery } from './baseQuery';

// Экспортируем хуки для фотографий
export {
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} from './photos.api';

// Экспортируем только базовый API из baseApi
export { baseApi } from './baseApi';

// Экспортируем правильную мутацию удаления услуг из servicesList.api.ts
export {
  useGetServicesByCategoryIdQuery,
  useDeleteServiceMutation,
} from './servicesList.api';