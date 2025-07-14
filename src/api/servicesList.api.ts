import { baseApi } from './baseApi';
import { Service, ServiceFormData } from '../types/service';
import { ApiResponse, PaginationFilter } from '../types/models';

interface ServiceFilter extends PaginationFilter {
  query?: string;
  active?: boolean;
  sort?: string;
  category_id?: number;
  locale?: string;
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
        result?.data && Array.isArray(result.data)
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
      query: ({ categoryId, id }) => {
        // Принудительно преобразуем в строки для предотвращения [object Object]
        const catId = String(categoryId);
        const servId = String(id);
        
        console.log('🔍 RTK DELETE Query - Input params:', { categoryId, id });
        console.log('🔍 RTK DELETE Query - After String conversion:', { catId, servId });
        console.log('🔍 RTK DELETE Query - Types:', { 
          categoryIdType: typeof categoryId, 
          idType: typeof id,
          catIdType: typeof catId,
          servIdType: typeof servId
        });
        
        const url = `service_categories/${catId}/services/${servId}`;
        console.log('🔍 RTK DELETE Query - Final URL:', url);
        
        // Проверяем на наличие [object Object] в URL
        if (url.includes('[object') || url.includes('undefined') || url.includes('null')) {
          console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Неправильный URL!', { url, categoryId, id, catId, servId });
          throw new Error(`Некорректный URL для удаления: ${url}`);
        }
        
        return {
          url,
          method: 'DELETE',
        };
      },
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
