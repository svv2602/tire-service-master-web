import { baseApi } from './baseApi';
import { WorkingHours, ServicePointService } from '../types/models';

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query<WorkingHours[], { service_point_id: string; date?: string }>({
      query: ({ service_point_id, date }) => ({
        url: `service_points/${service_point_id}/schedule`,
        params: date ? { date } : {},
      }),
      providesTags: ['Schedule'],
    }),

    getServicePointServices: builder.query<ServicePointService[], string>({
      query: (service_point_id) => ({
        url: `service_points/${service_point_id}/services`,
      }),
      providesTags: ['ServicePointService'],
    }),

    updateSchedule: builder.mutation<WorkingHours[], { service_point_id: string; schedule: WorkingHours[] }>({
      query: ({ service_point_id, schedule }) => ({
        url: `service_points/${service_point_id}/schedule`,
        method: 'PUT',
        body: { schedule },
      }),
      invalidatesTags: ['Schedule'],
    }),

    generateSchedule: builder.mutation<void, { service_point_id: string; from_date: string; to_date: string }>({
      query: ({ service_point_id, from_date, to_date }) => ({
        url: `service_points/${service_point_id}/generate_schedule`,
        method: 'POST',
        body: { from_date, to_date },
      }),
      invalidatesTags: ['Schedule'],
    }),

    getAvailableSlots: builder.query<any[], { service_point_id: string; date: string }>({
      query: ({ service_point_id, date }) => ({
        url: `service_points/${service_point_id}/available_slots`,
        params: { date },
      }),
      providesTags: ['Schedule'],
    }),

    getOccupancy: builder.query<any, { service_point_id: string; date: string }>({
      query: ({ service_point_id, date }) => ({
        url: `service_points/${service_point_id}/occupancy`,
        params: { date },
      }),
      providesTags: ['Schedule'],
    }),

    getWeeklyOccupancy: builder.query<any[], { service_point_id: string; week_start: string }>({
      query: ({ service_point_id, week_start }) => ({
        url: `service_points/${service_point_id}/weekly_occupancy`,
        params: { week_start },
      }),
      providesTags: ['Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useGetServicePointServicesQuery,
  useUpdateScheduleMutation,
  useGenerateScheduleMutation,
  useGetAvailableSlotsQuery,
  useGetOccupancyQuery,
  useGetWeeklyOccupancyQuery,
} = scheduleApi; 