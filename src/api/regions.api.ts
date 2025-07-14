import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Region, RegionFilter, ApiResponse } from '../types/models';

// Определяем тип для тега Region
type RegionTag = { type: 'Region'; id: number | 'LIST' };

// Расширяем базовый API для работы с регионами
export const regionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка регионов
    getRegions: builder.query<ApiResponse<Region>, RegionFilter & { locale?: string }>({
      query: (params) => ({
        url: 'regions',
        method: 'GET',
        params: {
          ...params,
          // Автоматически добавляем текущий язык если не указан
          locale: params.locale || localStorage.getItem('i18nextLng') || 'ru'
        },
      }),
      providesTags: ['Region'],
    }),

    // Получение региона по ID
    getRegionById: builder.query<Region, number>({
      query: (id) => ({
        url: `regions/${id}`,
        method: 'GET',
      }),
      providesTags: ['Region'],
    }),

    // Создание нового региона
    createRegion: builder.mutation<Region, Partial<Region>>({
      query: (region) => ({
        url: 'regions',
        method: 'POST',
        body: { region },
      }),
      invalidatesTags: ['Region'],
    }),

    // Обновление региона
    updateRegion: builder.mutation<Region, { id: number; region: Partial<Region> }>({
      query: ({ id, region }) => ({
        url: `regions/${id}`,
        method: 'PUT',
        body: { region },
      }),
      invalidatesTags: ['Region'],
    }),

    // Удаление региона
    deleteRegion: builder.mutation<void, number>({
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