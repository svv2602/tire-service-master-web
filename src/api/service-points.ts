import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { ServicePoint } from '../types/models';
import { CreateServicePointRequest, UpdateServicePointRequest } from '../types/api-requests';

// Интерфейс для ответа API с пагинацией
export interface ServicePointsResponse {
  data: ServicePoint[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  partner_id?: number;
  city_id?: number;
  is_active?: boolean;
}

export const servicePointsApi = createApi({
  reducerPath: 'servicePointsApi',
  baseQuery,
  tagTypes: ['ServicePoints'],
  endpoints: (builder) => ({
    getServicePoints: builder.query<ServicePointsResponse, QueryParams>({
      query: (params) => ({
        url: '/service-points',
        params,
      }),
      providesTags: ['ServicePoints'],
    }),

    getServicePointById: builder.query<{ data: ServicePoint }, number>({
      query: (id) => `/service-points/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServicePoints', id }],
    }),

    createServicePoint: builder.mutation<{ data: ServicePoint }, { partnerId: number; data: CreateServicePointRequest }>({
      query: ({ partnerId, data }) => ({
        url: `/partners/${partnerId}/service-points`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServicePoints'],
    }),

    updateServicePoint: builder.mutation<{ data: ServicePoint }, { partnerId: number; id: number; data: UpdateServicePointRequest }>({
      query: ({ partnerId, id, data }) => ({
        url: `/partners/${partnerId}/service-points/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServicePoints', id }],
    }),

    deleteServicePoint: builder.mutation<void, { partnerId: number; id: number }>({
      query: ({ partnerId, id }) => ({
        url: `/partners/${partnerId}/service-points/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePoints'],
    }),

    findNearbyServicePoints: builder.query<{ data: ServicePoint[] }, { latitude: number; longitude: number; distance: number }>({
      query: (params) => ({
        url: '/service-points/nearby',
        params,
      }),
      providesTags: ['ServicePoints'],
    }),
  }),
});

export const {
  useGetServicePointsQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useFindNearbyServicePointsQuery,
} = servicePointsApi; 