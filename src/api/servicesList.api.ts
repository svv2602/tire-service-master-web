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

    // Полностью переделанный метод для удаления услуг
    deleteService: build.mutation<void, { categoryId: string; id: string }>({
      queryFn: async (arg, _queryApi, _extraOptions, baseQuery) => {
        const { categoryId, id } = arg;
        
        console.log('ПОЛНАЯ ОТЛАДКА УДАЛЕНИЯ:');
        console.log('- categoryId:', categoryId);
        console.log('- serviceId:', id);
        
        // Проверяем, что оба параметра есть и они строки
        if (typeof categoryId !== 'string' || typeof id !== 'string') {
          console.error('Неверные типы параметров:', { categoryId, id });
          return { error: { status: 400, data: 'Неверные параметры запроса', error: 'Bad Request' } };
        }
        
        try {
          const hardcodedUrl = `service_categories/${categoryId}/services/${id}`;
          console.log('Используем URL:', hardcodedUrl);
          
          // Используем baseQuery для выполнения запроса
          const result = await baseQuery({
            url: hardcodedUrl,
            method: 'DELETE'
          });
          
          console.log('Результат запроса:', result);
          
          if (result.error) {
            return { error: result.error };
          }
          
          return { data: undefined };
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
          return { error: { status: 500, data: 'Ошибка при выполнении запроса', error: String(error) } };
        }
      },
      // Инвалидация кэша по тегам
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
