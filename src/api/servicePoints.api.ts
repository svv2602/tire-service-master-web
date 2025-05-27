import { baseApi } from './baseApi';
import { ServicePoint, ApiResponse, ServicePointFilter } from '../types/models';

// Расширяем базовый API для работы с сервисными точками
export const servicePointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка сервисных точек
    getServicePoints: builder.query<ApiResponse<ServicePoint>, ServicePointFilter>({
      query: (params) => ({
        url: 'service-points',
        method: 'GET',
        params,
      }),
      providesTags: ['ServicePoint'],
    }),

    // Получение сервисной точки по ID
    getServicePointById: builder.query<ServicePoint, string>({
      query: (id) => ({
        url: `service-points/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'ServicePoint', id }],
    }),

    // Создание новой сервисной точки
    createServicePoint: builder.mutation<ServicePoint, Partial<ServicePoint>>({
      query: (servicePoint) => ({
        url: 'service-points',
        method: 'POST',
        body: servicePoint,
      }),
      invalidatesTags: ['ServicePoint'],
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, { id: string; servicePoint: Partial<ServicePoint> }>({
      query: ({ id, servicePoint }) => ({
        url: `service-points/${id}`,
        method: 'PUT',
        body: servicePoint,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ServicePoint', id }],
    }),

    // Удаление сервисной точки
    deleteServicePoint: builder.mutation<void, string>({
      query: (id) => ({
        url: `service-points/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePoint'],
    }),
  }),
});

// Экспортируем хуки
export const {
  useGetServicePointsQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
} = servicePointsApi; 