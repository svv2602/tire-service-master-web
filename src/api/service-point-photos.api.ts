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
    uploadServicePointPhoto: builder.mutation<ServicePointPhoto, { servicePointId: string; file: File; description?: string }>({
      query: ({ servicePointId, file, description }) => {
        const formData = new FormData();
        formData.append('photo', file);
        if (description) {
          formData.append('description', description);
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