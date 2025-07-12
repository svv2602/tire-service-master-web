import { baseApi } from './baseApi';

export interface SeasonalSchedule {
  id: number;
  service_point_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  period_description: string;
  working_hours: {
    [key: string]: {
      is_working_day: boolean;
      start?: string;
      end?: string;
    };
  };
  is_active: boolean;
  priority: number;
  working_days_count: number;
  status: 'current' | 'upcoming' | 'past' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SeasonalScheduleFormData {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  working_hours: {
    [key: string]: {
      is_working_day: boolean;
      start?: string;
      end?: string;
    };
  };
}

export interface SeasonalScheduleListResponse {
  data: SeasonalSchedule[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface SeasonalScheduleResponse {
  data: SeasonalSchedule;
  message?: string;
}

export interface SeasonalScheduleErrorResponse {
  errors: string[];
}

export const seasonalSchedulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка сезонных расписаний
    getSeasonalSchedules: builder.query<SeasonalScheduleListResponse, {
      servicePointId: string;
      page?: number;
      per_page?: number;
      status?: 'active' | 'inactive' | 'current' | 'upcoming' | 'past';
      date?: string;
    }>({
      query: ({ servicePointId, page = 1, per_page = 20, status, date }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules`,
        params: { page, per_page, status, date },
      }),
      providesTags: (result, error, { servicePointId }) => [
        { type: 'SeasonalSchedule', id: 'LIST' },
        { type: 'SeasonalSchedule', id: `LIST_${servicePointId}` },
      ],
    }),

    // Получение конкретного сезонного расписания
    getSeasonalSchedule: builder.query<SeasonalScheduleResponse, {
      servicePointId: string;
      id: string;
    }>({
      query: ({ servicePointId, id }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules/${id}`,
      }),
      providesTags: (result, error, { servicePointId, id }) => [
        { type: 'SeasonalSchedule', id },
        { type: 'SeasonalSchedule', id: `DETAIL_${servicePointId}_${id}` },
      ],
    }),

    // Создание нового сезонного расписания
    createSeasonalSchedule: builder.mutation<SeasonalScheduleResponse, {
      servicePointId: string;
      data: SeasonalScheduleFormData;
    }>({
      query: ({ servicePointId, data }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules`,
        method: 'POST',
        body: { seasonal_schedule: data },
      }),
      invalidatesTags: (result, error, { servicePointId }) => [
        { type: 'SeasonalSchedule', id: 'LIST' },
        { type: 'SeasonalSchedule', id: `LIST_${servicePointId}` },
      ],
    }),

    // Обновление сезонного расписания
    updateSeasonalSchedule: builder.mutation<SeasonalScheduleResponse, {
      servicePointId: string;
      id: string;
      data: Partial<SeasonalScheduleFormData>;
    }>({
      query: ({ servicePointId, id, data }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules/${id}`,
        method: 'PATCH',
        body: { seasonal_schedule: data },
      }),
      invalidatesTags: (result, error, { servicePointId, id }) => [
        { type: 'SeasonalSchedule', id },
        { type: 'SeasonalSchedule', id: 'LIST' },
        { type: 'SeasonalSchedule', id: `LIST_${servicePointId}` },
        { type: 'SeasonalSchedule', id: `DETAIL_${servicePointId}_${id}` },
      ],
    }),

    // Удаление сезонного расписания
    deleteSeasonalSchedule: builder.mutation<{ message: string }, {
      servicePointId: string;
      id: string;
    }>({
      query: ({ servicePointId, id }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { servicePointId, id }) => [
        { type: 'SeasonalSchedule', id },
        { type: 'SeasonalSchedule', id: 'LIST' },
        { type: 'SeasonalSchedule', id: `LIST_${servicePointId}` },
        { type: 'SeasonalSchedule', id: `DETAIL_${servicePointId}_${id}` },
      ],
    }),

    // Получение активного сезонного расписания для даты
    getActiveSeasonalScheduleForDate: builder.query<SeasonalScheduleResponse, {
      servicePointId: string;
      date: string;
    }>({
      query: ({ servicePointId, date }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules/active_for_date`,
        params: { date },
      }),
      providesTags: (result, error, { servicePointId, date }) => [
        { type: 'SeasonalSchedule', id: `ACTIVE_${servicePointId}_${date}` },
      ],
    }),

    // Получение активных сезонных расписаний для периода
    getActiveSeasonalSchedulesForPeriod: builder.query<{
      data: SeasonalSchedule[];
      period: {
        start_date: string;
        end_date: string;
      };
    }, {
      servicePointId: string;
      start_date: string;
      end_date: string;
    }>({
      query: ({ servicePointId, start_date, end_date }) => ({
        url: `service_points/${servicePointId}/seasonal_schedules/active_for_period`,
        params: { start_date, end_date },
      }),
      providesTags: (result, error, { servicePointId, start_date, end_date }) => [
        { type: 'SeasonalSchedule', id: `PERIOD_${servicePointId}_${start_date}_${end_date}` },
      ],
    }),
  }),
});

export const {
  useGetSeasonalSchedulesQuery,
  useGetSeasonalScheduleQuery,
  useCreateSeasonalScheduleMutation,
  useUpdateSeasonalScheduleMutation,
  useDeleteSeasonalScheduleMutation,
  useGetActiveSeasonalScheduleForDateQuery,
  useGetActiveSeasonalSchedulesForPeriodQuery,
} = seasonalSchedulesApi; 