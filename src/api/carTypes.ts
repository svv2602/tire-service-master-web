import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, CarType } from './types';

export const carTypesApi = createApi({
  reducerPath: 'carTypesApi',
  baseQuery,
  tagTypes: ['CarTypes'],
  endpoints: (builder) => ({
    getCarTypes: builder.query<PaginatedResponse<CarType>, void>({
      query: () => ({
        url: 'car_types',
      }),
      providesTags: ['CarTypes'],
    }),
  }),
});

export const { useGetCarTypesQuery } = carTypesApi; 