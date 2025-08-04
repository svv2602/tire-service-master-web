import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Button,
  Skeleton,
  Alert,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { getThemeColors } from '../../../styles';
import { useGetPopularQueriesQuery } from '../../../api/tireSearch.api';
import { useTranslation } from 'react-i18next';

// Типы данных
export interface PopularSearchItem {
  id: string;
  query: string;
  searchCount: number;
  trend: 'up' | 'down' | 'stable';
  category: 'brand' | 'model' | 'size' | 'general';
  lastSearched: Date;
  resultsCount?: number;
}

interface PopularSearchesProps {
  onSearchSelect: (query: string) => void;
  maxItems?: number;
  showTrends?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
}

const PopularSearches: React.FC<PopularSearchesProps> = ({
  onSearchSelect,
  maxItems = 12,
  showTrends = true,
  compact = false,
  autoRefresh = false
}) => {
  const { t } = useTranslation(['tireSearch', 'common']);
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // Состояние компонента
  const [expanded, setExpanded] = useState(!compact);
  const [showAll, setShowAll] = useState(false);

  // RTK Query для получения популярных запросов
  const { data: apiPopularQueries, isLoading: loading, error: apiError, refetch } = useGetPopularQueriesQuery();

  // Статические популярные поиски (fallback) - генерируются динамически для локализации
  const getStaticPopularSearches = (): PopularSearchItem[] => [
    {
      id: '1',
      query: t('help.exampleBrand'),
      searchCount: 1250,
      trend: 'up',
      category: 'brand',
      lastSearched: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      resultsCount: 45
    },
    {
      id: '2',
      query: t('help.exampleSize'),
      searchCount: 980,
      trend: 'stable',
      category: 'size',
      lastSearched: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      resultsCount: 78
    },
    {
      id: '3',
      query: t('help.exampleModel'),
      searchCount: 875,
      trend: 'up',
      category: 'model',
      lastSearched: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
      resultsCount: 12
    },
    {
      id: '4',
      query: t('help.exampleCombined'),
      searchCount: 720,
      trend: 'down',
      category: 'brand',
      lastSearched: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
      resultsCount: 28
    },
    {
      id: '5',
      query: 'R18',
      searchCount: 650,
      trend: 'up',
      category: 'size',
      lastSearched: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
      resultsCount: 34
    },
    {
      id: '6',
      query: 'Toyota Camry',
      searchCount: 580,
      trend: 'stable',
      category: 'model',
      lastSearched: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
      resultsCount: 19
    },
    {
      id: '7',
      query: '225/50R17',
      searchCount: 520,
      trend: 'up',
      category: 'size',
      lastSearched: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 часов назад
      resultsCount: 56
    },
    {
      id: '8',
      query: 'Audi Q5',
      searchCount: 480,
      trend: 'stable',
      category: 'model',
      lastSearched: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      resultsCount: 23
    },
    {
      id: '9',
      query: 'R19',
      searchCount: 420,
      trend: 'down',
      category: 'size',
      lastSearched: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 часов назад
      resultsCount: 41
    },
    {
      id: '10',
      query: 'Honda CR-V',
      searchCount: 380,
      trend: 'up',
      category: 'model',
      lastSearched: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      resultsCount: 15
    },
    {
      id: '11',
      query: 'Hyundai Tucson',
      searchCount: 350,
      trend: 'stable',
      category: 'model',
      lastSearched: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 часов назад
      resultsCount: 18
    },
    {
      id: '12',
      query: '255/40R18',
      searchCount: 320,
      trend: 'up',
      category: 'size',
      lastSearched: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
      resultsCount: 32
    }
  ];

  // Обработка данных из API или fallback на статические
  const popularSearches: PopularSearchItem[] = useMemo(() => {
    if (apiPopularQueries && apiPopularQueries.length > 0) {
      return apiPopularQueries.map((query: string, index: number) => ({
        id: `api-${index}`,
        query,
        searchCount: Math.floor(Math.random() * 1000) + 100, // Генерируем случайное число для демо
        trend: index < 3 ? 'up' : index < 6 ? 'stable' : 'down',
        category: query.includes('BMW') || query.includes('Mercedes') ? 'brand' : 
                 query.includes('R1') || query.includes('R2') ? 'size' : 'general',
        lastSearched: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Случайное время в последние 24 часа
        resultsCount: Math.floor(Math.random() * 50) + 10
      }));
    }
    // Fallback на статические данные
    return getStaticPopularSearches();
  }, [apiPopularQueries]);

  const error = apiError ? t('errors.searchFailed') : null;

  // Получение иконки тренда
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />;
      case 'down':
        return <TrendingUpIcon sx={{ fontSize: 14, color: 'error.main', transform: 'rotate(180deg)' }} />;
      default:
        return <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
    }
  };

  // Получение цвета для категории
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'brand':
        return 'primary';
      case 'model':
        return 'secondary';
      case 'size':
        return 'info';
      case 'general':
        return 'success';
      default:
        return 'default';
    }
  };

  // Получение иконки для категории
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'brand':
        return <StarIcon sx={{ fontSize: 14 }} />;
      case 'model':
        return <SearchIcon sx={{ fontSize: 14 }} />;
      case 'size':
        return <SpeedIcon sx={{ fontSize: 14 }} />;
      case 'general':
        return <FireIcon sx={{ fontSize: 14 }} />;
      default:
        return <SearchIcon sx={{ fontSize: 14 }} />;
    }
  };

  // Форматирование количества поисков
  const formatSearchCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Получение элементов для отображения
  const getDisplayItems = () => {
    const itemsToShow = showAll ? popularSearches : popularSearches.slice(0, maxItems);
    return itemsToShow;
  };

  if (popularSearches.length === 0 && !loading) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 2, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Заголовок */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: colors.backgroundSecondary, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: compact ? 'pointer' : 'default'
        }}
        onClick={compact ? () => setExpanded(!expanded) : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            Популярные поиски
          </Typography>
          {popularSearches.length > 0 && (
            <Chip 
              label={popularSearches.length} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Обновить">
            <span>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  refetch();
                }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          {compact && (
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        {loading ? (
          // Скелетон загрузки
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : error ? (
          // Ошибка загрузки
          <Box sx={{ p: 2 }}>
            <Alert severity="error" action={
              <Button size="small" onClick={() => refetch()}>
                Повторить
              </Button>
            }>
              {error}
            </Alert>
          </Box>
        ) : (
          // Список популярных поисков
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {getDisplayItems().map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getCategoryIcon(item.category)}
                        <Typography variant="body2" component="span">
                          {item.query}
                        </Typography>
                        {showTrends && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                            {getTrendIcon(item.trend)}
                            <Typography variant="caption" component="span">
                              {formatSearchCount(item.searchCount)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                    onClick={() => onSearchSelect(item.query)}
                    color={getCategoryColor(item.category) as any}
                    variant={index < 3 ? 'filled' : 'outlined'}
                    sx={{ 
                      width: '100%',
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Показать больше */}
            {popularSearches.length > maxItems && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  {!showAll ? (
                    <Button
                      size="small"
                      onClick={() => setShowAll(true)}
                      startIcon={<ExpandMoreIcon />}
                    >
                      {t('popular.showMore', { count: popularSearches.length - maxItems })}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setShowAll(false)}
                      startIcon={<ExpandLessIcon />}
                    >
                      Свернуть
                    </Button>
                  )}
                </Box>
              </>
            )}

            {/* Дополнительная информация */}
            {popularSearches.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FireIcon sx={{ fontSize: 12 }} />
                  {t('popular.topPopular', { count: Math.min(3, popularSearches.length) })}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default PopularSearches;