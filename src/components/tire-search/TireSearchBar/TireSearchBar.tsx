import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Fade,
  ClickAwayListener,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { getThemeColors } from '../../../styles';
import type { 
  TireSearchBarProps, 
  TireSuggestion,
  TIRE_SEARCH_CONSTANTS 
} from '../../../types/tireSearch';

interface TireSearchBarState {
  focused: boolean;
  showSuggestions: boolean;
  selectedSuggestionIndex: number;
}

const TireSearchBar: React.FC<TireSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  loading = false,
  placeholder = "Поиск шин: BMW 3 Series 2020, Тигуан резина R18...",
  suggestions = [],
  showSuggestions = true,
  onSuggestionSelect,
  className
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const [state, setState] = useState<TireSearchBarState>({
    focused: false,
    showSuggestions: false,
    selectedSuggestionIndex: -1
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Примеры запросов для подсказок
  const exampleQueries = [
    "BMW 3 Series 2020",
    "Mercedes C-Class резина",
    "Тигуан шины R18",
    "Audi A4 2019 года",
    "Шины на БМВ 320i"
  ];

  // Обработка фокуса
  const handleFocus = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      focused: true, 
      showSuggestions: showSuggestions && (suggestions.length > 0 || value.length === 0)
    }));
  }, [showSuggestions, suggestions.length, value.length]);

  const handleBlur = useCallback(() => {
    // Небольшая задержка для обработки кликов по предложениям
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        focused: false, 
        showSuggestions: false,
        selectedSuggestionIndex: -1
      }));
    }, 150);
  }, []);

  // Обработка изменения значения
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    
    setState(prev => ({
      ...prev,
      showSuggestions: showSuggestions && (newValue.length > 0 || suggestions.length > 0),
      selectedSuggestionIndex: -1
    }));
  }, [onChange, showSuggestions, suggestions.length]);

  // Обработка очистки
  const handleClear = useCallback(() => {
    onChange('');
    setState(prev => ({
      ...prev,
      showSuggestions: showSuggestions,
      selectedSuggestionIndex: -1
    }));
    inputRef.current?.focus();
  }, [onChange, showSuggestions]);

  // Обработка поиска
  const handleSearch = useCallback(() => {
    if (value.trim()) {
      onSearch(value.trim());
      setState(prev => ({ ...prev, showSuggestions: false }));
    }
  }, [value, onSearch]);

  // Обработка выбора предложения
  const handleSuggestionClick = useCallback((suggestion: TireSuggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.text);
    setState(prev => ({ ...prev, showSuggestions: false }));
  }, [onChange, onSuggestionSelect, onSearch]);

  // Обработка клавиатуры
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!state.showSuggestions) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
      return;
    }

    const totalSuggestions = suggestions.length + (value.length === 0 ? exampleQueries.length : 0);

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (state.selectedSuggestionIndex >= 0 && state.selectedSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[state.selectedSuggestionIndex]);
        } else if (state.selectedSuggestionIndex >= suggestions.length && value.length === 0) {
          const exampleIndex = state.selectedSuggestionIndex - suggestions.length;
          const exampleQuery = exampleQueries[exampleIndex];
          if (exampleQuery) {
            onChange(exampleQuery);
            onSearch(exampleQuery);
            setState(prev => ({ ...prev, showSuggestions: false }));
          }
        } else {
          handleSearch();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedSuggestionIndex: Math.min(prev.selectedSuggestionIndex + 1, totalSuggestions - 1)
        }));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedSuggestionIndex: Math.max(prev.selectedSuggestionIndex - 1, -1)
        }));
        break;

      case 'Escape':
        setState(prev => ({ ...prev, showSuggestions: false, selectedSuggestionIndex: -1 }));
        break;
    }
  }, [
    state.showSuggestions, 
    state.selectedSuggestionIndex, 
    suggestions, 
    value, 
    handleSearch, 
    handleSuggestionClick, 
    onChange, 
    onSearch,
    exampleQueries
  ]);

  // Закрытие предложений при клике вне области
  const handleClickAway = useCallback(() => {
    setState(prev => ({ ...prev, showSuggestions: false, selectedSuggestionIndex: -1 }));
  }, []);

  // Получение иконки для типа предложения
  const getSuggestionIcon = (suggestion: TireSuggestion) => {
    switch (suggestion.type) {
      case 'brand':
        return <CarIcon fontSize="small" />;
      case 'model':
        return <SettingsIcon fontSize="small" />;
      case 'popular':
        return <TrendingUpIcon fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  // Рендер предложений
  const renderSuggestions = () => {
    if (!state.showSuggestions) return null;

    const hasSearchSuggestions = suggestions.length > 0;
    const showExamples = value.length === 0;

    return (
      <Fade in={state.showSuggestions}>
        <Paper
          ref={suggestionsRef}
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <List dense>
            {/* Предложения на основе ввода */}
            {hasSearchSuggestions && (
              <>
                <ListItem>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Предложения
                  </Typography>
                </ListItem>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={`suggestion-${index}`}
                    button
                    selected={index === state.selectedSuggestionIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getSuggestionIcon(suggestion)}
                    </ListItemIcon>
                    <ListItemText
                      primary={suggestion.text}
                      secondary={suggestion.count ? `${suggestion.count} результатов` : undefined}
                    />
                    {suggestion.type === 'popular' && (
                      <Chip size="small" label="Популярное" variant="outlined" />
                    )}
                  </ListItem>
                ))}
              </>
            )}

            {/* Примеры запросов */}
            {showExamples && (
              <>
                {hasSearchSuggestions && <Divider />}
                <ListItem>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Примеры запросов
                  </Typography>
                </ListItem>
                {exampleQueries.map((example, index) => {
                  const globalIndex = suggestions.length + index;
                  return (
                    <ListItem
                      key={`example-${index}`}
                      button
                      selected={globalIndex === state.selectedSuggestionIndex}
                      onClick={() => {
                        onChange(example);
                        onSearch(example);
                        setState(prev => ({ ...prev, showSuggestions: false }));
                      }}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'secondary.light',
                          '&:hover': {
                            backgroundColor: 'secondary.main',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SearchIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={example} />
                    </ListItem>
                  );
                })}
              </>
            )}

            {/* Подсказка для пользователя */}
            {!hasSearchSuggestions && !showExamples && (
              <ListItem>
                <ListItemText
                  primary="Начните вводить запрос"
                  secondary="Например: BMW 3 Series, Тигуан шины R18"
                  sx={{ textAlign: 'center', py: 2 }}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Fade>
    );
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }} className={className}>
        <TextField
          ref={inputRef}
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={state.focused ? 'primary' : 'action'} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading && (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                )}
                {value && !loading && (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                    aria-label="Очистить поиск"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              backgroundColor: colors.backgroundField,
              '&:hover': {
                backgroundColor: colors.backgroundHover,
              },
              '&.Mui-focused': {
                backgroundColor: colors.backgroundField,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
                borderWidth: 1,
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
          }}
        />
        
        {/* Подсказки по использованию */}
        {state.focused && value.length === 0 && (
          <Box sx={{ mt: 1, px: 2 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Попробуйте: "BMW 3 Series 2020", "Тигуан резина R18", "Mercedes шины"
            </Typography>
          </Box>
        )}

        {/* Предложения */}
        {renderSuggestions()}
      </Box>
    </ClickAwayListener>
  );
};

export default TireSearchBar;