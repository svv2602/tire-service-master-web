import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import {
  useSearchTiresMutation,
  useGetTireSuggestionsQuery,
  useLazyGetTireSuggestionsQuery,
  useGetTireDiametersQuery,
  useGetTireBrandsQuery,
  useSaveSearchQueryMutation
} from '../api/tireSearch.api';
import type {
  TireSearchQuery,
  TireSearchResult,
  TireSearchFilters,
  TireSearchState,
  TireSuggestion,
  TIRE_SEARCH_CONSTANTS
} from '../types/tireSearch';

// Типы для хука
interface UseTireSearchOptions {
  debounceDelay?: number;
  autoSearch?: boolean;
  saveHistory?: boolean;
  maxHistoryItems?: number;
  enableSuggestions?: boolean;
}

interface UseTireSearchReturn {
  // Состояние поиска
  searchState: TireSearchState;
  
  // Функции поиска
  search: (query: string, filters?: TireSearchFilters) => Promise<any>;
  searchWithFilters: (filters: TireSearchFilters) => Promise<void>;
  clearSearch: () => void;
  
  // Управление запросом
  setQuery: (query: string) => void;
  setFilters: (filters: TireSearchFilters) => void;
  
  // Предложения
  suggestions: TireSuggestion[];
  getSuggestions: (query: string) => void;
  clearSuggestions: () => void;
  
  // История и избранное
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  toggleFavorite: (resultId: number) => void;
  
  // Пагинация
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  
  // Утилиты
  isLoading: boolean;
  hasError: boolean;
  hasResults: boolean;
  canLoadMore: boolean;
  
  // Справочные данные
  availableDiameters: number[];
  availableBrands: Array<{ name: string; count: number }>;
}

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'tire_search_history',
  FAVORITES: 'tire_search_favorites',
  RECENT_FILTERS: 'tire_search_recent_filters'
} as const;

