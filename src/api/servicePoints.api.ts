import type { 
  ServicePoint, 
  ApiResponse, 
  ServicePointCreateRequest,
  ServicePointUpdateRequest,
  ServicePointFormData,
  ServicePointStatus
} from '../types/models';
import { baseApi } from './baseApi';

// Добавляем тип для work status
export interface WorkStatus {
  value: string;
  label: string;
  description: string;
}

// Добавляем тип для service post
export interface ServicePost {
  id: number;
  service_point_id: number;
  post_number: number;
  name: string;
  description?: string;
  slot_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _destroy?: boolean; // Для пометки постов на удаление
}

// Инжектируем эндпоинты в baseApi
export const servicePointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка сервисных точек
    getServicePoints: builder.query<ApiResponse<ServicePoint>, { 
      query?: string;
      city_id?: number;
      region_id?: number;
      page?: number;
      per_page?: number;
    } | void>({
      query: (params) => ({
        url: '/service_points',
        params: {
          ...params,
          include: 'city.region,working_hours,status'
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServicePoint' as const, id })),
              { type: 'ServicePoint' as const, id: 'LIST' },
            ]
          : [{ type: 'ServicePoint' as const, id: 'LIST' }],
    }),

    // Получение базовой информации о сервисной точке
    getServicePointBasicInfo: builder.query<ServicePoint, string>({
      query: (id) => ({
        url: `/service_points/${id}/basic`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ServicePoint' as const, id }],
    }),

    // Получение сервисной точки по ID
    getServicePointById: builder.query<ServicePoint, { partner_id: number; id: string }>({
      query: ({ partner_id, id }) => ({
        url: `/partners/${partner_id}/service_points/${id}`,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'ServicePoint' as const, id }],
    }),

    // Создание новой сервисной точки
    createServicePoint: builder.mutation<ServicePoint, { partnerId: string | number; servicePoint: any }>({
      query: ({ partnerId, servicePoint }) => ({
        url: `/partners/${partnerId}/service_points`,
        method: 'POST',
        body: { service_point: servicePoint },
      }),
      invalidatesTags: [{ type: 'ServicePoint' as const, id: 'LIST' }],
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, { id: string; servicePoint: any }>({
      query: ({ id, servicePoint }) => ({
        url: `/partners/${servicePoint.partner_id}/service_points/${id}`,
        method: 'PATCH',
        body: { service_point: servicePoint },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ServicePoint' as const, id },
        { type: 'ServicePoint' as const, id: 'LIST' }
      ],
    }),

    // Удаление сервисной точки
    deleteServicePoint: builder.mutation<void, { partner_id: number; id: number }>({
      query: ({ partner_id, id }) => ({
        url: `/partners/${partner_id.toString()}/service_points/${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ServicePoint' as const, id: 'LIST' }],
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
          url: `/service_points/${id}/upload_photo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ServicePoint' as const, id },
        { type: 'ServicePointPhoto' as const, id: 'LIST' }
      ],
    }),

    getServicePointStatuses: builder.query<ApiResponse<ServicePointStatus>, void>({
      query: () => ({
        url: '/service_point_statuses',
        method: 'GET',
      }),
    }),
    
    // Новый endpoint для получения work statuses
    getWorkStatuses: builder.query<WorkStatus[], void>({
      query: () => ({
        url: '/service_points/work_statuses',
        method: 'GET',
      }),
    }),

    // Новый endpoint для получения service posts
    getServicePosts: builder.query<ServicePost[], string>({
      query: (servicePointId) => ({
        url: `/service_points/${servicePointId}/service_posts`,
        method: 'GET',
      }),
      providesTags: (result, error, servicePointId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServicePost' as const, id })),
              { type: 'ServicePost' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePost' as const, id: `LIST_${servicePointId}` }],
    }),

    // Новый endpoint для обновления service post
    updateServicePost: builder.mutation<ServicePost, { servicePointId: string; id: number; data: Partial<ServicePost> }>({
      query: ({ servicePointId, id, data }) => ({
        url: `/service_points/${servicePointId}/service_posts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { servicePointId, id }) => [
        { type: 'ServicePost' as const, id },
        { type: 'ServicePost' as const, id: `LIST_${servicePointId}` },
      ],
    }),
  }),
});

export const {
  useGetServicePointsQuery,
  useGetServicePointBasicInfoQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useDeleteServicePointMutation,
  useUploadServicePointPhotoMutation,
  useGetServicePointStatusesQuery,
  useGetWorkStatusesQuery,
  useGetServicePostsQuery,
  useUpdateServicePostMutation,
} = servicePointsApi;