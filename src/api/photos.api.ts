import { baseApi } from './baseApi';

interface Photo {
  id: string;
  url: string;
  description?: string;
}

export const photosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<Photo[], string>({
      query: (servicePointId) => `service_points/${servicePointId}/photos`,
      providesTags: ['ServicePoint'],
    }),
    
    uploadServicePointPhoto: builder.mutation<Photo, { servicePointId: string; file: File }>({
      query: ({ servicePointId, file }) => ({
        url: `service_points/${servicePointId}/photos`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: ['ServicePoint'],
    }),
    
    deleteServicePointPhoto: builder.mutation<void, { servicePointId: string; photoId: string }>({
      query: ({ servicePointId, photoId }) => ({
        url: `service_points/${servicePointId}/photos/${photoId}`,
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
} = photosApi; 