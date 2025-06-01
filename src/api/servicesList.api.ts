import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Service, ServiceFormData, ServicesResponse } from '../types/service';
import { ApiResponse, PaginationFilter } from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

interface ServiceFilter extends PaginationFilter {
  query?: string;
  active?: boolean;
  sort?: string;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiServicesResponse {
  data: Service[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServices: build.query<ApiResponse<Service>, ServiceFilter>({
      query: (params = {}) => ({
        url: 'services',
        params,
      }),
      transformResponse: (response: ApiServicesResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Service' as const, id })),
              'Service',
            ]
          : ['Service'],
    }),

    getServicesByCategoryId: build.query<ApiResponse<Service>, { categoryId: string; params?: ServiceFilter }>({
      query: ({ categoryId, params = {} }) => ({
        url: `service_categories/${categoryId}/services`,
        params,
      }),
      transformResponse: (response: ApiServicesResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Service' as const, id })),
              'Service',
            ]
          : ['Service'],
    }),

    getServiceById: build.query<Service, string>({
      query: (id) => `services/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Service' as const, id }],
    }),

    createService: build.mutation<Service, { categoryId: string; data: ServiceFormData }>({
      query: ({ categoryId, data }) => ({
        url: 'services',
        method: 'POST',
        body: { service: { ...data, category_id: categoryId } },
      }),
      invalidatesTags: ['Service', 'ServiceCategory'],
    }),

    updateService: build.mutation<Service, { categoryId: string; id: string; data: Partial<ServiceFormData> }>({
      query: ({ categoryId, id, data }) => ({
        url: `service_categories/${categoryId}/services/${id}`,
        method: 'PATCH',
        body: { service: data },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Service' as const, id },
        'Service',
        'ServiceCategory',
      ],
    }),

    deleteService: build.mutation<void, { categoryId: string; id: string }>({
      query: ({ categoryId, id }) => ({
        url: `service_categories/${categoryId}/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Service' as const, id },
        'Service',
        'ServiceCategory',
      ],
    }),

    toggleServiceActive: build.mutation<Service, { categoryId: string; id: string; is_active: boolean }>({
      query: ({ categoryId, id, is_active }) => ({
        url: `service_categories/${categoryId}/services/${id}`,
        method: 'PATCH',
        body: { service: { is_active } },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Service' as const, id },
        'Service',
        'ServiceCategory',
      ],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServicesByCategoryIdQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceActiveMutation,
} = servicesApi;
