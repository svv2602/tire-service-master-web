import { baseApi } from './baseApi';

interface Photo {
  id: string;
  url: string;
  description?: string;
}

export const photosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<Photo[], string>({
      query: (servicePointId) => `service-points/${servicePointId}/photos`,
      providesTags: ['ServicePoint'],
    }),
    
    uploadServicePointPhoto: builder.mutation<Photo, { servicePointId: string; file: File }>({
      query: ({ servicePointId, file }) => {
        const formData = new FormData();
        formData.append('photo', file);
        return {
          url: `service-points/${servicePointId}/photos`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['ServicePoint'],
    }),
    
    deleteServicePointPhoto: builder.mutation<void, { servicePointId: string; photoId: string }>({
      query: ({ servicePointId, photoId }) => ({
        url: `service-points/${servicePointId}/photos/${photoId}`,
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