import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarModel, CarModelFormData, CarModelsResponse } from '../types/car';
import { ApiResponse, PaginationFilter } from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

interface CarModelFilter extends PaginationFilter {
  query?: string;
  active?: boolean;
}

// Интерфейс для ответа API (как приходит с бэкенда)
interface ApiCarModelsResponse {
  car_models: Array<{
    id: number;
    brand_id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    brand: {
      id: number;
      name: string;
      logo: string | null;
      is_active: boolean;
      models_count: number;
      created_at: string;
      updated_at: string;
    };
  }>;
  total_items: number;
}

export const carModelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCarModels: build.query<ApiResponse<CarModel>, CarModelFilter>({
      query: (params = {}) => ({
        url: 'car_models',
        params,
      }),
      transformResponse: (response: ApiResponse<CarModel>) => transformPaginatedResponse(response),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'CarModels' as const, id })),
              'CarModels',
            ]
          : ['CarModels'],
    }),

    getCarModelsByBrandId: build.query<CarModelsResponse, { brandId: string; params?: CarModelFilter }>({
      query: ({ brandId, params = {} }) => ({
        url: `car_brands/${brandId}/car_models`,
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          query: params.query,
          active: params.active,
        },
      }),
      providesTags: (result, error, { brandId }) => [{ type: 'CarModels', id: brandId }],
    }),

    getCarModelById: build.query<CarModel, string>({
      query: (id: string) => `car_models/${id}`,
      providesTags: (_result, _err, id) => [
        { type: 'CarModels' as const, id }
      ],
    }),

    createCarModel: build.mutation<CarModel, { brandId: string; data: CarModelFormData }>({
      query: ({ brandId, data }) => ({
        url: `car_brands/${brandId}/car_models`,
        method: 'POST',
        body: { car_model: data },
      }),
      invalidatesTags: (result, error, { brandId }) => [{ type: 'CarModels', id: brandId }],
    }),

    updateCarModel: build.mutation<CarModel, { brandId: string; id: string; data: CarModelFormData }>({
      query: ({ brandId, id, data }) => ({
        url: `car_brands/${brandId}/car_models/${id}`,
        method: 'PUT',
        body: { car_model: data },
      }),
      invalidatesTags: (result, error, { brandId }) => [{ type: 'CarModels', id: brandId }],
    }),

    deleteCarModel: build.mutation<void, { brandId: string; id: string }>({
      query: ({ brandId, id }) => ({
        url: `car_brands/${brandId}/car_models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { brandId }) => [{ type: 'CarModels', id: brandId }],
    }),
    
    toggleCarModelActive: build.mutation<CarModel, { brandId: string; id: string; is_active: boolean }>({
      query: ({ brandId, id, is_active }) => ({
        url: `car_brands/${brandId}/car_models/${id}`,
        method: 'PATCH',
        body: { car_model: { is_active } },
      }),
      invalidatesTags: (result, error, { brandId }) => [{ type: 'CarModels', id: brandId }],
    }),
  }),
});

export const {
  useGetCarModelsQuery,
  useGetCarModelsByBrandIdQuery,
  useGetCarModelByIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
  useToggleCarModelActiveMutation,
} = carModelsApi;