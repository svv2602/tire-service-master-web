import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { ServicePointService } from '../types/models';

interface GetServicePointServicesParams {
  service_point_id: number;
}

export const servicePointServicesApi = createApi({
  reducerPath: 'servicePointServicesApi',
  baseQuery,
  tagTypes: ['ServicePointServices'],
  endpoints: (builder) => ({
    getServicePointServices: builder.query<{ data: ServicePointService[] }, GetServicePointServicesParams>({
      query: (params) => `/service_points/${params.service_point_id}/services`,
      providesTags: ['ServicePointServices'],
    }),
  }),
});

export const { useGetServicePointServicesQuery } = servicePointServicesApi; 