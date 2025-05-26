import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Service, ServiceFormData, ServiceCategory, ServiceCategoryFormData } from '../types/service';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    // Сервисы
    getServices: build.query<Service[], void>({
      query: () => 'services',
      providesTags: (result: Service[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Services' as const, id })),
              'Services',
            ]
          : ['Services'],
    }),

    getServicesByCategoryId: build.query<Service[], string>({
      query: (categoryId: string) => `services?categoryId=${categoryId}`,
      providesTags: (result: Service[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Services' as const, id })),
              'Services',
            ]
          : ['Services'],
    }),
    
    getServiceById: build.query<Service, string>({
      query: (id: string) => `services/${id}`,
      providesTags: (_result: Service | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Services' as const, id }
      ],
    }),
    
    createService: build.mutation<Service, ServiceFormData>({
      query: (data: ServiceFormData) => ({
        url: 'services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Services'],
    }),
    
    updateService: build.mutation<Service, { id: string; data: Partial<ServiceFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ServiceFormData> }) => ({
        url: `services/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Service | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Services' as const, id },
        'Services',
      ],
    }),
    
    deleteService: build.mutation<void, string>({
      query: (id: string) => ({
        url: `services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),

    // Категории сервисов
    getServiceCategories: build.query<ServiceCategory[], void>({
      query: () => 'service-categories',
      providesTags: (result: ServiceCategory[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServiceCategories' as const, id })),
              'ServiceCategories',
            ]
          : ['ServiceCategories'],
    }),
    
    getServiceCategoryById: build.query<ServiceCategory, string>({
      query: (id: string) => `service-categories/${id}`,
      providesTags: (_result: ServiceCategory | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'ServiceCategories' as const, id }
      ],
    }),
    
    createServiceCategory: build.mutation<ServiceCategory, ServiceCategoryFormData>({
      query: (data: ServiceCategoryFormData) => ({
        url: 'service-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServiceCategories'],
    }),
    
    updateServiceCategory: build.mutation<ServiceCategory, { id: string; data: Partial<ServiceCategoryFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ServiceCategoryFormData> }) => ({
        url: `service-categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: ServiceCategory | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'ServiceCategories' as const, id },
        'ServiceCategories',
      ],
    }),
    
    deleteServiceCategory: build.mutation<void, string>({
      query: (id: string) => ({
        url: `service-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategories'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  // Сервисы
  useGetServicesQuery,
  useGetServicesByCategoryIdQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  // Категории сервисов
  useGetServiceCategoriesQuery,
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
} = servicesApi; 