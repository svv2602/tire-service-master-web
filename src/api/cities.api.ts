import type { City, ApiResponse, CityFilter } from '../types/models';
import { baseApi } from './baseApi';

// Инжектируем эндпоинты в baseApi
export const citiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<ApiResponse<City>, CityFilter>({
      query: (params) => ({
        url: 'cities',
        params: {
          region_id: params.region_id
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'City' as const, id })),
              { type: 'City' as const, id: 'LIST' },
            ]
          : [{ type: 'City' as const, id: 'LIST' }],
    }),

    getCitiesByRegion: builder.query<City[], number>({
      query: (regionId) => ({
        url: 'cities',
        method: 'GET',
        params: { regionId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'City' as const, id })),
              { type: 'City' as const, id: 'LIST' },
            ]
          : [{ type: 'City' as const, id: 'LIST' }],
    }),

    getCityById: builder.query<City, number>({
      query: (id) => ({
        url: `cities/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'City' as const, id }],
    }),

    createCity: builder.mutation<City, Partial<City>>({
      query: (city) => ({
        url: 'cities',
        method: 'POST',
        body: city,
      }),
      invalidatesTags: [{ type: 'City' as const, id: 'LIST' }],
    }),

    updateCity: builder.mutation<City, { id: number; city: Partial<City> }>({
      query: ({ id, city }) => ({
        url: `cities/${id}`,
        method: 'PUT',
        body: city,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'City' as const, id },
        { type: 'City' as const, id: 'LIST' }
      ],
    }),

    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'City' as const, id: 'LIST' }],
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