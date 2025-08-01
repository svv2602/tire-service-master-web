import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Fade,
  Popper,
  ClickAwayListener,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { getThemeColors } from '../../../styles';
import { useDebounce } from 'use-debounce';

// Типы данных
export interface SuggestionItem {
  id: string;
  text: string;
  type: 'brand' | 'model' | 'size' | 'query' | 'history' | 'popular';
  category?: string;
  searchCount?: number;
  resultsCount?: number;
  highlight?: string;
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  maxSuggestions?: number;
  showCategories?: boolean;
  includeHistory?: boolean;
  includePopular?: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSuggestionSelect,
  anchorEl,
  open,
  onClose,
  maxSuggestions = 10,
  showCategories = true,
  includeHistory = true,
  includePopular = true
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // Состояние компонента
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Дебаунс для запроса
  const [debouncedQuery] = useDebounce(query, 300);

  // API базовый URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  // Статические предложения (fallback)
  const staticSuggestions: SuggestionItem[] = [
    // Бренды
    { id: 'brand-1', text: 'BMW', type: 'brand', category: 'Премиум бренды', searchCount: 1250 },
    { id: 'brand-2', text: 'Mercedes-Benz', type: 'brand', category: 'Премиум бренды', searchCount: 980 },
    { id: 'brand-3', text: 'Audi', type: 'brand', category: 'Премиум бренды', searchCount: 875 },
    { id: 'brand-4', text: 'Toyota', type: 'brand', category: 'Массовые бренды', searchCount: 1450 },
    { id: 'brand-5', text: 'Volkswagen', type: 'brand', category: 'Массовые бренды', searchCount: 1320 },
    
    // Модели
    { id: 'model-1', text: 'BMW 3 Series', type: 'model', category: 'Популярные модели', searchCount: 890 },
    { id: 'model-2', text: 'Volkswagen Tiguan', type: 'model', category: 'Популярные модели', searchCount: 1100 },
    { id: 'model-3', text: 'Toyota Camry', type: 'model', category: 'Популярные модели', searchCount: 750 },
    { id: 'model-4', text: 'Mercedes C-Class', type: 'model', category: 'Популярные модели', searchCount: 620 },
    { id: 'model-5', text: 'Audi Q5', type: 'model', category: 'Популярные модели', searchCount: 580 },
    
    // Размеры
    { id: 'size-1', text: '225/50R17', type: 'size', category: 'Популярные размеры', searchCount: 2100 },
    { id: 'size-2', text: '245/45R18', type: 'size', category: 'Популярные размеры', searchCount: 1800 },
    { id: 'size-3', text: '255/40R19', type: 'size', category: 'Популярные размеры', searchCount: 1500 },
    { id: 'size-4', text: 'R17', type: 'size', category: 'Диаметры', searchCount: 3200 },
    { id: 'size-5', text: 'R18', type: 'size', category: 'Диаметры', searchCount: 2800 },
    
    // Общие запросы
    { id: 'query-1', text: 'зимняя резина', type: 'query', category: 'Сезонные', searchCount: 1900 },
    { id: 'query-2', text: 'летние шины', type: 'query', category: 'Сезонные', searchCount: 2200 },
    { id: 'query-3', text: 'всесезонная резина', type: 'query', category: 'Сезонные', searchCount: 1400 },
    { id: 'query-4', text: 'низкопрофильная резина', type: 'query', category: 'Специальные', searchCount: 800 },
    { id: 'query-5', text: 'шины для кроссовера', type: 'query', category: 'По типу авто', searchCount: 1600 }
  ];

