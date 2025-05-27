import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQuery } from './baseQuery';
import { Schedule, ScheduleFormData, ScheduleFilter, GenerateScheduleData } from '../types/schedule';

export const scheduleApi = createApi({
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['Schedule', 'ServicePointServices'],
  endpoints: (builder) => ({
    getSchedule: builder.query<Schedule[], { service_point_id: string; date: string }>({
      query: ({ service_point_id, date }) => ({
        url: `service-points/${service_point_id}/schedule`,
        method: 'GET',
        params: { date },
      }),
      providesTags: ['Schedule'],
    }),
    getServicePointServices: builder.query<any, string>({
      query: (service_point_id) => ({
        url: `service-points/${service_point_id}/services`,
        method: 'GET',
      }),
      providesTags: ['ServicePointServices'],
    }),
    getScheduleById: builder.query<Schedule, string>({
      query: (id: string) => `schedule/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Schedule' as const, id }
      ],
    }),
    createSchedule: builder.mutation<Schedule, ScheduleFormData>({
      query: (data: ScheduleFormData) => ({
        url: 'schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
    updateSchedule: builder.mutation<Schedule, { id: string; data: Partial<ScheduleFormData> }>({
      query: ({ id, data }) => ({
        url: `schedule/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Schedule' as const, id },
        'Schedule',
      ],
    }),
    deleteSchedule: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `schedule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),
    generateSchedule: builder.mutation<Schedule[], GenerateScheduleData>({
      query: (data: GenerateScheduleData) => ({
        url: 'schedule/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useGetServicePointServicesQuery,
  useGetScheduleByIdQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGenerateScheduleMutation,
} = scheduleApi; 