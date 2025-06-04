import type { 
  ServicePoint, 
  ApiResponse, 
  ServicePointCreateRequest,
  ServicePointUpdateRequest,
  ServicePointFormData,
  ServicePointStatus,
  ServicePost
} from '../types/models';
import { baseApi } from './baseApi';

// Добавляем тип для work status
export interface WorkStatus {
  value: string;
  label: string;
  description: string;
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
    createServicePoint: builder.mutation<ServicePoint, { partnerId: string | number; servicePoint: FormData | any }>({
      query: ({ partnerId, servicePoint }) => {
        if (servicePoint instanceof FormData) {
          return {
            url: `/partners/${partnerId}/service_points`,
            method: 'POST',
            body: servicePoint,
          };
        } else {
          return {
            url: `/partners/${partnerId}/service_points`,
            method: 'POST',
            body: { service_point: servicePoint },
          };
        }
      },
      invalidatesTags: [{ type: 'ServicePoint' as const, id: 'LIST' }],
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, { id: string; servicePoint: FormData | any }>({
      query: ({ id, servicePoint }) => {
        // Извлекаем partner_id из FormData или объекта
        let partnerId;
        if (servicePoint instanceof FormData) {
          // Для FormData partner_id теперь в основных полях
          partnerId = servicePoint.get('service_point[partner_id]');
          console.log('partner_id from FormData:', partnerId);
          
          return {
            url: `/partners/${partnerId}/service_points/${id}`,
            method: 'PATCH',
            body: servicePoint,
          };
        } else {
          return {
            url: `/partners/${servicePoint.partner_id}/service_points/${id}`,
            method: 'PATCH',
            body: { service_point: servicePoint },
          };
        }
      },
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

    // Новый endpoint для получения услуг сервисной точки
    getServicePointServices: builder.query<any[], string>({
      query: (servicePointId) => ({
        url: `/service_points/${servicePointId}/services`,
        method: 'GET',
      }),
      providesTags: (result, error, servicePointId) =>
        result
          ? [
              ...result.map((_, index) => ({ type: 'ServicePointService' as const, id: `${servicePointId}_${index}` })),
              { type: 'ServicePointService' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePointService' as const, id: `LIST_${servicePointId}` }],
    }),

    // Новый endpoint для получения фотографий сервисной точки
    getServicePointPhotos: builder.query<any[], string>({
      query: (servicePointId) => ({
        url: `/service_points/${servicePointId}/photos`,
        method: 'GET',
      }),
      providesTags: (result, error, servicePointId) =>
        result
          ? [
              ...result.map((_, index) => ({ type: 'ServicePointPhoto' as const, id: `${servicePointId}_${index}` })),
              { type: 'ServicePointPhoto' as const, id: `LIST_${servicePointId}` },
            ]
          : [{ type: 'ServicePointPhoto' as const, id: `LIST_${servicePointId}` }],
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
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
} = servicePointsApi;