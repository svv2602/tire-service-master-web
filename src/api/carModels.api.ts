import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarModel, CarModelFormData } from '../types/car';
import { ApiResponse } from '../types/models';

interface CarModelFilter {
  query?: string;
  brand_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export const carModelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCarModels: build.query<ApiResponse<CarModel>, CarModelFilter>({
      query: (params = {}) => ({
        url: 'car-models',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'CarModels' as const, id })),
              'CarModels',
            ]
          : ['CarModels'],
    }),

    getCarModelsByBrandId: build.query<CarModel[], string>({
      query: (brandId: string) => `car-models?brand_id=${brandId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CarModels' as const, id })),
              'CarModels',
            ]
          : ['CarModels'],
    }),

    getCarModelById: build.query<CarModel, string>({
      query: (id: string) => `car-models/${id}`,
      providesTags: (_result, _err, id) => [
        { type: 'CarModels' as const, id }
      ],
    }),

    createCarModel: build.mutation<CarModel, CarModelFormData>({
      query: (data: CarModelFormData) => ({
        url: 'car-models',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CarModels'],
    }),

    updateCarModel: build.mutation<CarModel, { id: string; data: Partial<CarModelFormData> }>({
      query: ({ id, data }) => ({
        url: `car-models/${id}`,
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
        url: `car-models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarModels'],
    }),
    
    toggleCarModelActive: build.mutation<CarModel, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `car-models/${id}`,
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