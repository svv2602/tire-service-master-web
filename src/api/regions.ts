import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { Region } from '../types/models';

interface RegionsResponse {
  regions: Region[];
  total_items: number;
}

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery,
  tagTypes: ['Regions'],
  endpoints: (builder) => ({
    getRegions: builder.query<RegionsResponse, void>({
      query: () => 'regions',
      providesTags: ['Regions'],
    }),
  }),
});

export const {
  useGetRegionsQuery,
} = regionsApi;
