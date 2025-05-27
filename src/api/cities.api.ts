import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { City, CityFilter, ApiResponse } from '../types/models';

export const citiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<ApiResponse<City>, CityFilter>({
      query: (params) => ({
        url: 'cities',
        method: 'GET',
        params,
      }),
      providesTags: ['City'],
    }),

    getCitiesByRegion: builder.query<City[], number>({
      query: (regionId) => ({
        url: 'cities',
        method: 'GET',
        params: { regionId },
      }),
      providesTags: ['City'],
    }),

    getCityById: builder.query<City, number>({
      query: (id) => ({
        url: `cities/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'City', id }],
    }),

    createCity: builder.mutation<City, Partial<City>>({
      query: (city) => ({
        url: 'cities',
        method: 'POST',
        body: city,
      }),
      invalidatesTags: ['City'],
    }),

    updateCity: builder.mutation<City, { id: number; city: Partial<City> }>({
      query: ({ id, city }) => ({
        url: `cities/${id}`,
        method: 'PUT',
        body: city,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'City', id }],
    }),

    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['City'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetCitiesByRegionQuery,
  useGetCityByIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi; 