import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Region, RegionFilter, ApiResponse } from '../types/models';

// Расширяем базовый API для работы с регионами
export const regionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка регионов
    getRegions: builder.query<ApiResponse<Region>, RegionFilter>({
      query: (params) => ({
        url: 'regions',
        method: 'GET',
        params,
      }),
      providesTags: ['Region'],
    }),

    // Получение региона по ID
    getRegionById: builder.query<Region, string>({
      query: (id) => ({
        url: `regions/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Region', id }],
    }),

    // Создание нового региона
    createRegion: builder.mutation<Region, Partial<Region>>({
      query: (region) => ({
        url: 'regions',
        method: 'POST',
        body: region,
      }),
      invalidatesTags: ['Region'],
    }),

    // Обновление региона
    updateRegion: builder.mutation<Region, { id: string; region: Partial<Region> }>({
      query: ({ id, region }) => ({
        url: `regions/${id}`,
        method: 'PUT',
        body: region,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Region', id }],
    }),

    // Удаление региона
    deleteRegion: builder.mutation<void, string>({
      query: (id) => ({
        url: `regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Region'],
    }),
  }),
});

// Экспортируем хуки
export const {
  useGetRegionsQuery,
  useGetRegionByIdQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionsApi; 