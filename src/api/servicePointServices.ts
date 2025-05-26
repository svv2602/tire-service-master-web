import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, ServicePointService } from './types';

interface GetServicePointServicesParams {
  service_point_id: number;
  is_available?: boolean;
}

interface CreateServicePointServiceData {
  service_point_id: number;
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
}

interface UpdateServicePointServiceData {
  price?: number;
  duration?: number;
  is_available?: boolean;
}

export const servicePointServicesApi = createApi({
  reducerPath: 'servicePointServicesApi',
  baseQuery,
  tagTypes: ['ServicePointServices'],
  endpoints: (builder) => ({
    getServicePointServices: builder.query<PaginatedResponse<ServicePointService>, GetServicePointServicesParams>({
      query: (params) => ({
        url: 'service_point_services',
        params,
      }),
      providesTags: ['ServicePointServices'],
    }),
    
    getServicePointService: builder.query<ServicePointService, number>({
      query: (id) => `service_point_services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServicePointServices', id }],
    }),
    
    createServicePointService: builder.mutation<ServicePointService, CreateServicePointServiceData>({
      query: (data) => ({
        url: 'service_point_services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServicePointServices'],
    }),
    
    updateServicePointService: builder.mutation<ServicePointService, { id: number; data: UpdateServicePointServiceData }>({
      query: ({ id, data }) => ({
        url: `service_point_services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServicePointServices', id }],
    }),
    
    deleteServicePointService: builder.mutation<void, number>({
      query: (id) => ({
        url: `service_point_services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePointServices'],
    }),
  }),
});

export const {
  useGetServicePointServicesQuery,
  useGetServicePointServiceQuery,
  useCreateServicePointServiceMutation,
  useUpdateServicePointServiceMutation,
  useDeleteServicePointServiceMutation,
} = servicePointServicesApi; 