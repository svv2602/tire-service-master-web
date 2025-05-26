import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { CarModel } from '../types/models';

// Интерфейс для ответа API с пагинацией
interface CarModelsResponse {
  data: CarModel[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

// Параметры запроса моделей
interface CarModelsQueryParams {
  brand_id?: number;
  query?: string;
  is_active?: boolean;
  is_popular?: boolean;
  page?: number;
  per_page?: number;
}

// Данные формы модели
export interface CarModelFormData {
  brand_id: number;
  name: string;
  is_active?: boolean;
  is_popular?: boolean;
}

export const carModelsApi = createApi({
  reducerPath: 'carModelsApi',
  baseQuery,
  tagTypes: ['CarModels'],
  endpoints: (builder) => ({
    getCarModels: builder.query<CarModelsResponse, CarModelsQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        return {
          url: 'car_models',
          params: {
            brand_id: queryParams.brand_id,
            query: queryParams.query,
            is_active: queryParams.is_active,
            is_popular: queryParams.is_popular,
            page: queryParams.page || 1,
            per_page: queryParams.per_page || 25,
          },
        };
      },
      providesTags: ['CarModels'],
    }),
    getCarModel: builder.query<CarModel, number>({
      query: (id) => `car_models/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'CarModels', id }],
    }),
    createCarModel: builder.mutation<CarModel, CarModelFormData>({
      query: (data) => ({
        url: 'car_models',
        method: 'POST',
        body: { car_model: data },
      }),
      invalidatesTags: ['CarModels'],
    }),
    updateCarModel: builder.mutation<CarModel, { id: number; data: Partial<CarModelFormData> }>({
      query: ({ id, data }) => ({
        url: `car_models/${id}`,
        method: 'PATCH',
        body: { car_model: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarModels', id }],
    }),
    deleteCarModel: builder.mutation<void, number>({
      query: (id) => ({
        url: `car_models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarModels'],
    }),
    toggleCarModelActive: builder.mutation<CarModel, { id: number; active?: boolean }>({
      query: ({ id, active }) => ({
        url: `car_models/${id}/toggle_active`,
        method: 'PATCH',
        body: active !== undefined ? { active } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarModels', id }],
    }),
    toggleCarModelPopular: builder.mutation<CarModel, { id: number; popular?: boolean }>({
      query: ({ id, popular }) => ({
        url: `car_models/${id}/toggle_popular`,
        method: 'PATCH',
        body: popular !== undefined ? { popular } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CarModels', id }],
    }),
  }),
});

export const {
  useGetCarModelsQuery,
  useGetCarModelQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
  useToggleCarModelActiveMutation,
  useToggleCarModelPopularMutation,
} = carModelsApi;
