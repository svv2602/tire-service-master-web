import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { City, CityFormData } from '../types/location';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const citiesApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getCities: build.query<City[], void>({
      query: () => 'cities',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Cities' as const, id })),
              'Cities',
            ]
          : ['Cities'],
    }),

    getCitiesByRegionId: build.query<City[], string>({
      query: (regionId: string) => `cities?regionId=${regionId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Cities' as const, id })),
              'Cities',
            ]
          : ['Cities'],
    }),
    
    getCityById: build.query<City, string>({
      query: (id: string) => `cities/${id}`,
      providesTags: (_result: City | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Cities' as const, id }
      ],
    }),
    
    createCity: build.mutation<City, CityFormData>({
      query: (data: CityFormData) => ({
        url: 'cities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cities'],
    }),
    
    updateCity: build.mutation<City, { id: string; data: Partial<CityFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<CityFormData> }) => ({
        url: `cities/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: City | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Cities' as const, id },
        'Cities',
      ],
    }),
    
    deleteCity: build.mutation<void, string>({
      query: (id: string) => ({
        url: `cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cities'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCitiesQuery,
  useGetCitiesByRegionIdQuery,
  useGetCityByIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi; 