import { baseApi } from './baseApi';

// Интерфейсы для данных нормализации
export interface NormalizationStats {
  total_products: number;
  brand_coverage: number;
  model_coverage: number;
  country_coverage: number;
  quality_score_coverage: number;
  reference_data: {
    countries_count: number;
    brands_count: number;
    models_count: number;
  };
  last_update: string;
}

export interface UnprocessedProduct {
  id: number;
  external_id: string;
  name: string;
  original_brand: string;
  original_model: string;
  original_country: string;
  size_designation: string;
  season: string;
  price_uah: number | null;
  supplier: {
    id: number;
    name: string;
  };
  normalization_status: {
    has_brand: boolean;
    has_model: boolean;
    has_country: boolean;
    has_score: boolean;
  };
  missing_fields: string[];
}

export interface UnprocessedProductsResponse {
  data: UnprocessedProduct[];
  meta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    missing_type: string;
  };
}

export interface TopUnprocessedItem {
  name: string;
  count: number;
  type: 'brand' | 'country' | 'model';
  suppliers?: Array<{
    name: string;
    count: number;
    id: number;
  }>;
}

export interface TopUnprocessedResponse {
  type: string;
  data: TopUnprocessedItem[];
  total_missing: number;
}

export interface NormalizationRunResult {
  success: boolean;
  message: string;
  statistics?: {
    total_products: number;
    processed: number;
    normalized_brands: number;
    normalized_countries: number;
    normalized_models: number;
    failed: number;
    processing_time_ms: number;
    summary: string;
  };
  error?: string;
}

// API endpoints для нормализации
export const normalizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение статистики нормализации
    getNormalizationStats: builder.query<NormalizationStats, void>({
      query: () => ({
        url: 'normalization/stats',
      }),
      providesTags: ['NormalizationStats'],
    }),

    // Получение ненормализованных товаров
    getUnprocessedProducts: builder.query<UnprocessedProductsResponse, {
      page?: number;
      per_page?: number;
      missing_type?: 'brand' | 'country' | 'model' | 'score';
      supplier_id?: number;
      search?: string;
    }>({
      query: (params) => ({
        url: 'normalization/unprocessed',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          missing_type: params.missing_type || 'brand',
          supplier_id: params.supplier_id,
          search: params.search,
        },
      }),
      providesTags: ['UnprocessedProducts'],
    }),

    // Получение топа необработанных записей
    getTopUnprocessed: builder.query<TopUnprocessedResponse, {
      type?: 'brands' | 'countries' | 'models';
      limit?: number;
    }>({
      query: (params) => ({
        url: 'normalization/top_unprocessed',
        params: {
          type: params.type || 'brands',
          limit: params.limit || 10,
        },
      }),
      providesTags: ['TopUnprocessed'],
    }),

    // Запуск нормализации
    runNormalization: builder.mutation<NormalizationRunResult, {
      supplier_id?: number;
      product_ids?: number[];
      batch_size?: number;
    }>({
      query: (params) => ({
        url: 'normalization/run_normalization',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['NormalizationStats', 'UnprocessedProducts', 'TopUnprocessed'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetNormalizationStatsQuery,
  useGetUnprocessedProductsQuery,
  useGetTopUnprocessedQuery,
  useRunNormalizationMutation,
} = normalizationApi;