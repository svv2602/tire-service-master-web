import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { City } from '../types/models';

interface CitiesResponse {
  cities: City[];
  total_items: number;
}

interface CitiesQueryParams {
  region_id?: number;
}

export const citiesApi = createApi({
  reducerPath: 'citiesApi',
  baseQuery,
  tagTypes: ['Cities'],
  endpoints: (builder) => ({
    getCities: builder.query<CitiesResponse, CitiesQueryParams>({
      query: (params) => ({
        url: 'cities',
        params,
      }),
      providesTags: ['Cities'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
} = citiesApi; 