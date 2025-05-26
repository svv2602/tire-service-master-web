import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Region, RegionFormData } from '../types/location';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const regionsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getRegions: build.query<Region[], void>({
      query: () => 'regions',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Regions' as const, id })),
              'Regions',
            ]
          : ['Regions'],
    }),
    
    getRegionById: build.query<Region, string>({
      query: (id: string) => `regions/${id}`,
      providesTags: (_result: Region | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Regions' as const, id }
      ],
    }),
    
    createRegion: build.mutation<Region, RegionFormData>({
      query: (data: RegionFormData) => ({
        url: 'regions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Regions'],
    }),
    
    updateRegion: build.mutation<Region, { id: string; data: Partial<RegionFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<RegionFormData> }) => ({
        url: `regions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Region | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Regions' as const, id },
        'Regions',
      ],
    }),
    
    deleteRegion: build.mutation<void, string>({
      query: (id: string) => ({
        url: `regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Regions'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetRegionsQuery,
  useGetRegionByIdQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionsApi; 