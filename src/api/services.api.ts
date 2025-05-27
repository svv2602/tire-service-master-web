import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Service, ServiceFormData, ServiceCategory, ServiceCategoryFormData } from '../types/service';
import { ApiResponse } from '../types/models';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServices: build.query<ApiResponse<Service>, void>({
      query: () => 'services',
      providesTags: (result: ApiResponse<Service> | undefined) => {
        if (result && result.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Service' as const, id })),
            'Service',
          ];
        }
        return ['Service'];
      },
    }),

    getServiceById: build.query<Service, string>({
      query: (id: string) => `services/${id}`,
      providesTags: (_result: Service | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Service' as const, id }
      ],
    }),

    createService: build.mutation<Service, ServiceFormData>({
      query: (data: ServiceFormData) => ({
        url: 'services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: build.mutation<Service, { id: string; data: Partial<ServiceFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ServiceFormData> }) => ({
        url: `services/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Service | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Service' as const, id },
        'Service',
      ],
    }),

    deleteService: build.mutation<void, string>({
      query: (id: string) => ({
        url: `services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

    // Категории услуг
    getServiceCategories: build.query<ServiceCategory[], void>({
      query: () => 'service-categories',
      providesTags: (result: ServiceCategory[] | undefined) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'ServiceCategory' as const, id })),
            'ServiceCategory',
          ];
        }
        return ['ServiceCategory'];
      },
    }),

    getServiceCategoryById: build.query<ServiceCategory, string>({
      query: (id: string) => `service-categories/${id}`,
      providesTags: (_result: ServiceCategory | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'ServiceCategory' as const, id }
      ],
    }),

    createServiceCategory: build.mutation<ServiceCategory, ServiceCategoryFormData>({
      query: (data: ServiceCategoryFormData) => ({
        url: 'service-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    updateServiceCategory: build.mutation<ServiceCategory, { id: string; data: Partial<ServiceCategoryFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ServiceCategoryFormData> }) => ({
        url: `service-categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: ServiceCategory | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'ServiceCategory' as const, id },
        'ServiceCategory',
      ],
    }),

    deleteServiceCategory: build.mutation<void, string>({
      query: (id: string) => ({
        url: `service-categories/${id}`,
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