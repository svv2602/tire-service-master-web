import { baseApi } from './baseApi';
import type {
  TireSearchQuery,
  TireSearchResponse,
  TireSearchResult,
  TireSuggestion,
  TireSearchStatistics,
  ParsedSearchData
} from '../types/tireSearch';

// Расширяем базовый API для поиска шин
export const tireSearchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Основной поиск шин
    searchTires: builder.mutation<TireSearchResponse, TireSearchQuery>({
      query: (searchQuery) => ({
        url: 'api/v1/tire_search',
        method: 'POST',
        body: searchQuery,
      }),
      transformResponse: (response: any): TireSearchResponse => {
        return {
          results: response.results.map((result: any) => ({
            ...result,
            full_name: `${result.brand_name} ${result.model_name}`,
            years_display: result.year_from === result.year_to 
              ? result.year_from.toString()
              : `${result.year_from}-${result.year_to}`,
            tire_sizes: result.tire_sizes.map((size: any) => ({
              ...size,
              display: `${size.width}/${size.height}R${size.diameter}`
            }))
          })),
          total: response.total || 0,
          page: response.page || 1,
          per_page: response.per_page || 20,
          has_more: response.has_more || false,
          query_info: {
            original_query: response.query_info?.original_query || '',
            parsed_data: response.query_info?.parsed_data || {},
            search_time_ms: response.query_info?.search_time_ms || 0,
            used_llm: response.query_info?.used_llm || false
          },
          suggestions: response.suggestions || []
        };
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          data: response.data?.error || 'Ошибка при поиске шин'
        };
      },
    }),

    // Получение предложений для автодополнения
    getTireSuggestions: builder.query<TireSuggestion[], string>({
      query: (query) => ({
        url: 'api/v1/tire_search/suggestions',
        params: { q: query, limit: 10 }
      }),
      transformResponse: (response: any): TireSuggestion[] => {
        return response.suggestions || [];
      },
      // Кешируем предложения на 5 минут
      keepUnusedDataFor: 5 * 60,
    }),

    // Популярные запросы
    getPopularQueries: builder.query<string[], void>({
      query: () => 'api/v1/tire_search/popular',
      transformResponse: (response: any): string[] => {
        return response.popular_queries || [];
      },
      // Кешируем популярные запросы на 30 минут
      keepUnusedDataFor: 30 * 60,
    }),

    // Получение списка брендов
    getTireBrands: builder.query<Array<{ name: string; count: number }>, void>({
      query: () => 'api/v1/tire_search/brands',
      transformResponse: (response: any) => {
        return response.brands || [];
      },
      // Кешируем бренды на 1 час
      keepUnusedDataFor: 60 * 60,
    }),

    // Получение моделей для бренда
    getTireModels: builder.query<Array<{ name: string; count: number }>, string>({
      query: (brand) => ({
        url: 'api/v1/tire_search/models',
        params: { brand }
      }),
      transformResponse: (response: any) => {
        return response.models || [];
      },
      // Кешируем модели на 1 час
      keepUnusedDataFor: 60 * 60,
    }),

    // Получение доступных диаметров
    getTireDiameters: builder.query<number[], void>({
      query: () => 'api/v1/tire_search/diameters',
      transformResponse: (response: any): number[] => {
        return response.diameters || [];
      },
      // Кешируем диаметры на 1 час  
      keepUnusedDataFor: 60 * 60,
    }),

    // Статистика поиска (только для админов)
    getTireSearchStatistics: builder.query<TireSearchStatistics, void>({
      query: () => 'api/v1/tire_search/statistics',
      transformResponse: (response: any): TireSearchStatistics => {
        return {
          total_configurations: response.total_configurations || 0,
          total_brands: response.total_brands || 0,
          total_models: response.total_models || 0,
          popular_diameters: response.popular_diameters || [],
          popular_brands: response.popular_brands || [],
          search_volume: response.search_volume || { today: 0, week: 0, month: 0 },
          top_queries: response.top_queries || []
        };
      },
      // Кешируем статистику на 15 минут
      keepUnusedDataFor: 15 * 60,
    }),

    // Получение конфигурации по ID
    getTireConfigurationById: builder.query<TireSearchResult, number>({
      query: (id) => `api/v1/tire_search/configurations/${id}`,
      transformResponse: (response: any): TireSearchResult => {
        return {
          ...response,
          full_name: `${response.brand_name} ${response.model_name}`,
          years_display: response.year_from === response.year_to 
            ? response.year_from.toString()
            : `${response.year_from}-${response.year_to}`,
          tire_sizes: response.tire_sizes.map((size: any) => ({
            ...size,
            display: `${size.width}/${size.height}R${size.diameter}`
          }))
        };
      },
    }),

    // Сохранение поискового запроса в историю
    saveSearchQuery: builder.mutation<void, { query: string; results_count: number }>({
      query: (data) => ({
        url: 'api/v1/tire_search/history',
        method: 'POST',
        body: data
      }),
    }),
  }),
  overrideExisting: false,
});

