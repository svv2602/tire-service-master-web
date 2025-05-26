import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Schedule, ScheduleFormData, ScheduleFilter, GenerateScheduleData } from '../types/schedule';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getSchedule: build.query<Schedule[], ScheduleFilter>({
      query: (filter: ScheduleFilter) => ({
        url: 'schedule',
        params: filter,
      }),
      providesTags: (result: Schedule[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Schedule' as const, id })),
              'Schedule',
            ]
          : ['Schedule'],
    }),

    getScheduleByServicePoint: build.query<Schedule[], string>({
      query: (servicePointId: string) => `schedule?servicePointId=${servicePointId}`,
      providesTags: (result: Schedule[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Schedule' as const, id })),
              'Schedule',
            ]
          : ['Schedule'],
    }),
    
    getScheduleById: build.query<Schedule, string>({
      query: (id: string) => `schedule/${id}`,
      providesTags: (_result: Schedule | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Schedule' as const, id }
      ],
    }),
    
    createSchedule: build.mutation<Schedule, ScheduleFormData>({
      query: (data: ScheduleFormData) => ({
        url: 'schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
    
    updateSchedule: build.mutation<Schedule, { id: string; data: Partial<ScheduleFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ScheduleFormData> }) => ({
        url: `schedule/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Schedule | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Schedule' as const, id },
        'Schedule',
      ],
    }),

    generateSchedule: build.mutation<Schedule[], GenerateScheduleData>({
      query: (data: GenerateScheduleData) => ({
        url: 'schedule/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
    
    deleteSchedule: build.mutation<void, string>({
      query: (id: string) => ({
        url: `schedule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetScheduleQuery,
  useGetScheduleByServicePointQuery,
  useGetScheduleByIdQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useGenerateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi; 