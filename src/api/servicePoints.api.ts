import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { 
  ServicePoint, 
  ApiResponse, 
  ServicePointCreateRequest,
  ServicePointUpdateRequest 
} from '../types/models';

// Определяем базовый тип запроса
type CustomBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

// Расширяем базовый API для работы с сервисными точками
export const servicePointsApi = createApi({
  reducerPath: 'servicePointsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }) as CustomBaseQuery,
  endpoints: (builder) => ({
    // Получение списка сервисных точек
    getServicePoints: builder.query<ApiResponse<ServicePoint>, { 
      search?: string;
      city_id?: number;
      region_id?: number;
      page?: number;
      per_page?: number;
    } | void>({
      query: (params) => ({
        url: 'service_points',
        params: params || undefined
      }),
    }),

    // Получение сервисной точки по ID
    getServicePointById: builder.query<ServicePoint, string>({
      query: (id) => ({
        url: `service_points/${id}`,
      }),
    }),

    // Создание новой сервисной точки
    createServicePoint: builder.mutation<ServicePoint, ServicePointCreateRequest['service_point']>({
      query: (servicePoint) => ({
        url: 'service_points',
        method: 'POST',
        body: { service_point: servicePoint },
      }),
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, ServicePointUpdateRequest>({
      query: ({ id, servicePoint }) => ({
        url: `service_points/${id}`,
        method: 'PATCH',
        body: { service_point: servicePoint },
      }),
    }),

    // Удаление сервисной точки
    deleteServicePoint: builder.mutation<void, string>({
      query: (id) => ({
        url: `service_points/${id}`,
        method: 'DELETE',
      }),
    }),

    // Добавление фотографии
    uploadServicePointPhoto: builder.mutation<void, { id: string; file: File; is_main?: boolean }>({
      query: ({ id, file, is_main }) => {
        const formData = new FormData();
        formData.append('photo', file);
        if (is_main !== undefined) {
          formData.append('is_main', is_main.toString());
        }
        return {
          url: `service_points/${id}/upload_photo`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetServicePointsQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useUploadServicePointPhotoMutation,
} = servicePointsApi;