import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface Schedule {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

interface GetScheduleParams {
  service_point_id: number;
}

export const scheduleApi = createApi({
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['Schedule'],
  endpoints: (builder) => ({
    getSchedule: builder.query<{ data: Schedule[] }, GetScheduleParams>({
      query: (params) => `/service_points/${params.service_point_id}/schedule`,
      providesTags: ['Schedule'],
    }),
  }),
});

export const { useGetScheduleQuery } = scheduleApi; 