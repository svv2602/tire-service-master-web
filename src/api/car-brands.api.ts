import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CarBrand } from '../types';
import config from '../config';

interface CarBrandsResponse {
  data: CarBrand[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

interface CarBrandFilters {
  page?: number;
  per_page?: number;
  query?: string;
  is_active?: boolean;
  is_popular?: boolean;
}

export const carBrandsApi = createApi({
  reducerPath: 'carBrandsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${config.API_URL}` }),
  tagTypes: ['CarBrands'],
  endpoints: (builder) => ({
    getCarBrands: builder.query<CarBrandsResponse, CarBrandFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        if (filters.query) params.append('query', filters.query);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.is_popular !== undefined) params.append('is_popular', filters.is_popular.toString());
        
        return {
          url: `/car-brands?${params.toString()}`,
        };
      },
      providesTags: ['CarBrands'],
    }),
    
    getCarBrandById: builder.query<CarBrand, number>({
      query: (id) => `/car-brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'CarBrands', id }],
    }),
  }),
});

export const {
  useGetCarBrandsQuery,
  useGetCarBrandByIdQuery,
} = carBrandsApi; 