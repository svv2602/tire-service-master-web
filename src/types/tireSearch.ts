// Типы для системы поиска шин
export interface TireSearchQuery {
  query: string;
  brand?: string;
  model?: string;
  year?: number;
  diameter?: number;
  width?: number;
  height?: number;
  limit?: number;
  offset?: number;
  use_llm?: boolean;
  locale?: string;
  context?: Record<string, any>;
}

export interface TireSearchResult {
  id: number;
  brand_id: number;
  model_id: number;
  brand_name: string;
  model_name: string;
  full_name: string;
  year_from: number;
  year_to: number;
  years_display: string;
  tire_sizes: TireSize[];
  search_aliases: string[];
  search_tokens: string;
  data_version: string;
  last_updated: string;
  match_score?: number;
  relevance_score?: number;
}

export interface TireSize {
  width: number;
  height: number;
  diameter: number;
  type: 'stock' | 'optional';
  axle?: 'front' | 'rear' | 'all';
  display: string; // "225/50R17"
}

export interface TireSearchResponse {
  results: TireSearchResult[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  query_info: {
    original_query: string;
    parsed_data: ParsedSearchData;
    search_time_ms: number;
    used_llm: boolean;
  };
  suggestions?: string[];
  // Новые поля для мини-чата
  conversation_mode?: boolean;
  follow_up_questions?: FollowUpQuestion[];
  message?: string;
  success?: boolean;
  context?: Record<string, any>;
}

export interface ParsedSearchData {
  brand?: string;
  model?: string;
  year?: number;
  diameter?: number;
  width?: number;
  height?: number;
  confidence_score?: number;
  parsing_method: 'simple' | 'llm' | 'hybrid';
}

export interface TireSuggestion {
  text: string;
  type: 'brand' | 'model' | 'query' | 'popular';
  count?: number;
  brand?: string;
  model?: string;
}

// Интерфейсы для мини-чата
export interface FollowUpQuestion {
  type: 'brand_selection' | 'model_selection' | 'seasonality_selection' | 'size_selection';
  question: string;
  field: string;
  context?: Record<string, any>;
  options?: Array<{
    value: string;
    label: string;
  }>;
}

export interface ConversationState {
  isActive: boolean;
  currentStep: number;
  collectedData: Partial<TireSearchQuery>;
  questions: FollowUpQuestion[];
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  questions?: FollowUpQuestion[];
}

export interface TireSearchStatistics {
  total_configurations: number;
  total_brands: number;
  total_models: number;
  popular_diameters: Array<{
    diameter: number;
    count: number;
  }>;
  popular_brands: Array<{
    brand: string;
    count: number;
  }>;
  search_volume: {
    today: number;
    week: number;
    month: number;
  };
  top_queries: Array<{
    query: string;
    count: number;
    last_searched: string;
  }>;
}

export interface TireSearchFilters {
  diameter?: number[];
  type?: ('stock' | 'optional')[];
  brand?: string[];
  year_from?: number;
  year_to?: number;
  sort_by?: 'relevance' | 'brand' | 'model' | 'year';
  sort_order?: 'asc' | 'desc';
  context?: Record<string, any>;
}

export interface TireSearchState {
  query: string;
  filters: TireSearchFilters;
  results: TireSearchResult[];
  total: number;
  loading: boolean;
  error: string | null;
  suggestions: TireSuggestion[];
  history: string[];
  favorites: number[];
  page: number;
  has_more: boolean;
}

// Вспомогательные типы для UI компонентов
export interface TireSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  suggestions?: TireSuggestion[];
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: TireSuggestion) => void;
  className?: string;
}

export interface TireSearchFiltersProps {
  filters: TireSearchFilters;
  onChange: (filters: TireSearchFilters) => void;
  availableDiameters?: number[];
  availableBrands?: string[];
  onReset?: () => void;
  className?: string;
}

export interface TireSearchResultsProps {
  results: TireSearchResult[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onResultClick?: (result: TireSearchResult) => void;
  onFavoriteToggle?: (resultId: number) => void;
  onSearchExample?: (query: string) => void;
  favorites?: number[];
  className?: string;
}

export interface TireConfigurationCardProps {
  configuration: TireSearchResult;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  showYear?: boolean;
  showTireSizes?: boolean;
  compact?: boolean;
  className?: string;
}

export interface TireSizeChipProps {
  tireSize: TireSize;
  variant?: 'default' | 'compact' | 'detailed';
  showType?: boolean;
  onClick?: () => void;
  className?: string;
}

// Константы для поиска
export const TIRE_SEARCH_CONSTANTS = {
  DEBOUNCE_DELAY: 300, // мс
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут
  SUGGESTION_LIMIT: 10,
  HISTORY_LIMIT: 20,
  POPULAR_DIAMETERS: [15, 16, 17, 18, 19, 20, 21, 22],
  TIRE_TYPES: {
    stock: 'Штатные',
    optional: 'Опциональные'
  },
  SORT_OPTIONS: {
    relevance: 'По релевантности',
    brand: 'По бренду',
    model: 'По модели',
    year: 'По году'
  }
} as const;

// Утилитарные типы
export type TireSearchAction = 
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: TireSearchFilters }
  | { type: 'SET_RESULTS'; payload: { results: TireSearchResult[]; total: number; has_more: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUGGESTIONS'; payload: TireSuggestion[] }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_SEARCH' };

// Валидаторы
export const validateTireSearchQuery = (query: string): boolean => {
  return query.length >= TIRE_SEARCH_CONSTANTS.MIN_QUERY_LENGTH && 
         query.length <= TIRE_SEARCH_CONSTANTS.MAX_QUERY_LENGTH;
};

export const validateTireSize = (tireSize: Partial<TireSize>): tireSize is TireSize => {
  return !!(
    tireSize.width && 
    tireSize.height && 
    tireSize.diameter &&
    tireSize.type &&
    tireSize.width > 0 &&
    tireSize.height > 0 &&
    tireSize.diameter > 0
  );
};

// Утилиты для форматирования
export const formatTireSize = (tireSize: TireSize): string => {
  return `${tireSize.width}/${tireSize.height}R${tireSize.diameter}`;
};

export const formatYearRange = (yearFrom: number, yearTo: number): string => {
  if (yearFrom === yearTo) {
    return yearFrom.toString();
  }
  return `${yearFrom}-${yearTo}`;
};

export const formatTireType = (type: TireSize['type']): string => {
  return TIRE_SEARCH_CONSTANTS.TIRE_TYPES[type];
};

export const getTireTypeColor = (type: TireSize['type']): string => {
  return type === 'stock' ? 'primary' : 'default';
};

// Типы для ошибок
export interface TireSearchError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export const TIRE_SEARCH_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_QUERY: 'INVALID_QUERY',
  NO_RESULTS: 'NO_RESULTS',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT'
} as const;