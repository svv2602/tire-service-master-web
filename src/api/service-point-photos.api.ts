import { baseApi } from './baseApi';
import { ServicePointPhoto, ApiResponse } from '../types/models';

export const servicePointPhotosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение фотографий сервисной точки
    getServicePointPhotos: builder.query<ApiResponse<ServicePointPhoto>, string>({
      query: (servicePointId) => `service_points/${servicePointId}/photos`,
      providesTags: (result, error, servicePointId) => [
        { type: 'ServicePointPhoto', id: servicePointId },
        'ServicePointPhoto',
      ],
    }),

    // Загрузка фотографии
    uploadServicePointPhoto: builder.mutation<ServicePointPhoto, { servicePointId: string; file: File; description?: string; is_main?: boolean; sort_order?: number }>({
      query: ({ servicePointId, file, description, is_main, sort_order }) => {
        const formData = new FormData();
        formData.append('file', file);  // ИСПРАВЛЕНО: используем 'file' вместо 'photo'
        if (description) {
          formData.append('description', description);
        }
        if (is_main !== undefined) {
          formData.append('is_main', is_main.toString());
        }
        if (sort_order !== undefined) {
          formData.append('sort_order', sort_order.toString());
        }
        return {
          url: `service_points/${servicePointId}/photos`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { servicePointId }) => [
        { type: 'ServicePointPhoto', id: servicePointId },
        'ServicePointPhoto',
      ],
    }),

    // Удаление фотографии
    deleteServicePointPhoto: builder.mutation<void, { servicePointId: string; photoId: string }>({
      query: ({ servicePointId, photoId }) => ({
        url: `service_points/${servicePointId}/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { servicePointId }) => [
        { type: 'ServicePointPhoto', id: servicePointId },
        'ServicePointPhoto',
      ],
    }),

    // Обновление фотографии
    updateServicePointPhoto: builder.mutation<ServicePointPhoto, { servicePointId: string; photoId: string; description: string }>({
      query: ({ servicePointId, photoId, description }) => ({
        url: `service_points/${servicePointId}/photos/${photoId}`,
        method: 'PATCH',
        body: { description },
      }),
      invalidatesTags: (result, error, { servicePointId }) => [
        { type: 'ServicePointPhoto', id: servicePointId },
        'ServicePointPhoto',
      ],
    }),
  }),
});

export const {
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
  useUpdateServicePointPhotoMutation,
} = servicePointPhotosApi; 