export const useTireSearch = (options: UseTireSearchOptions = {}): UseTireSearchReturn => {
  const {
    debounceDelay = 300,
    autoSearch = false,
    saveHistory = true,
    maxHistoryItems = 20,
    enableSuggestions = true
  } = options;

  // Состояние поиска
  const [searchState, setSearchState] = useState<TireSearchState>({
    query: '',
    filters: {},
    results: [],
    total: 0,
    loading: false,
    error: null,
    suggestions: [],
    history: [],
    favorites: [],
    page: 1,
    has_more: false
  });

  // Дебаунс для запроса
  const [debouncedQuery] = useDebounce(searchState.query, debounceDelay);

  // API хуки
  const [searchTires, { isLoading: isSearching }] = useSearchTiresMutation();
  const [getSuggestionsLazy] = useLazyGetTireSuggestionsQuery();
  const [saveSearchQuery] = useSaveSearchQueryMutation();
  
  // Справочные данные
  const { data: availableDiameters = [] } = useGetTireDiametersQuery();
  const { data: availableBrands = [] } = useGetTireBrandsQuery();

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]');
        const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
        
        setSearchState(prev => ({
          ...prev,
          history: history.slice(0, maxHistoryItems),
          favorites
        }));
      } catch (error) {
        console.warn('Ошибка загрузки данных из localStorage:', error);
      }
    };

    loadStoredData();
  }, [maxHistoryItems]);

  // Автоматический поиск при изменении дебаунсированного запроса
  useEffect(() => {
    if (autoSearch && debouncedQuery.trim() && debouncedQuery.length >= 2) {
      handleSearch(debouncedQuery, searchState.filters);
    }
  }, [debouncedQuery, autoSearch]);

  // Получение предложений при вводе
  useEffect(() => {
    if (enableSuggestions && debouncedQuery.trim() && debouncedQuery.length >= 2) {
      getSuggestionsLazy(debouncedQuery)
        .unwrap()
        .then(suggestions => {
          setSearchState(prev => ({ ...prev, suggestions }));
        })
        .catch(() => {
          setSearchState(prev => ({ ...prev, suggestions: [] }));
        });
    } else {
      setSearchState(prev => ({ ...prev, suggestions: [] }));
    }
  }, [debouncedQuery, enableSuggestions, getSuggestionsLazy]);

  // Основная функция поиска
  const handleSearch = useCallback(async (query: string, filters: TireSearchFilters = {}) => {
    if (!query.trim()) {
      setSearchState(prev => ({ 
        ...prev, 
        results: [], 
        total: 0, 
        error: null,
        has_more: false
      }));
      return null;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Преобразуем фильтры для API (берем первые значения из массивов)
      const searchQuery: TireSearchQuery = {
        query: query.trim(),
        limit: 20,
        offset: 0,
        use_llm: true,
        brand: filters.brand?.[0],
        diameter: filters.diameter?.[0],
        year: filters.year_from
      };

      const response = await searchTires(searchQuery).unwrap();

      setSearchState(prev => ({
        ...prev,
        results: response.results,
        total: response.total,
        page: 1,
        has_more: response.has_more,
        loading: false,
        error: null
      }));

      // Сохраняем запрос в историю
      if (saveHistory && query.trim()) {
        addToHistory(query.trim());
      }

      // Сохраняем статистику поиска
      if (response.results.length > 0) {
        saveSearchQuery({ query: query.trim(), results_count: response.results.length });
      }

      // Возвращаем response для обработки conversation_mode
      return response;

    } catch (error: any) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.data || 'Ошибка при поиске шин',
        results: [],
        total: 0,
        has_more: false
      }));
      return null;
    }
  }, [searchTires, saveHistory, saveSearchQuery]);

  // Поиск с фильтрами
  const searchWithFilters = useCallback(async (filters: TireSearchFilters) => {
    setSearchState(prev => ({ ...prev, filters }));
    if (searchState.query.trim()) {
      await handleSearch(searchState.query, filters);
    }
  }, [searchState.query, handleSearch]);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (!searchState.has_more || searchState.loading) return;

    setSearchState(prev => ({ ...prev, loading: true }));

    try {
      // Преобразуем фильтры для API (берем первые значения из массивов)
      const searchQuery: TireSearchQuery = {
        query: searchState.query,
        limit: 20,
        offset: searchState.results.length,
        use_llm: true,
        brand: searchState.filters.brand?.[0],
        diameter: searchState.filters.diameter?.[0],
        year: searchState.filters.year_from
      };

      const response = await searchTires(searchQuery).unwrap();

      setSearchState(prev => ({
        ...prev,
        results: [...prev.results, ...response.results],
        page: prev.page + 1,
        has_more: response.has_more,
        loading: false
      }));

    } catch (error: any) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.data || 'Ошибка при загрузке данных'
      }));
    }
  }, [searchState, searchTires]);

  // Переход на страницу
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || searchState.loading) return;

    setSearchState(prev => ({ ...prev, loading: true }));

    try {
      // Преобразуем фильтры для API (берем первые значения из массивов)
      const searchQuery: TireSearchQuery = {
        query: searchState.query,
        limit: 20,
        offset: (page - 1) * 20,
        use_llm: true,
        brand: searchState.filters.brand?.[0],
        diameter: searchState.filters.diameter?.[0],
        year: searchState.filters.year_from
      };

      const response = await searchTires(searchQuery).unwrap();

      setSearchState(prev => ({
        ...prev,
        results: response.results,
        page,
        has_more: response.has_more,
        loading: false
      }));

    } catch (error: any) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.data || 'Ошибка при загрузке страницы'
      }));
    }
  }, [searchState.query, searchState.filters, searchTires]);

  // Управление запросом
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const setFilters = useCallback((filters: TireSearchFilters) => {
    setSearchState(prev => ({ ...prev, filters }));
    
    // Сохраняем фильтры в localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_FILTERS, JSON.stringify(filters));
    } catch (error) {
      console.warn('Ошибка сохранения фильтров:', error);
    }
  }, []);

  // Очистка поиска
  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      total: 0,
      error: null,
      suggestions: [],
      page: 1,
      has_more: false
    }));
  }, []);

  // Управление предложениями
  const getSuggestions = useCallback((query: string) => {
    if (query.trim().length >= 2) {
      getSuggestionsLazy(query);
    }
  }, [getSuggestionsLazy]);

  const clearSuggestions = useCallback(() => {
    setSearchState(prev => ({ ...prev, suggestions: [] }));
  }, []);

  // Управление историей
  const addToHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchState(prev => {
      const newHistory = [
        trimmedQuery,
        ...prev.history.filter(item => item !== trimmedQuery)
      ].slice(0, maxHistoryItems);

      // Сохраняем в localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Ошибка сохранения истории:', error);
      }

      return { ...prev, history: newHistory };
    });
  }, [maxHistoryItems]);

  const clearHistory = useCallback(() => {
    setSearchState(prev => ({ ...prev, history: [] }));
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.warn('Ошибка очистки истории:', error);
    }
  }, []);

  // Управление избранным
  const toggleFavorite = useCallback((resultId: number) => {
    setSearchState(prev => {
      const newFavorites = prev.favorites.includes(resultId)
        ? prev.favorites.filter(id => id !== resultId)
        : [...prev.favorites, resultId];

      // Сохраняем в localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
      } catch (error) {
        console.warn('Ошибка сохранения избранного:', error);
      }

      return { ...prev, favorites: newFavorites };
    });
  }, []);

  // Вычисляемые значения
  const computedValues = useMemo(() => ({
    isLoading: searchState.loading || isSearching,
    hasError: !!searchState.error,
    hasResults: searchState.results.length > 0,
    canLoadMore: searchState.has_more && !searchState.loading,
  }), [searchState.loading, isSearching, searchState.error, searchState.results.length, searchState.has_more]);

  return {
    searchState,
    search: handleSearch,
    searchWithFilters,
    clearSearch,
    setQuery,
    setFilters,
    suggestions: searchState.suggestions,
    getSuggestions,
    clearSuggestions,
    addToHistory,
    clearHistory,
    toggleFavorite,
    loadMore,
    goToPage,
    ...computedValues,
    availableDiameters,
    availableBrands,
  };
};

// Хук для работы с избранными конфигурациями
export const useTireFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
      setFavorites(stored);
    } catch (error) {
      console.warn('Ошибка загрузки избранного:', error);
    }
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(fId => fId !== id)
        : [...prev, id];

      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
      } catch (error) {
        console.warn('Ошибка сохранения избранного:', error);
      }

      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    count: favorites.length
  };
};

// Хук для работы с историей поиска
export const useTireSearchHistory = (maxItems: number = 20) => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]');
      setHistory(stored.slice(0, maxItems));
    } catch (error) {
      console.warn('Ошибка загрузки истории:', error);
    }
  }, [maxItems]);

  const addToHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setHistory(prev => {
      const newHistory = [
        trimmedQuery,
        ...prev.filter(item => item !== trimmedQuery)
      ].slice(0, maxItems);

      try {
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Ошибка сохранения истории:', error);
      }

      return newHistory;
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      
      try {
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Ошибка обновления истории:', error);
      }

      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.warn('Ошибка очистки истории:', error);
    }
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    count: history.length
  };
};