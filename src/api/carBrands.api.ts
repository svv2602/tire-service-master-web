import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { CarBrand, CarBrandFormData } from '../types/car';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const carBrandsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getCarBrands: build.query<CarBrand[], void>({
      query: () => 'car-brands',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CarBrands' as const, id })),
              'CarBrands',
            ]
          : ['CarBrands'],
    }),
    
    getCarBrandById: build.query<CarBrand, string>({
      query: (id: string) => `car-brands/${id}`,
      providesTags: (_result: CarBrand | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'CarBrands' as const, id }
      ],
    }),
    
    createCarBrand: build.mutation<CarBrand, CarBrandFormData>({
      query: (data: CarBrandFormData) => ({
        url: 'car-brands',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CarBrands'],
    }),
    
    updateCarBrand: build.mutation<CarBrand, { id: string; data: Partial<CarBrandFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<CarBrandFormData> }) => ({
        url: `car-brands/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: CarBrand | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'CarBrands' as const, id },
        'CarBrands',
      ],
    }),
    
    deleteCarBrand: build.mutation<void, string>({
      query: (id: string) => ({
        url: `car-brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarBrands'],
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
} = carBrandsApi; 