import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarModel, CarModelFormData } from '../types/car';
import { ApiResponse } from '../types/models';
import { transformPaginatedResponse } from './apiUtils';

interface CarModelFilter {
  query?: string;
  brand_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
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
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'CarModels' as const, id })),
              'CarModels',
            ]
          : ['CarModels'],
    }),

    getCarModelsByBrandId: build.query<CarModel[], string>({
      query: (brandId: string) => `car_models?brand_id=${brandId}`,
      transformResponse: (response: ApiCarModelsResponse): CarModel[] => {
        return response.car_models.map(model => ({
          id: model.id,
          brand_id: model.brand_id,
          name: model.name,
          is_active: model.is_active,
          created_at: model.created_at,
          updated_at: model.updated_at,
          brand: {
            id: model.brand.id,
            name: model.brand.name,
            logo: model.brand.logo,
            is_active: model.brand.is_active,
            models_count: model.brand.models_count,
            created_at: model.brand.created_at,
            updated_at: model.brand.updated_at,
          },
        }));
      },
      providesTags: (result) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'CarModels' as const, id })),
            'CarModels',
          ];
        }
        return ['CarModels'];
      },
    }),

    getCarModelById: build.query<CarModel, string>({
      query: (id: string) => `car_models/${id}`,
      providesTags: (_result, _err, id) => [
        { type: 'CarModels' as const, id }
      ],
    }),

    createCarModel: build.mutation<CarModel, CarModelFormData>({
      query: (data: CarModelFormData) => ({
        url: 'car_models',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CarModels'],
    }),

    updateCarModel: build.mutation<CarModel, { id: string; data: Partial<CarModelFormData> }>({
      query: ({ id, data }) => ({
        url: `car_models/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarModels' as const, id },
        'CarModels',
      ],
    }),

    deleteCarModel: build.mutation<void, string>({
      query: (id: string) => ({
        url: `car_models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarModels'],
    }),
    
    toggleCarModelActive: build.mutation<CarModel, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `car_models/${id}`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'CarModels' as const, id },
        'CarModels',
      ],
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