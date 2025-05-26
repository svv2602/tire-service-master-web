import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, ServicePoint } from './types';

// Интерфейс для ответа API с пагинацией
interface ServicePointsResponse {
  data: ServicePoint[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

// Параметры для поиска ближайших точек
interface NearbyServicePointsParams {
  latitude: number;
  longitude: number;
  distance?: number;
  page?: number;
  per_page?: number;
}

// Данные формы сервисной точки
export interface ServicePointFormData {
  name: string;
  description?: string;
  address: string;
  city_id: number;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  post_count?: number;
  default_slot_duration?: number;
  status_id?: number;
}

interface GetServicePointsParams {
  partner_id?: number;
  city_id?: number;
  is_active?: boolean;
}

export const servicePointsApi = createApi({
  reducerPath: 'servicePointsApi',
  baseQuery,
  tagTypes: ['ServicePoints', 'ServicePointStatuses'],
  endpoints: (builder) => ({
    getServicePoints: builder.query<PaginatedResponse<ServicePoint>, GetServicePointsParams>({
      query: (params) => ({
        url: 'service_points',
        params,
      }),
      providesTags: ['ServicePoints'],
    }),
    getServicePoint: builder.query<ServicePoint, number>({
      query: (id) => `service_points/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServicePoints', id }],
    }),
    createServicePoint: builder.mutation<ServicePoint, { partnerId: number; data: Partial<ServicePoint> }>({
      query: ({ partnerId, data }) => ({
        url: `partners/${partnerId}/service_points`,
        method: 'POST',
        body: { service_point: data },
      }),
      invalidatesTags: ['ServicePoints'],
    }),
    updateServicePoint: builder.mutation<ServicePoint, { partnerId: number; id: number; data: Partial<ServicePoint> }>({
      query: ({ partnerId, id, data }) => ({
        url: `partners/${partnerId}/service_points/${id}`,
        method: 'PUT',
        body: { service_point: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServicePoints', id }],
    }),
    deleteServicePoint: builder.mutation<void, { partnerId: number; id: number }>({
      query: ({ partnerId, id }) => ({
        url: `partners/${partnerId}/service_points/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePoints'],
    }),
    getNearbyServicePoints: builder.query<ServicePointsResponse, NearbyServicePointsParams>({
      query: (params) => ({
        url: 'service_points/nearby',
        params: {
          latitude: params.latitude,
          longitude: params.longitude,
          distance: params.distance || 10,
          page: params.page || 1,
          per_page: params.per_page || 25,
        },
      }),
      providesTags: ['ServicePoints'],
    }),
    getServicePointStatuses: builder.query<{ id: number; name: string; description?: string; color: string; is_active: boolean; sort_order: number }[], void>({
      query: () => 'service_point_statuses',
      providesTags: ['ServicePointStatuses'],
    }),
  }),
});

export const {
  useGetServicePointsQuery,
  useGetServicePointQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useGetNearbyServicePointsQuery,
  useGetServicePointStatusesQuery,
} = servicePointsApi; 