import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { CarBrand } from '../types/models';

// Интерфейс для ответа API с пагинацией
interface CarBrandsResponse {
  data: CarBrand[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

// Параметры запроса брендов
interface CarBrandsQueryParams {
  query?: string;
  is_active?: boolean;
  is_popular?: boolean;
  page?: number;
  per_page?: number;
}

// Данные формы бренда
export interface CarBrandFormData {
  name: string;
  code: string;
  logo_url?: string;
  is_active?: boolean;
  is_popular?: boolean;
}

export const carBrandsApi = createApi({
  reducerPath: 'carBrandsApi',
  baseQuery,
  tagTypes: ['CarBrands'],
  endpoints: (builder) => ({
    getCarBrands: builder.query<CarBrandsResponse, CarBrandsQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        return {
          url: 'car_brands',
          params: {
            query: queryParams.query,
            is_active: queryParams.is_active,
            is_popular: queryParams.is_popular,
            page: queryParams.page || 1,
            per_page: queryParams.per_page || 25,
          },
        };
      },
      providesTags: ['CarBrands'],
    }),
    getCarBrand: builder.query<CarBrand, number>({
      query: (id) => `car_brands/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'CarBrands', id }],
    }),
    createCarBrand: builder.mutation<CarBrand, CarBrandFormData>({
      query: (data) => ({
        url: 'car_brands',
        method: 'POST',
        body: { car_brand: data },
      }),
      invalidatesTags: ['CarBrands'],
    }),
    updateCarBrand: builder.mutation<CarBrand, { id: number; data: Partial<CarBrandFormData> }>({
      query: ({ id, data }) => ({
        url: `car_brands/${id}`,
        method: 'PATCH',
        body: { car_brand: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarBrands', id }],
    }),
    deleteCarBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `car_brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarBrands'],
    }),
    toggleCarBrandActive: builder.mutation<CarBrand, { id: number; active?: boolean }>({
      query: ({ id, active }) => ({
        url: `car_brands/${id}/toggle_active`,
        method: 'PATCH',
        body: active !== undefined ? { active } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarBrands', id }],
    }),
    toggleCarBrandPopular: builder.mutation<CarBrand, { id: number; popular?: boolean }>({
      query: ({ id, popular }) => ({
        url: `car_brands/${id}/toggle_popular`,
        method: 'PATCH',
        body: popular !== undefined ? { popular } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarBrands', id }],
    }),
  }),
});

export const {
  useGetCarBrandsQuery,
  useGetCarBrandQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
  useToggleCarBrandPopularMutation,
} = carBrandsApi;
