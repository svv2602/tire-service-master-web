import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, ServicePointPhoto } from './types';

interface GetServicePointPhotosParams {
  service_point_id: number;
  is_main?: boolean;
}

interface CreateServicePointPhotoData {
  service_point_id: number;
  url: string;
  description?: string;
  is_main?: boolean;
}

interface UpdateServicePointPhotoData {
  url?: string;
  description?: string;
  is_main?: boolean;
}

export const servicePointPhotosApi = createApi({
  reducerPath: 'servicePointPhotosApi',
  baseQuery,
  tagTypes: ['ServicePointPhotos'],
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<PaginatedResponse<ServicePointPhoto>, GetServicePointPhotosParams>({
      query: (params) => ({
        url: 'service_point_photos',
        params,
      }),
      providesTags: ['ServicePointPhotos'],
    }),
    
    getServicePointPhoto: builder.query<ServicePointPhoto, number>({
      query: (id) => `service_point_photos/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ServicePointPhotos', id }],
    }),
    
    createServicePointPhoto: builder.mutation<ServicePointPhoto, CreateServicePointPhotoData>({
      query: (data) => ({
        url: 'service_point_photos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServicePointPhotos'],
    }),
    
    updateServicePointPhoto: builder.mutation<ServicePointPhoto, { id: number; data: UpdateServicePointPhotoData }>({
      query: ({ id, data }) => ({
        url: `service_point_photos/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ServicePointPhotos', id }],
    }),
    
    deleteServicePointPhoto: builder.mutation<void, number>({
      query: (id) => ({
        url: `service_point_photos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicePointPhotos'],
    }),
  }),
});

export const {
  useGetServicePointPhotosQuery,
  useGetServicePointPhotoQuery,
  useCreateServicePointPhotoMutation,
  useUpdateServicePointPhotoMutation,
  useDeleteServicePointPhotoMutation,
} = servicePointPhotosApi; 