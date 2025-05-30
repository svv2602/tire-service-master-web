import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarBrand, CarBrandFormData } from '../types/car';
import { ApiResponse } from '../types/models';

interface CarBrandFilter {
  query?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiCarBrandsResponse {
  car_brands: Array<{
    id: number;
    name: string;
    logo: string | null;
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
      transformResponse: (response: ApiCarBrandsResponse) => ({
        data: response.car_brands.map(brand => ({
          ...brand,
          models_count: 0, // Это поле будет заполняться бэкендом
        })),
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: response.total_items,
          per_page: 25
        }
      }),
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
      query: (data) => {
        const formData = new FormData();
        formData.append('car_brand[name]', data.name);
        if (data.logo) {
          formData.append('car_brand[logo]', data.logo);
        }
        if (data.is_active !== undefined) {
          formData.append('car_brand[is_active]', String(data.is_active));
        }
        return {
          url: 'car_brands',
          method: 'POST',
          body: formData,
          // Не указываем formData: true, так как это не нужно
        };
      },
      invalidatesTags: ['CarBrands'],
    }),
    
    updateCarBrand: build.mutation<CarBrand, { id: string; data: Partial<CarBrandFormData> }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        if (data.name !== undefined) {
          formData.append('car_brand[name]', data.name);
        }
        if (data.logo) {
          formData.append('car_brand[logo]', data.logo);
        }
        if (data.is_active !== undefined) {
          formData.append('car_brand[is_active]', String(data.is_active));
        }
        return {
          url: `car_brands/${id}`,
          method: 'PATCH',
          body: formData,
          // Не указываем formData: true, так как это не нужно
        };
      },
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
      query: ({ id, is_active }) => {
        const formData = new FormData();
        formData.append('car_brand[is_active]', String(is_active));
        return {
          url: `car_brands/${id}`,
          method: 'PATCH',
          body: formData,
          // Не указываем formData: true, так как это не нужно
        };
      },
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
} = carBrandsApi;