import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Skeleton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Divider,
  Paper,
  LinearProgress,
  Fade,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TireConfigurationCard from '../TireConfigurationCard/TireConfigurationCard';
import Pagination from '../../ui/Pagination/Pagination';
import { getThemeColors } from '../../../styles';
import type { 
  TireSearchResultsProps,
  TireSearchResult,
  TIRE_SEARCH_CONSTANTS 
} from '../../../types/tireSearch';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'brand' | 'model' | 'year';

const TireSearchResults: React.FC<TireSearchResultsProps> = ({
  results = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  onPageChange,
  onResultClick,
  onFavoriteToggle,
  onSearchExample,
  favorites = [],
  className
}) => {
  const { t } = useTranslation(['tireSearch', 'common']);
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSearchInfo, setShowSearchInfo] = useState(false);

  // Сортировка результатов
  const sortedResults = React.useMemo(() => {
    if (sortBy === 'relevance') {
      return [...results].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
    
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'brand':
          return a.brand_name.localeCompare(b.brand_name);
        case 'model':
          return a.model_name.localeCompare(b.model_name);
        case 'year':
          return b.year_to - a.year_to; // Новые автомобили сначала
        default:
          return 0;
      }
    });
  }, [results, sortBy]);

  // Обработка изменения страницы
  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    // Прокрутка к началу результатов
    document.getElementById('search-results-top')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Обработка клика по результату
  const handleResultClick = (result: TireSearchResult) => {
    onResultClick?.(result);
  };

  // Обработка переключения избранного
  const handleFavoriteToggle = (resultId: number) => {
    onFavoriteToggle?.(resultId);
  };

  // Рендер загрузки
  const renderLoading = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </Box>
      
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Рендер ошибки
  const renderError = () => (
    <Alert 
      severity="error" 
      sx={{ borderRadius: 2 }}
      action={
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          {t('errors.tryAgain')}
        </Button>
      }
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('errors.searchFailed')}
      </Typography>
      <Typography variant="body2">
        {typeof error === 'string' ? error : t('errors.networkError')}
      </Typography>
    </Alert>
  );

  // Рендер пустого состояния
  const renderEmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        bgcolor: colors.backgroundSecondary,
        borderRadius: 3,
        border: '2px dashed',
        borderColor: colors.borderPrimary
      }}
    >
      <SearchIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'grey.600' }}>
        {t('emptyState.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('emptyState.description')}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t('emptyState.examplesLabel')}
        </Typography>
        {['BMW 3 Series', 'Mercedes C-Class', 'Тигуан R18', 'Audi A4 2020'].map((example) => (
          <Chip
            key={example}
            label={example}
            size="small"
            variant="outlined"
            onClick={() => {
              onSearchExample?.(example);
            }}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      <Button
        variant="outlined"
        startIcon={<TrendingUpIcon />}
        onClick={() => {
          // TODO: Добавить логику для показа популярных запросов
        }}
      >
        {t('emptyState.showPopularButton')}
      </Button>
    </Paper>
  );

  // Рендер заголовка результатов
  const renderResultsHeader = () => (
    <Box id="search-results-top" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Результаты поиска
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Найдено {total} конфигураций шин
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Информация о поиске */}
        <Button
          size="small"
          startIcon={<InfoIcon />}
          onClick={() => setShowSearchInfo(!showSearchInfo)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Информация
        </Button>

        {/* Сортировка */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={sortBy}
            label="Сортировка"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            startAdornment={<SortIcon sx={{ mr: 1, fontSize: 20 }} />}
          >
            <MenuItem value="relevance">По релевантности</MenuItem>
            <MenuItem value="brand">По бренду</MenuItem>
            <MenuItem value="model">По модели</MenuItem>
            <MenuItem value="year">По году</MenuItem>
          </Select>
        </FormControl>

        {/* Переключение вида */}
        <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Button
            size="small"
            variant={viewMode === 'grid' ? 'contained' : 'text'}
            onClick={() => setViewMode('grid')}
            sx={{ minWidth: 40, borderRadius: '4px 0 0 4px' }}
          >
            <ViewModuleIcon />
          </Button>
          <Button
            size="small"
            variant={viewMode === 'list' ? 'contained' : 'text'}
            onClick={() => setViewMode('list')}
            sx={{ minWidth: 40, borderRadius: '0 4px 4px 0' }}
          >
            <ViewListIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // Рендер информации о поиске
  const renderSearchInfo = () => (
    <Collapse in={showSearchInfo}>
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Информация о поиске
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="body2">
            Страница: {page}
          </Typography>
          <Typography variant="body2">
            Показано: {results.length} из {total}
          </Typography>
          <Typography variant="body2">
            Сортировка: {
              sortBy === 'relevance' ? 'По релевантности' :
              sortBy === 'brand' ? 'По бренду' :
              sortBy === 'model' ? 'По модели' :
              'По году'
            }
          </Typography>
        </Stack>
      </Alert>
    </Collapse>
  );

  // Рендер результатов
  const renderResults = () => {
    const gridProps = viewMode === 'grid' 
      ? { xs: 12, sm: 6, lg: 4 }
      : { xs: 12 };

    return (
      <Grid container spacing={3}>
        {sortedResults.map((result) => (
          <Grid item {...gridProps} key={result.id}>
            <Fade in timeout={300}>
              <div>
                <TireConfigurationCard
                  configuration={result}
                  onClick={() => handleResultClick(result)}
                  onFavoriteToggle={() => handleFavoriteToggle(result.id)}
                  isFavorite={favorites.includes(result.id)}
                  compact={viewMode === 'list'}
                  showYear={true}
                  showTireSizes={true}
                />
              </div>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Рендер пагинации
  const renderPagination = () => {
    const totalPages = Math.ceil(total / 20); // TIRE_SEARCH_CONSTANTS.DEFAULT_PAGE_SIZE
    
    if (totalPages <= 1) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Box>
    );
  };

  // Основной рендер
  return (
    <Box className={className}>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : results.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderResultsHeader()}
          {renderSearchInfo()}
          {renderResults()}
          {renderPagination()}
        </>
      )}
    </Box>
  );
};

export default TireSearchResults;