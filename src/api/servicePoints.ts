import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ServicePoint } from '../types/models';

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

// Параметры запроса сервисных точек
interface ServicePointsQueryParams {
  partner_id?: number;
  manager_id?: number;
  city_id?: number;
  amenity_ids?: string;
  query?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
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

export const servicePointsApi = createApi({
  reducerPath: 'servicePointsApi',
  baseQuery,
  tagTypes: ['ServicePoints', 'ServicePointStatuses'],
  endpoints: (builder) => ({
    getServicePoints: builder.query<ServicePointsResponse, ServicePointsQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        return {
          url: 'service_points',
      params: {
            partner_id: queryParams.partner_id,
            manager_id: queryParams.manager_id,
            city_id: queryParams.city_id,
            amenity_ids: queryParams.amenity_ids,
            query: queryParams.query,
            sort_by: queryParams.sort_by,
            sort_direction: queryParams.sort_direction,
            page: queryParams.page || 1,
            per_page: queryParams.per_page || 25,
          },
        };
      },
      providesTags: ['ServicePoints'],
    }),
    getServicePoint: builder.query<ServicePoint, number>({
      query: (id) => `service_points/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServicePoints', id }],
    }),
    createServicePoint: builder.mutation<ServicePoint, { partner_id: number; data: ServicePointFormData }>({
      query: ({ partner_id, data }) => ({
        url: `partners/${partner_id}/service_points`,
        method: 'POST',
        body: { service_point: data },
      }),
      invalidatesTags: ['ServicePoints'],
    }),
    updateServicePoint: builder.mutation<ServicePoint, { partner_id: number; id: number; data: Partial<ServicePointFormData> }>({
      query: ({ partner_id, id, data }) => ({
        url: `partners/${partner_id}/service_points/${id}`,
        method: 'PATCH',
        body: { service_point: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServicePoints', id }],
    }),
    deleteServicePoint: builder.mutation<{ message: string }, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => ({
        url: `partners/${partner_id}/service_points/${id}`,
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