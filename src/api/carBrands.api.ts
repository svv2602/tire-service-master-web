import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarBrand, CarBrandFormData } from '../types/car';
import { ApiResponse } from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

interface CarBrandFilter {
  query?: string;
  is_active?: boolean;
  is_popular?: boolean;
  page?: number;
  per_page?: number;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiCarBrandsResponse {
  car_brands: Array<{
    id: number;
    name: string;
    logo?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  total_items: number;
}

export const carBrandsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCarBrands: build.query<ApiResponse<CarBrand>, CarBrandFilter>({
      query: (params = {}) => ({
        url: 'car_brands',
        params,
      }),
      transformResponse: (response: ApiResponse<CarBrand>) => transformPaginatedResponse(response),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'CarBrands' as const, id })),
              'CarBrands',
            ]
          : ['CarBrands'],
    }),
    
    getCarBrandById: build.query<CarBrand, string>({
      query: (id: string) => `car_brands/${id}`,
      providesTags: (_result, _err, id) => [
        { type: 'CarBrands' as const, id }
      ],
    }),
    
    createCarBrand: build.mutation<CarBrand, CarBrandFormData>({
      query: (data: CarBrandFormData) => ({
        url: 'car_brands',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CarBrands'],
    }),
    
    updateCarBrand: build.mutation<CarBrand, { id: string; data: Partial<CarBrandFormData> }>({
      query: ({ id, data }) => ({
        url: `car_brands/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
    
    deleteCarBrand: build.mutation<void, string>({
      query: (id: string) => ({
        url: `car_brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarBrands'],
    }),
    
    toggleCarBrandActive: build.mutation<CarBrand, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `car_brands/${id}`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
    
    toggleCarBrandPopular: build.mutation<CarBrand, { id: string; is_popular: boolean }>({
      query: ({ id, is_popular }) => ({
        url: `car_brands/${id}`,
        method: 'PATCH',
        body: { is_popular },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCarBrandsQuery,
  useGetCarBrandByIdQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useDeleteCarBrandMutation,
  useToggleCarBrandActiveMutation,
  useToggleCarBrandPopularMutation,
} = carBrandsApi;