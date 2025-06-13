import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CarModel } from '../types';
import config from '../config';

interface CarModelsResponse {
  data: CarModel[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

interface CarModelFilters {
  page?: number;
  per_page?: number;
  query?: string;
  is_active?: boolean;
  is_popular?: boolean;
  brand_id?: number;
}

export const carModelsApi = createApi({
  reducerPath: 'carModelsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${config.API_URL}` }),
  tagTypes: ['CarModels'],
  endpoints: (builder) => ({
    getCarModels: builder.query<CarModelsResponse, CarModelFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        if (filters.query) params.append('query', filters.query);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.is_popular !== undefined) params.append('is_popular', filters.is_popular.toString());
        if (filters.brand_id) params.append('brand_id', filters.brand_id.toString());
        
        return {
          url: `/car-models?${params.toString()}`,
        };
      },
      providesTags: ['CarModels'],
    }),
    
    getCarModelById: builder.query<CarModel, number>({
      query: (id) => `/car-models/${id}`,
      providesTags: (result, error, id) => [{ type: 'CarModels', id }],
    }),
    
    getCarModelsByBrand: builder.query<CarModelsResponse, string>({
      query: (brandId) => `/car-brands/${brandId}/models`,
      providesTags: (result, error, brandId) => [{ type: 'CarModels', id: `brand-${brandId}` }],
    }),
  }),
});

export const {
  useGetCarModelsQuery,
  useGetCarModelByIdQuery,
  useGetCarModelsByBrandQuery,
} = carModelsApi; 