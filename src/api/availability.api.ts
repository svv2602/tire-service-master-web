// api/availability.api.ts - API методы для системы динамической доступности

import { baseApi } from './baseApi';
import type {
  AvailabilityResponse,
  TimeCheckResponse,
  NextAvailableResponse,
  DayDetailsResponse,
  WeekOverviewResponse,
  AvailabilityParams,
  TimeCheckParams,
  NextAvailableParams,
  WeekOverviewParams
} from '../types/availability';

// Типы для проверки доступности с категорией
export interface AvailabilityCheckRequest {
  servicePointId: number;
  date: string;
  startTime: string;
  duration: number;
  categoryId: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  reason?: string;
  available_posts_count: number;
  total_posts_count: number;
  category_id: number;
  category_contact: {
    phone?: string;
    email?: string;
  };
}

export interface TimeSlot {
  service_post_id: number;
  post_number: number;
  post_name: string;
  category_id: string;
  category_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  datetime: string;
}

export interface CategorySlotsResponse {
  service_point_id: string;
  category_id: string;
  date: string;
  slots: TimeSlot[];
  total_slots: number;
}

export const availabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение доступных временных интервалов на дату
    getAvailableTimes: builder.query<AvailabilityResponse, { 
      servicePointId: string | number; 
      params: AvailabilityParams 
    }>({
      query: ({ servicePointId, params }) => ({
        url: `/service_points/${servicePointId}/availability/${params.date}`,
        method: 'GET',
        params: {
          min_duration_minutes: params.min_duration_minutes,
          duration: params.duration
        }
      }),
      providesTags: (result, error, { servicePointId, params }) => [
        { type: 'Availability', id: `${servicePointId}-${params.date}` }
      ],
    }),

    // Проверка доступности конкретного времени
    checkTimeAvailability: builder.mutation<TimeCheckResponse, {
      servicePointId: string | number;
      params: TimeCheckParams;
    }>({
      query: ({ servicePointId, params }) => ({
        url: `/service_points/${servicePointId}/availability/check`,
        method: 'POST',
        body: params
      }),
    }),

    // Поиск ближайшего доступного времени
    getNextAvailableTime: builder.query<NextAvailableResponse, {
      servicePointId: string | number;
      params: NextAvailableParams;
    }>({
      query: ({ servicePointId, params }) => ({
        url: `/service_points/${servicePointId}/availability/${params.date}/next`,
        method: 'GET',
        params: {
          after_time: params.after_time,
          duration_minutes: params.duration_minutes
        }
      }),
      providesTags: (result, error, { servicePointId, params }) => [
        { type: 'Availability', id: `next-${servicePointId}-${params.date}` }
      ],
    }),

    // Детальная информация о загрузке дня
    getDayDetails: builder.query<DayDetailsResponse, {
      servicePointId: string | number;
      date: string;
      categoryId?: number;
    }>({
      query: ({ servicePointId, date, categoryId }) => ({
        url: `/service_points/${servicePointId}/availability/${date}/details`,
        method: 'GET',
        params: categoryId ? { category_id: categoryId } : undefined
      }),
      providesTags: (result, error, { servicePointId, date, categoryId }) => [
        { type: 'Availability', id: `details-${servicePointId}-${date}-${categoryId || 'all'}` }
      ],
    }),

    // Обзор доступности на неделю
    getWeekOverview: builder.query<WeekOverviewResponse, {
      servicePointId: string | number;
      params?: WeekOverviewParams;
    }>({
      query: ({ servicePointId, params }) => ({
        url: `/service_points/${servicePointId}/availability/week`,
        method: 'GET',
        params: params ? { start_date: params.start_date } : undefined
      }),
      providesTags: (result, error, { servicePointId, params }) => [
        { type: 'Availability', id: `week-${servicePointId}-${params?.start_date || 'current'}` }
      ],
    }),

    // Проверка доступности с учетом категории
    checkAvailabilityWithCategory: builder.mutation<
      AvailabilityCheckResponse,
      AvailabilityCheckRequest
    >({
      query: (data) => ({
        url: 'availability/check_with_category',
        method: 'POST',
        body: {
          service_point_id: data.servicePointId,
          date: data.date,
          start_time: data.startTime,
          duration: data.duration,
          category_id: data.categoryId
        }
      })
    }),

    // Быстрая проверка доступности дня (для календаря)
    checkDayAvailability: builder.query<{
      service_point_id: number;
      date: string;
      is_available: boolean;
      category_id?: number;
    }, {
      servicePointId: string | number;
      date: string;
      categoryId?: number;
    }>({
      query: ({ servicePointId, date, categoryId }) => ({
        url: `/service_points/${servicePointId}/availability/${date}/check`,
        method: 'GET',
        params: categoryId ? { category_id: categoryId } : undefined
      }),
      providesTags: (result, error, { servicePointId, date, categoryId }) => [
        { type: 'Availability', id: `check-${servicePointId}-${date}-${categoryId || 'all'}` }
      ],
    }),

    // Получение доступных слотов для категории
    getSlotsForCategory: builder.query<
      CategorySlotsResponse,
      {
        servicePointId: number;
        categoryId: number;
        date: string;
        duration?: number;
      }
    >({
      query: ({ servicePointId, categoryId, date, duration = 60 }) => ({
        url: 'availability/slots_for_category',
        params: {
          service_point_id: servicePointId,
          category_id: categoryId,
          date,
          duration
        }
      }),
      // Кэширование на 2 минуты (слоты могут часто изменяться)
      keepUnusedDataFor: 120,
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetAvailableTimesQuery,
  useCheckTimeAvailabilityMutation,
  useGetNextAvailableTimeQuery,
  useGetDayDetailsQuery,
  useGetWeekOverviewQuery,
  useCheckAvailabilityWithCategoryMutation,
  useCheckDayAvailabilityQuery,
  useGetSlotsForCategoryQuery
} = availabilityApi; 