  // Загрузка предложений с API
  const loadSuggestions = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      // Пытаемся загрузить с API
      const response = await fetch(`${API_BASE_URL}/tire_search/suggestions?query=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        const apiSuggestions = data.suggestions?.map((item: any, index: number) => ({
          id: `api-${index}`,
          text: item.text,
          type: item.type || 'query',
          category: item.category,
          searchCount: item.search_count,
          resultsCount: item.results_count,
          highlight: item.highlight
        })) || [];
        
        if (apiSuggestions.length > 0) {
          setSuggestions(apiSuggestions.slice(0, maxSuggestions));
        } else {
          // Фильтруем статические предложения
          const filtered = filterStaticSuggestions(searchQuery);
          setSuggestions(filtered);
        }
      } else {
        // Используем статические предложения
        const filtered = filterStaticSuggestions(searchQuery);
        setSuggestions(filtered);
      }
    } catch (error) {
      console.warn('API предложений недоступен, используем статические данные:', error);
      const filtered = filterStaticSuggestions(searchQuery);
      setSuggestions(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация статических предложений
  const filterStaticSuggestions = (searchQuery: string): SuggestionItem[] => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = staticSuggestions.filter(item => 
      item.text.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
    );

    // Добавляем историю поиска если включена
    if (includeHistory) {
      const history = getSearchHistory(query);
      filtered = [...history, ...filtered];
    }

    // Добавляем популярные запросы если включены
    if (includePopular && query.length >= 3) {
      const popular = getPopularSuggestions(query);
      filtered = [...filtered, ...popular];
    }

    // Сортируем по релевантности
    filtered.sort((a, b) => {
      // Точные совпадения в начале
      const aExact = a.text.toLowerCase() === query;
      const bExact = b.text.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Совпадения в начале строки
      const aStartsWith = a.text.toLowerCase().startsWith(query);
      const bStartsWith = b.text.toLowerCase().startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // По популярности
      return (b.searchCount || 0) - (a.searchCount || 0);
    });

    return filtered.slice(0, maxSuggestions);
  };

  // Получение истории поиска
  const getSearchHistory = (query: string): SuggestionItem[] => {
    try {
      const history = JSON.parse(localStorage.getItem('tire_search_history') || '[]');
      return history
        .filter((item: any) => item.query.toLowerCase().includes(query))
        .slice(0, 3)
        .map((item: any, index: number) => ({
          id: `history-${index}`,
          text: item.query,
          type: 'history' as const,
          category: 'История поиска',
          searchCount: item.clickCount || 1
        }));
    } catch {
      return [];
    }
  };

  // Получение популярных предложений
  const getPopularSuggestions = (query: string): SuggestionItem[] => {
    const popularQueries = [
      'шины на BMW', 'резина для Mercedes', 'Toyota Camry шины',
      'зимняя резина R17', 'летние шины R18', 'Volkswagen Tiguan'
    ];

    return popularQueries
      .filter(item => item.toLowerCase().includes(query))
      .slice(0, 2)
      .map((item, index) => ({
        id: `popular-${index}`,
        text: item,
        type: 'popular' as const,
        category: 'Популярные запросы',
        searchCount: Math.floor(Math.random() * 1000) + 500
      }));
  };

  // Загрузка предложений при изменении запроса
  useEffect(() => {
    if (open && debouncedQuery) {
      loadSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery, open]);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open || suggestions.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0) {
            onSuggestionSelect(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, suggestions, selectedIndex, onSuggestionSelect, onClose]);

  // Получение иконки для типа предложения
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return <StarIcon fontSize="small" color="primary" />;
      case 'model':
        return <CarIcon fontSize="small" color="secondary" />;
      case 'size':
        return <SettingsIcon fontSize="small" color="info" />;
      case 'history':
        return <HistoryIcon fontSize="small" color="action" />;
      case 'popular':
        return <TrendingIcon fontSize="small" color="warning" />;
      default:
        return <SearchIcon fontSize="small" color="action" />;
    }
  };

  // Подсветка совпадений в тексте
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Box 
          component="span" 
          key={index}
          sx={{ 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            px: 0.5,
            borderRadius: 0.5,
            fontWeight: 'bold'
          }}
        >
          {part}
        </Box>
      ) : part
    );
  };

  // Группировка предложений по категориям
  const groupedSuggestions = useMemo(() => {
    if (!showCategories) {
      return { 'Все предложения': suggestions };
    }

    const groups: Record<string, SuggestionItem[]> = {};
    
    suggestions.forEach(suggestion => {
      const category = suggestion.category || 'Другое';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
    });

    return groups;
  }, [suggestions, showCategories]);

  if (!open || (!loading && suggestions.length === 0)) {
    return null;
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: 1300, width: anchorEl?.offsetWidth }}
      transition
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              mt: 0.5
            }}
          >
            <ClickAwayListener onClickAway={onClose}>
              <Box>
                {loading ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Поиск предложений...
                    </Typography>
                  </Box>
                ) : (
                  <List dense sx={{ py: 0 }}>
                    {Object.entries(groupedSuggestions).map(([category, items], categoryIndex) => (
                      <Box key={category}>
                        {showCategories && Object.keys(groupedSuggestions).length > 1 && (
                          <>
                            {categoryIndex > 0 && <Divider />}
                            <ListItem sx={{ py: 0.5, bgcolor: colors.backgroundSecondary }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                {category}
                              </Typography>
                            </ListItem>
                          </>
                        )}
                        {items.map((suggestion, index) => {
                          const globalIndex = suggestions.findIndex(s => s.id === suggestion.id);
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <ListItem key={suggestion.id} disablePadding>
                              <ListItemButton
                                selected={isSelected}
                                onClick={() => onSuggestionSelect(suggestion.text)}
                                sx={{
                                  py: 1,
                                  '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                    }
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {getTypeIcon(suggestion.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2">
                                        {highlightMatch(suggestion.text, query)}
                                      </Typography>
                                      {suggestion.searchCount && (
                                        <Chip
                                          label={suggestion.searchCount > 1000 
                                            ? `${(suggestion.searchCount / 1000).toFixed(1)}k`
                                            : suggestion.searchCount
                                          }
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.7rem', height: 20 }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  secondary={suggestion.resultsCount && (
                                    <Typography variant="caption" color="text.secondary">
                                      {suggestion.resultsCount} результатов
                                    </Typography>
                                  )}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </Box>
                    ))}
                  </List>
                )}
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default SearchSuggestions;