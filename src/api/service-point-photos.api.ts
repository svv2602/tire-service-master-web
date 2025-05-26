import { baseApi } from './baseApi';
import { ServicePointPhoto } from '../types/servicePoint';

interface ServicePointPhotosResponse {
  data: ServicePointPhoto[];
}

export const servicePointPhotosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<ServicePointPhotosResponse, number>({
      query: (servicePointId) => `/service-points/${servicePointId}/photos`,
      providesTags: (_result, _error, servicePointId) => [
        { type: 'ServicePointPhotos', id: servicePointId },
        'ServicePointPhotos',
      ],
    }),

    uploadServicePointPhoto: builder.mutation<ServicePointPhoto, { id: number; photo: FormData }>({
      query: ({ id, photo }) => ({
        url: `/service-points/${id}/photos`,
        method: 'POST',
        body: photo,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ServicePointPhotos', id },
        'ServicePointPhotos',
      ],
    }),

    deleteServicePointPhoto: builder.mutation<void, { servicePointId: number; photoId: number }>({
      query: ({ servicePointId, photoId }) => ({
        url: `/service-points/${servicePointId}/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { servicePointId }) => [
        { type: 'ServicePointPhotos', id: servicePointId },
        'ServicePointPhotos',
      ],
    }),
  }),
});

export const {
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} = servicePointPhotosApi; 