// Экспортируем хуки для использования в компонентах
export const {
  useSearchTiresMutation,
  useGetTireSuggestionsQuery,
  useLazyGetTireSuggestionsQuery,
  useGetPopularQueriesQuery,
  useGetTireBrandsQuery,
  useGetTireModelsQuery,
  useLazyGetTireModelsQuery,
  useGetTireDiametersQuery,
  useGetTireSearchStatisticsQuery,
  useGetTireConfigurationByIdQuery,
  useSaveSearchQueryMutation,
} = tireSearchApi;

// Утилиты для работы с кешем
export const tireSearchCacheUtils = {
  // Инвалидация кеша поиска
  invalidateSearchCache: () => {
    return tireSearchApi.util.invalidateTags(['TireSearch']);
  },

  // Предзагрузка популярных данных
  prefetchPopularData: (dispatch: any) => {
    dispatch(tireSearchApi.endpoints.getPopularQueries.initiate());
    dispatch(tireSearchApi.endpoints.getTireBrands.initiate());
    dispatch(tireSearchApi.endpoints.getTireDiameters.initiate());
  },

  // Очистка кеша поиска
  clearSearchCache: (dispatch: any) => {
    dispatch(tireSearchApi.util.resetApiState());
  },

  // Получение кешированных результатов поиска
  getCachedSearchResults: (state: any, query: TireSearchQuery) => {
    return tireSearchApi.endpoints.searchTires.select(query)(state);
  }
};

// Селекторы для получения данных из стора
export const selectTireSearchResults = (state: any, query: TireSearchQuery) => {
  return tireSearchApi.endpoints.searchTires.select(query)(state);
};

export const selectTireSuggestions = (state: any, query: string) => {
  return tireSearchApi.endpoints.getTireSuggestions.select(query)(state);
};

export const selectTireBrands = (state: any) => {
  return tireSearchApi.endpoints.getTireBrands.select()(state);
};

export const selectTireDiameters = (state: any) => {
  return tireSearchApi.endpoints.getTireDiameters.select()(state);
};

// Типы для использования с хуками
export type SearchTiresMutationResult = ReturnType<typeof useSearchTiresMutation>;
export type TireSuggestionsQueryResult = ReturnType<typeof useGetTireSuggestionsQuery>;
export type TireBrandsQueryResult = ReturnType<typeof useGetTireBrandsQuery>;
export type TireDiametersQueryResult = ReturnType<typeof useGetTireDiametersQuery>;

// Константы для API
export const TIRE_SEARCH_API_CONSTANTS = {
  ENDPOINTS: {
    SEARCH: 'api/v1/tire_search',
    SUGGESTIONS: 'api/v1/tire_search/suggestions',
    POPULAR: 'api/v1/tire_search/popular',
    BRANDS: 'api/v1/tire_search/brands',
    MODELS: 'api/v1/tire_search/models',
    DIAMETERS: 'api/v1/tire_search/diameters',
    STATISTICS: 'api/v1/tire_search/statistics',
  },
  CACHE_TAGS: {
    TIRE_SEARCH: 'TireSearch',
    TIRE_BRANDS: 'TireBrands',
    TIRE_MODELS: 'TireModels',
    TIRE_SUGGESTIONS: 'TireSuggestions',
  },
  CACHE_DURATION: {
    SEARCH_RESULTS: 5 * 60, // 5 минут
    SUGGESTIONS: 5 * 60, // 5 минут
    POPULAR_QUERIES: 30 * 60, // 30 минут
    BRANDS: 60 * 60, // 1 час
    MODELS: 60 * 60, // 1 час
    DIAMETERS: 60 * 60, // 1 час
    STATISTICS: 15 * 60, // 15 минут
  }
} as const;