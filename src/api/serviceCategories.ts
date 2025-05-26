import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, ServiceCategory } from './types';

interface CreateServiceCategoryData {
  name: string;
  description?: string;
}

interface UpdateServiceCategoryData {
  name?: string;
  description?: string;
}

export const serviceCategoriesApi = createApi({
  reducerPath: 'serviceCategoriesApi',
  baseQuery,
  tagTypes: ['ServiceCategories'],
  endpoints: (builder) => ({
    getServiceCategories: builder.query<PaginatedResponse<ServiceCategory>, void>({
      query: () => ({
        url: 'service_categories',
      }),
      providesTags: ['ServiceCategories'],
    }),
    
    getServiceCategory: builder.query<ServiceCategory, number>({
      query: (id) => `service_categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServiceCategories', id }],
    }),
    
    createServiceCategory: builder.mutation<ServiceCategory, CreateServiceCategoryData>({
      query: (data) => ({
        url: 'service_categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServiceCategories'],
    }),
    
    updateServiceCategory: builder.mutation<ServiceCategory, { id: number; data: UpdateServiceCategoryData }>({
      query: ({ id, data }) => ({
        url: `service_categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServiceCategories', id }],
    }),
    
    deleteServiceCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `service_categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategories'],
    }),
  }),
});

export const {
  useGetServiceCategoriesQuery,
  useGetServiceCategoryQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
} = serviceCategoriesApi; 