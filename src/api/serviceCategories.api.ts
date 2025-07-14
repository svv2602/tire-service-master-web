import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { ServiceCategoryData, ServiceCategoryFormData, ServiceCategoriesResponse } from '../types/service';
import { ApiResponse, PaginationFilter } from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

interface ServiceCategoryFilter extends PaginationFilter {
  query?: string;
  active?: boolean;
  sort?: string;
  with_active_posts?: boolean;
  locale?: string;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiServiceCategoriesResponse {
  data: ServiceCategoryData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// Интерфейс для ответа API категорий по городу
interface ServiceCategoriesByCityResponse {
  data: Array<ServiceCategoryData & {
    service_points_count: number;
    services_count: number;
    city_name: string;
  }>;
  city: {
    id: number;
    name: string;
    region: string;
  };
  total_count: number;
}

export const serviceCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServiceCategories: build.query<ApiResponse<ServiceCategoryData>, ServiceCategoryFilter>({
      query: (params = {}) => ({
        url: 'service_categories',
        params,
      }),
      transformResponse: (response: ApiServiceCategoriesResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServiceCategory' as const, id })),
              'ServiceCategory',
            ]
          : ['ServiceCategory'],
    }),

    getServiceCategoryById: build.query<ServiceCategoryData, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({
        url: `service_categories/${id}`,
        params: locale ? { locale } : {}
      }),
      providesTags: (_result, _err, { id }) => [{ type: 'ServiceCategory' as const, id }],
    }),

    // Получение категорий услуг по городу
    getServiceCategoriesByCity: build.query<ServiceCategoriesByCityResponse, string>({
      query: (cityName) => `service_categories/by_city/${encodeURIComponent(cityName)}`,
      providesTags: ['ServiceCategory'],
    }),

    // Получение категорий услуг по ID города
    getServiceCategoriesByCityId: build.query<ServiceCategoriesByCityResponse, { cityId: number; locale?: string }>({
      query: ({ cityId, locale }) => ({
        url: `service_categories/by_city_id/${cityId}`,
        params: locale ? { locale } : {}
      }),
      providesTags: ['ServiceCategory'],
    }),

    createServiceCategory: build.mutation<ServiceCategoryData, ServiceCategoryFormData>({
      query: (data) => ({
        url: 'service_categories',
        method: 'POST',
        body: { service_category: data },
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    updateServiceCategory: build.mutation<ServiceCategoryData, { id: string; data: Partial<ServiceCategoryFormData> }>({
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

    deleteServiceCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `service_categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'ServiceCategory' as const, id },
        'ServiceCategory',
      ],
    }),

    toggleServiceCategoryActive: build.mutation<ServiceCategoryData, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `service_categories/${id}`,
        method: 'PATCH',
        body: { service_category: { is_active } },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'ServiceCategory' as const, id },
        'ServiceCategory',
      ],
    }),
  }),
});

export const {
  useGetServiceCategoriesQuery,
  useGetServiceCategoryByIdQuery,
  useGetServiceCategoriesByCityQuery,
  useGetServiceCategoriesByCityIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useToggleServiceCategoryActiveMutation,
} = serviceCategoriesApi;
