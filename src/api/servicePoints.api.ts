import type { 
  ServicePoint, 
  ApiResponse, 
  ServicePointCreateRequest,
  ServicePointUpdateRequest,
  ServicePointFormData
} from '../types/models';
import { baseApi } from './baseApi';

// Инжектируем эндпоинты в baseApi
export const servicePointsApi = baseApi.injectEndpoints({
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
        url: '/service_points',
        params: params || undefined
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
    createServicePoint: builder.mutation<ServicePoint, { partnerId: string | number; servicePoint: ServicePointCreateRequest }>({
      query: ({ partnerId, servicePoint }) => ({
        url: `/partners/${partnerId}/service_points`,
        method: 'POST',
        body: { service_point: servicePoint }
      }),
      invalidatesTags: [{ type: 'ServicePoint' as const, id: 'LIST' }],
    }),

    // Обновление сервисной точки
    updateServicePoint: builder.mutation<ServicePoint, { id: string; servicePoint: ServicePointFormData }>({
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
} = servicePointsApi;