import { baseApi } from './baseApi';
import { City, CitiesResponse } from '../types/models';

// API через baseApi.injectEndpoints
export const citiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<CitiesResponse, {
      region_id?: number;
      page?: number;
      per_page?: number;
      query?: string;
    }>({
      query: (params = {}) => ({
        url: 'cities',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...(params.region_id && { region_id: params.region_id }),
          ...(params.query && { query: params.query }),
        },
      }),
      providesTags: ['City'],
    }),
    getCitiesWithServicePoints: builder.query<CitiesResponse, void>({
      query: () => 'cities/with_service_points',
      providesTags: ['City'],
    }),
    getCityById: builder.query<{ data: City }, number>({
      query: (id) => `cities/${id}`,
      providesTags: (result, error, id) => [{ type: 'City', id }],
    }),
    createCity: builder.mutation<{ data: City }, Partial<City>>({
      query: (city) => ({
        url: 'cities',
        method: 'POST',
        body: { city },
      }),
      invalidatesTags: ['City'],
    }),
    updateCity: builder.mutation<{ data: City }, { id: number; city: Partial<City> }>({
      query: ({ id, city }) => ({
        url: `cities/${id}`,
        method: 'PUT',
        body: { city },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'City', id }, 'City'],
    }),
    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'City', id }, 'City'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetCitiesQuery,
  useGetCitiesWithServicePointsQuery,
  useGetCityByIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi; 