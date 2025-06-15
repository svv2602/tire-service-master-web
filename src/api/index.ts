// Экспортируем базовый API
export { baseApi } from './baseApi';

// Экспортируем все хуки из API файлов
export * from './articles.api';
export * from './auth.api';
export * from './availability.api';
export * from './bookings.api';
export * from './carBrands.api';
export * from './carModels.api';
export * from './cars.api';
export * from './cities.api';
export * from './clients.api';
export * from './pageContent.api';
export * from './partners.api';
export * from './regions.api';
export * from './reviews.api';
export * from './schedule.api';
export * from './service-point-photos.api';
export * from './serviceCategories.api';
// Не экспортируем servicePoints.api и services.api чтобы избежать конфликтов
// export * from './servicePoints.api';
// export * from './services.api';
export * from './servicesList.api';
export * from './settings.api';
export * from './users.api';

// Экспортируем только нужные хуки из servicePoints.api без конфликтов
export {
  useGetServicePointsQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useGetServicePointBasicInfoQuery,
  useGetServicePointServicesQuery,
  useUpdateServicePostMutation,
  useGetSchedulePreviewQuery
} from './servicePoints.api';