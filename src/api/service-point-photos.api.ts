import { baseApi } from './baseApi';

interface ServicePointPhoto {
  id: number;
  service_point_id: number;
  url: string;
  description?: string;
  is_main: boolean;
}

interface ServicePointPhotosResponse {
  data: ServicePointPhoto[];
}

export const servicePointPhotosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<ServicePointPhotosResponse, number>({
      query: (servicePointId) => `/service-points/${servicePointId}/photos`,
      providesTags: ['ServicePoint'],
    }),

    uploadServicePointPhoto: builder.mutation<ServicePointPhoto, { id: number; photo: FormData }>({
      query: ({ id, photo }) => ({
        url: `/service-points/${id}/photos`,
        method: 'POST',
        body: photo,
      }),
      invalidatesTags: ['ServicePoint'],
    }),

    deleteServicePointPhoto: builder.mutation<void, { servicePointId: number; photoId: number }>({
      query: ({ servicePointId, photoId }) => ({
        url: `/service-points/${servicePointId}/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePoint'],
    }),
  }),
});

export const {
  useGetServicePointPhotosQuery,
  useUploadServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} = servicePointPhotosApi; 