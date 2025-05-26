import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, TireType } from './types';

export const tireTypesApi = createApi({
  reducerPath: 'tireTypesApi',
  baseQuery,
  tagTypes: ['TireTypes'],
  endpoints: (builder) => ({
    getTireTypes: builder.query<PaginatedResponse<TireType>, void>({
      query: () => ({
        url: 'tire_types',
      }),
      providesTags: ['TireTypes'],
    }),
  }),
});

export const { useGetTireTypesQuery } = tireTypesApi; 