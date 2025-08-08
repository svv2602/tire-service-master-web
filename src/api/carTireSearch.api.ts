import { baseApi } from './baseApi';

// Типы для API поиска шин по автомобилю
export interface CarBrand {
  id: number;
  name: string;
  configs_count: number;
  models_count: number;
}

export interface CarModel {
  id: number;
  name: string;
  brand_name: string;
  brand_id: number;
  configs_count: number;
}

export interface TireSize {
  width: number;
  height: number;
  diameter: number;
  type: string;
  year_from: number;
  year_to?: number;
}

export interface TireOffer {
  id: number;
  brand: string;
  model: string;
  size: string;
  season: string;
  price: number;
  tire_size_info: TireSize;
}

export interface ParsedQuery {
  brand: string;
  model: string;
  year?: number;
  original_query: string;
}

// Типы ответов API
export interface CarTireSearchResponse {
  status: 'brand_not_found' | 'brand_ambiguous' | 'model_not_found' | 'model_ambiguous' | 'model_required' | 'sizes_not_found' | 'success';
  message: string;
  brand?: CarBrand;
  brands?: CarBrand[];
  model?: CarModel;
  models?: CarModel[];
  popular_models?: CarModel[];
  available_models?: CarModel[];
  year?: number;
  tire_sizes?: TireSize[];
  tire_offers?: TireOffer[];
  query?: ParsedQuery;
  suggestions?: CarBrand[];
}

// Запросы API
export interface CarTireSearchRequest {
  query: string;
  locale?: string;
}

export interface ResolveBrandRequest {
  brand_id: number;
  query: string;
  locale?: string;
}

export interface ResolveModelRequest {
  model_id: number;
  year?: number;
  locale?: string;
}

// API endpoints
export const carTireSearchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Основной поиск шин по автомобилю
    searchCarTires: builder.mutation<CarTireSearchResponse, CarTireSearchRequest>({
      query: (data) => ({
        url: 'car_tire_search/search',
        method: 'POST',
        body: data,
      }),
    }),

    // Разрешение неоднозначности брендов
    resolveBrand: builder.mutation<CarTireSearchResponse, ResolveBrandRequest>({
      query: (data) => ({
        url: 'car_tire_search/resolve_brand',
        method: 'POST',
        body: data,
      }),
    }),

    // Получение размеров шин для конкретной модели
    resolveModel: builder.mutation<CarTireSearchResponse, ResolveModelRequest>({
      query: (data) => ({
        url: 'car_tire_search/resolve_model',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useSearchCarTiresMutation,
  useResolveBrandMutation,
  useResolveModelMutation,
} = carTireSearchApi;