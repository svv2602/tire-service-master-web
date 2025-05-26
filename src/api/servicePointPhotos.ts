import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

interface ServicePointPhoto {
  id: number;
  url: string;
  description?: string;
  is_main: boolean;
}

interface GetServicePointPhotosParams {
  service_point_id: number;
}

export const servicePointPhotosApi = createApi({
  reducerPath: 'servicePointPhotosApi',
  baseQuery,
  tagTypes: ['ServicePointPhotos'],
  endpoints: (builder) => ({
    getServicePointPhotos: builder.query<{ data: ServicePointPhoto[] }, GetServicePointPhotosParams>({
      query: (params) => `/service_points/${params.service_point_id}/photos`,
      providesTags: ['ServicePointPhotos'],
    }),
  }),
});

export const { useGetServicePointPhotosQuery } = servicePointPhotosApi; 