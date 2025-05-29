import type { Service, ServicesResponse, ServiceFormData, ServiceCategoryFormData } from '../types/service';
import type { ServiceCategory } from '../types/models';
import { ApiResponse } from '../types/models';
import { baseApi } from './baseApi';

// Расширяем baseApi вместо создания нового
export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesResponse, void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),

    getServiceById: builder.query<Service, number>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Service' as const, id }],
    }),

    createService: builder.mutation<Service, ServiceFormData>({
      query: (data) => ({
        url: 'services',
        method: 'POST',
        body: { service: data },
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation<Service, { id: number; data: Partial<ServiceFormData> }>({
      query: ({ id, data }) => ({
        url: `services/${id}`,
        method: 'PATCH',
        body: { service: data },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Service' as const, id },
        'Service',
      ],
    }),

    deleteService: builder.mutation<void, number>({
      query: (id) => ({
        url: `services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

    // Категории услуг
    getServiceCategories: builder.query<ApiResponse<ServiceCategory[]>, void>({
      query: () => 'service_categories',
      providesTags: ['ServiceCategory'],
    }),

    getServiceCategoryById: builder.query<ServiceCategory, number>({
      query: (id) => `service_categories/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'ServiceCategory' as const, id }],
    }),

    createServiceCategory: builder.mutation<ServiceCategory, ServiceCategoryFormData>({
      query: (data) => ({
        url: 'service_categories',
        method: 'POST',
        body: { service_category: data },
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    updateServiceCategory: builder.mutation<ServiceCategory, { id: number; data: Partial<ServiceCategoryFormData> }>({
      query: ({ id, data }) => ({
        url: `service_categories/${id}`,
        method: 'PATCH',
        body: { service_category: data },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'ServiceCategory' as const, id },
        'ServiceCategory',
      ],
    }),

    deleteServiceCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `service_categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategory'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServiceCategoriesQuery,
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
} = servicesApi; 