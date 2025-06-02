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
    }>({
      query: ({ servicePointId, date }) => ({
        url: `/service_points/${servicePointId}/availability/${date}/details`,
        method: 'GET'
      }),
      providesTags: (result, error, { servicePointId, date }) => [
        { type: 'Availability', id: `details-${servicePointId}-${date}` }
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
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetAvailableTimesQuery,
  useCheckTimeAvailabilityMutation,
  useGetNextAvailableTimeQuery,
  useGetDayDetailsQuery,
  useGetWeekOverviewQuery,
} = availabilityApi; 