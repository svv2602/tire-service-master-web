import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Skeleton,
  Button,
  Paper,
  LinearProgress,
  Fade,
  useTheme,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SupplierTireDiameterCard from '../SupplierTireDiameterCard/SupplierTireDiameterCard';

import { getThemeColors } from '../../../styles';
import { groupResultsByDiameter, extractSearchParams } from '../../../utils/tireSearchUtils';
import type { 
  TireSearchResultsProps
} from '../../../types/tireSearch';



const TireSearchResults: React.FC<TireSearchResultsProps> = ({
  results = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  query = '',
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
  const navigate = useNavigate();




  // Группировка результатов по диаметрам
  const diameterGroups = React.useMemo(() => {
    return groupResultsByDiameter(results);
  }, [results]);

  // Извлечение параметров поиска из переданного query
  const searchParams = React.useMemo(() => {
    if (!query) return {};
    
    // Используем переданный исходный поисковый запрос
    return extractSearchParams(query);
  }, [query]);



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
    <Box id="search-results-top" sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Результаты поиска
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('supplierSizes.foundDiametersWithSizes', { count: diameterGroups.length })}
      </Typography>
    </Box>
  );



  // Рендер результатов - только актуальные размеры поставщиков
  const renderResults = () => {
    return (
      <Grid container spacing={3}>
        {diameterGroups.map((group) => {
          // Извлекаем размеры для данного диаметра из результатов поиска
          const filterSizes = group.sizes.map(size => ({
            width: size.width,
            height: size.height
          }));
          
          return (
            <Grid item xs={12} md={6} lg={4} key={group.diameter}>
              <Fade in timeout={300}>
                <div>
                  <SupplierTireDiameterCard
                    diameter={group.diameter.toString()}
                    searchParams={searchParams}
                    filterSizes={filterSizes}
                  />
                </div>
              </Fade>
            </Grid>
          );
        })}
      </Grid>
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
          {renderResults()}
        </>
      )}
    </Box>
  );
};

export default TireSearchResults;