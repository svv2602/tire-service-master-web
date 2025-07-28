import { baseApi } from './baseApi';

// Типы данных для конфликтов бронирований
export interface BookingConflict {
  id: number;
  conflict_type: string;
  conflict_type_human: string;
  conflict_reason: string;
  status: string;
  status_human: string;
  detected_at: string;
  resolved_at?: string;
  resolution_type?: string;
  resolution_type_human?: string;
  resolution_notes?: string;
  resolved_by?: string;
  booking: {
    id: number;
    start_time: string;
    service_point: {
      id: number;
      name: string;
    };
    service_category?: {
      id: number;
      name: string;
    };
    client: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface BookingConflictStatistics {
  total_pending: number;
  by_type: Record<string, number>;
  recent: BookingConflict[];
}

export interface BookingConflictFilters {
  status?: string;
  conflict_type?: string;
  service_point_id?: number;
  page?: number;
  per_page?: number;
}

export interface BookingConflictAnalysisRequest {
  service_point_id?: number;
  post_id?: number;
  seasonal_schedule_id?: number;
}

export interface BookingConflictResolutionRequest {
  resolution_type: string;
  notes?: string;
  new_start_time?: string;
}

export interface BookingConflictBulkResolutionRequest {
  conflict_ids: number[];
  resolution_type: string;
  notes?: string;
}

export interface BookingConflictListResponse {
  booking_conflicts: BookingConflict[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface BookingConflictPreviewResponse {
  conflicts: BookingConflict[];
  count: number;
}

export interface BookingConflictBulkResolutionResponse {
  message: string;
  results: Array<{
    id: number;
    status: string;
    error?: string;
  }>;
}

// API для работы с конфликтами бронирований
export const bookingConflictsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка конфликтов
    getBookingConflicts: builder.query<BookingConflictListResponse, BookingConflictFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.conflict_type) params.append('conflict_type', filters.conflict_type);
        if (filters.service_point_id) params.append('service_point_id', filters.service_point_id.toString());
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        
        return `booking_conflicts?${params.toString()}`;
      },
      providesTags: ['BookingConflict'],
    }),

    // Получение конкретного конфликта
    getBookingConflict: builder.query<{ booking_conflict: BookingConflict }, number>({
      query: (id) => `booking_conflicts/${id}`,
      providesTags: (result, error, id) => [{ type: 'BookingConflict', id }],
    }),

    // Получение статистики конфликтов
    getBookingConflictStatistics: builder.query<{ statistics: BookingConflictStatistics }, { partner_id?: number }>({
      query: (params = {}) => ({
        url: 'booking_conflicts/statistics',
        params,
      }),
      providesTags: ['BookingConflictStatistics'],
    }),

    // Запуск анализа конфликтов
    analyzeBookingConflicts: builder.mutation<{ message: string }, BookingConflictAnalysisRequest>({
      query: (data) => ({
        url: 'booking_conflicts/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BookingConflict', 'BookingConflictStatistics'],
    }),

    // Предварительный просмотр конфликтов
    previewBookingConflicts: builder.mutation<BookingConflictPreviewResponse, BookingConflictAnalysisRequest>({
      query: (data) => ({
        url: 'booking_conflicts/preview',
        method: 'POST',
        body: data,
      }),
    }),

    // Предварительный просмотр конфликтов с данными формы
    previewBookingConflictsWithFormData: builder.mutation<BookingConflictPreviewResponse & { preview_mode: boolean; form_data_applied: boolean }, { service_point_id: number; form_data: any }>({
      query: (data) => ({
        url: 'booking_conflicts/preview_with_form_data',
        method: 'POST',
        body: data,
      }),
    }),

    // Разрешение конфликта
    resolveBookingConflict: builder.mutation<{ message: string; booking_conflict: BookingConflict }, { id: number } & BookingConflictResolutionRequest>({
      query: ({ id, ...data }) => ({
        url: `booking_conflicts/${id}/resolve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BookingConflict', id },
        'BookingConflict',
        'BookingConflictStatistics',
      ],
    }),

    // Игнорирование конфликта
    ignoreBookingConflict: builder.mutation<{ message: string; booking_conflict: BookingConflict }, { id: number; notes?: string }>({
      query: ({ id, ...data }) => ({
        url: `booking_conflicts/${id}/ignore`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BookingConflict', id },
        'BookingConflict',
        'BookingConflictStatistics',
      ],
    }),

    // Массовое разрешение конфликтов
    bulkResolveBookingConflicts: builder.mutation<BookingConflictBulkResolutionResponse, BookingConflictBulkResolutionRequest>({
      query: (data) => ({
        url: 'booking_conflicts/bulk_resolve',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BookingConflict', 'BookingConflictStatistics'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetBookingConflictsQuery,
  useGetBookingConflictQuery,
  useGetBookingConflictStatisticsQuery,
  useAnalyzeBookingConflictsMutation,
  usePreviewBookingConflictsMutation,
  usePreviewBookingConflictsWithFormDataMutation,
  useResolveBookingConflictMutation,
  useIgnoreBookingConflictMutation,
  useBulkResolveBookingConflictsMutation,
} = bookingConflictsApi; 