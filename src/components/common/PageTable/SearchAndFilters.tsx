import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SearchConfig, FilterConfig } from './index';

interface SearchAndFiltersProps {
  search?: SearchConfig;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
}

/**
 * Компонент поиска и фильтрации
 */
export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  search,
  filters = [],
  onClearFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Проверяем есть ли активные фильтры
  const hasActiveFilters = filters.some(filter => {
    const value = filter.value;
    const clearValue = filter.clearValue !== undefined ? filter.clearValue : (Array.isArray(value) ? [] : '');
    
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== clearValue;
  });

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <FormControl 
            key={filter.id} 
            size="small" 
            sx={{ minWidth: 150 }}
            disabled={filter.disabled}
          >
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={filter.value || ''}
              label={filter.label}
              onChange={(e) => filter.onChange(e.target.value)}
              disabled={filter.disabled}
            >
              {filter.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            key={filter.id}
            size="small"
            sx={{ minWidth: 200 }}
            disabled={filter.disabled}
            options={filter.options || []}
            getOptionLabel={(option: any) => option.label || ''}
            value={filter.options?.find((opt: any) => opt.value === filter.value) || null}
            onChange={(event, newValue) => {
              filter.onChange(newValue ? newValue.value : filter.clearValue || '');
            }}
            freeSolo
            onInputChange={(event, newInputValue) => {
              // Если пользователь вводит текст вручную, используем его как значение
              if (event && event.type === 'change') {
                filter.onChange(newInputValue || filter.clearValue || '');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={filter.label}
                placeholder={filter.placeholder}
                onFocus={(e) => {
                  // Выделяем весь текст при получении фокуса
                  e.target.select();
                }}
              />
            )}
          />
        );

      case 'multiselect':
        return (
          <FormControl 
            key={filter.id} 
            size="small" 
            sx={{ minWidth: 200 }}
          >
            <InputLabel>{filter.label}</InputLabel>
            <Select
              multiple
              value={filter.value || []}
              label={filter.label}
              onChange={(e) => filter.onChange(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const option = filter.options?.find((opt: any) => opt.value === value);
                    return (
                      <Chip 
                        key={value} 
                        label={option?.label || value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {filter.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'text':
        return (
          <TextField
            key={filter.id}
            size="small"
            label={filter.label}
            placeholder={filter.placeholder}
            value={filter.value || ''}
            onChange={(e) => filter.onChange(e.target.value)}
            onFocus={(e) => {
              // Выделяем весь текст при получении фокуса
              e.target.select();
            }}
            sx={{ minWidth: 150 }}
          />
        );

      case 'date':
        return (
          <TextField
            key={filter.id}
            size="small"
            type="date"
            label={filter.label}
            value={filter.value || ''}
            onChange={(e) => filter.onChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              minWidth: 150,
              // Исправляем иконку календаря в темной теме
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                cursor: 'pointer',
              },
              '& input[type="date"]::-webkit-inner-spin-button': {
                display: 'none',
              },
              '& input[type="date"]::-webkit-clear-button': {
                display: 'none',
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  if (!search && filters.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Поиск */}
        {search && (
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              size="small"
              placeholder={search.placeholder || 'Поиск...'}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              onFocus={(e) => {
                // Выделяем весь текст при получении фокуса
                e.target.select();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: search.showClearButton && search.value && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => search.onChange('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Фильтры */}
        {filters.length > 0 && (
          <Grid item xs={12} md={search ? 6 : 12} lg={search ? 8 : 12}>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={2}
              alignItems={isMobile ? 'stretch' : 'center'}
              flexWrap="wrap"
            >
              {/* Иконка фильтров */}
              {!isMobile && (
                <FilterListIcon color="action" sx={{ mr: 1 }} />
              )}

              {/* Контролы фильтров */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 2,
                  flexWrap: 'wrap',
                  flex: 1
                }}
              >
                {filters.map(renderFilter)}
              </Box>

              {/* Кнопка очистки фильтров */}
              {hasActiveFilters && onClearFilters && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={onClearFilters}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? '100%' : 'auto'
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SearchAndFilters; 