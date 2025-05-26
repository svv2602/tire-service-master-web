import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarModel, CarModelFormData } from '../types/car';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const carModelsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getCarModels: build.query<CarModel[], void>({
      query: () => 'car-models',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CarModels' as const, id })),
              'CarModels',
            ]
          : ['CarModels'],
    }),

    getCarModelsByBrandId: build.query<CarModel[], string>({
      query: (brandId: string) => `car-models?brandId=${brandId}`,
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
      providesTags: (_result: CarModel | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
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
      query: ({ id, data }: { id: string; data: Partial<CarModelFormData> }) => ({
        url: `car-models/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: CarModel | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
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
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCarModelsQuery,
  useGetCarModelsByBrandIdQuery,
  useGetCarModelByIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
} = carModelsApi; 