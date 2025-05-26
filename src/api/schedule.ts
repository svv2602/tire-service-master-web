import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, Schedule } from './types';

interface GetScheduleParams {
  service_point_id: number;
  day_of_week?: number;
}

interface CreateScheduleData {
  service_point_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

interface UpdateScheduleData {
  start_time?: string;
  end_time?: string;
  is_working_day?: boolean;
}

export const scheduleApi = createApi({
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['Schedule'],
  endpoints: (builder) => ({
    getSchedule: builder.query<PaginatedResponse<Schedule>, GetScheduleParams>({
      query: (params) => ({
        url: 'schedule',
        params,
      }),
      providesTags: ['Schedule'],
    }),
    
    createSchedule: builder.mutation<Schedule, CreateScheduleData>({
      query: (data) => ({
        url: 'schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
    
    updateSchedule: builder.mutation<Schedule, { id: number; data: UpdateScheduleData }>({
      query: ({ id, data }) => ({
        url: `schedule/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),
    
    deleteSchedule: builder.mutation<void, number>({
      query: (id) => ({
        url: `schedule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi; 