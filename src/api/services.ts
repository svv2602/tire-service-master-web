import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { Service } from '../types/models';

interface GetServicesParams {
  page?: number;
  per_page?: number;
  query?: string;
  category_id?: number;
}

interface CreateServiceData {
  name: string;
  description?: string;
  category_id: number;
  duration: number;
  is_active: boolean;
}

interface UpdateServiceData {
  name?: string;
  description?: string;
  category_id?: number;
  duration?: number;
  is_active?: boolean;
}

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery,
  tagTypes: ['Services'],
  endpoints: (builder) => ({
    getServices: builder.query<{ data: Service[]; total: number }, GetServicesParams>({
      query: (params) => ({
        url: '/services',
        params,
      }),
      providesTags: ['Services'],
    }),
    
    getService: builder.query<{ data: Service }, number>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Services', id }],
    }),

    createService: builder.mutation<{ data: Service }, CreateServiceData>({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Services'],
    }),

    updateService: builder.mutation<{ data: Service }, { id: number; data: UpdateServiceData }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Services', id }],
    }),

    deleteService: builder.mutation<void, number>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi; 