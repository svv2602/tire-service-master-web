import { baseApi } from './baseApi';
import type {
  TireSearchQuery,
  TireSearchResponse,
  TireSearchResult,
  TireSuggestion,
  TireSearchStatistics,
  ParsedSearchData,
  FollowUpQuestion,
  ConversationState
} from '../types/tireSearch';

// Расширяем базовый API для поиска шин
export const tireSearchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Основной поиск шин
    searchTires: builder.mutation<TireSearchResponse, TireSearchQuery>({
      query: (searchQuery) => ({
        url: 'tire_search',
        method: 'POST',
        body: searchQuery,
      }),
      transformResponse: (response: any): TireSearchResponse => {
        // Новый формат ответа от бэкенда (Stage 1)
        if (response.tire_sizes !== undefined) {
          return {
            results: response.tire_sizes?.map((size: any, index: number) => ({
              id: index,
              brand_id: 0,
              model_id: 0,
              brand_name: response.car_info?.brand || '',
              model_name: response.car_info?.model || '',
              full_name: `${response.car_info?.brand || ''} ${response.car_info?.model || ''}`.trim(),
              year_from: response.car_info?.year || 0,
              year_to: response.car_info?.year || 0,
              years_display: response.car_info?.year?.toString() || '',
              tire_sizes: [{
                width: size.width,
                height: size.height,
                diameter: size.diameter,
                type: size.type || 'stock',
                display: `${size.width}/${size.height}R${size.diameter}`
              }],
              search_aliases: [],
              search_tokens: '',
              data_version: '1.0',
              last_updated: new Date().toISOString()
            })) || [],
            total: response.tire_sizes?.length || 0,
            page: 1,
            per_page: 20,
            has_more: false,
            query_info: {
              original_query: response.query || '',
              parsed_data: response.parsed_data || {},
              search_time_ms: 0,
              used_llm: false
            },
            suggestions: response.suggestions || [],
            // Новые поля для мини-чата
            conversation_mode: response.conversation_mode || false,
            follow_up_questions: response.follow_up_questions || [],
            message: response.message || '',
            success: response.success !== false
          };
        }

        // Старый формат ответа (для совместимости)
        return {
          results: response.results?.map((result: any) => ({
            ...result,
            // Преобразуем названия полей для соответствия интерфейсу
            brand_name: result.brand || '',
            model_name: result.model || '',
            // Используем готовые данные от бэкенда
            years_display: result.year_range || '',
            // Преобразуем строки размеров в объекты TireSize
            tire_sizes: (result.tire_sizes || []).map((sizeStr: string) => {
              const match = sizeStr.match(/^(\d+)\/(\d+)R(\d+)$/);
              if (match) {
                const [, width, height, diameter] = match;
                return {
                  width: parseInt(width),
                  height: parseInt(height),
                  diameter: parseInt(diameter),
                  type: result.stock_sizes?.includes(sizeStr) ? 'stock' : 'optional',
                  display: sizeStr
                };
              }
              // Fallback для некорректных размеров
              return {
                width: 0,
                height: 0,
                diameter: 0,
                type: 'optional',
                display: sizeStr
              };
            })
          })) || [],
          total: response.total || 0,
          page: response.pagination?.offset ? Math.floor(response.pagination.offset / (response.pagination.limit || 20)) + 1 : 1,
          per_page: response.pagination?.limit || 20,
          has_more: response.pagination?.has_more || false,
          query_info: {
            original_query: response.query || '',
            parsed_data: response.parsed_data || {},
            search_time_ms: 0,
            used_llm: false
          },
          suggestions: response.suggestions || [],
          // Новые поля для мини-чата
          conversation_mode: response.conversation_mode || false,
          follow_up_questions: response.follow_up_questions || [],
          message: response.message || '',
          success: response.success !== false
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
        url: 'tire_search/suggestions',
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
      query: () => 'tire_search/popular',
      transformResponse: (response: any): string[] => {
        return response.popular_queries || [];
      },
      // Кешируем популярные запросы на 30 минут
      keepUnusedDataFor: 30 * 60,
    }),

    // Получение списка брендов
    getTireBrands: builder.query<Array<{ name: string; count: number }>, void>({
      query: () => 'tire_search/brands',
      transformResponse: (response: any) => {
        return response.brands || [];
      },
      // Кешируем бренды на 1 час
      keepUnusedDataFor: 60 * 60,
    }),

    // Получение моделей для бренда
    getTireModels: builder.query<Array<{ name: string; count: number }>, string>({
      query: (brand) => ({
        url: 'tire_search/models',
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
      query: () => 'tire_search/diameters',
      transformResponse: (response: any): number[] => {
        return response.diameters || [];
      },
      // Кешируем диаметры на 1 час  
      keepUnusedDataFor: 60 * 60,
    }),

    // Статистика поиска (только для админов)
    getTireSearchStatistics: builder.query<TireSearchStatistics, void>({
      query: () => 'tire_search/statistics',
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
      query: (id) => `tire_search/configurations/${id}`,
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
        url: 'tire_search/history',
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
  getCachedSearchResults: (state: any, queryString: string) => {
    // Для мутаций кеширование работает по-другому
    // Возвращаем undefined, так как мутации не кешируют результаты как queries
    return undefined;
  }
};

// Селекторы для получения данных из стора
export const selectTireSearchResults = (state: any, queryString: string) => {
  // Для мутаций селекторы работают по-другому
  return undefined;
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
    SEARCH: 'tire_search',
    SUGGESTIONS: 'tire_search/suggestions',
    POPULAR: 'tire_search/popular',
    BRANDS: 'tire_search/brands',
    MODELS: 'tire_search/models',
    DIAMETERS: 'tire_search/diameters',
    STATISTICS: 'tire_search/statistics',
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