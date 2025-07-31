import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Fade,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TireSearchBar from '../../components/tire-search/TireSearchBar/TireSearchBar';
import TireSearchResults from '../../components/tire-search/TireSearchResults/TireSearchResults';
import { SearchHistory, PopularSearches } from '../../components/tire-search';
import { useTireSearch, useTireFavorites } from '../../hooks/useTireSearch';
import { tireSearchCacheUtils } from '../../api/tireSearch.api';
import { useAppDispatch } from '../../store';
import type { TireSearchResult, TireSuggestion } from '../../types/tireSearch';

const TireSearchPage: React.FC = () => {
  const { t } = useTranslation(['tireSearch', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Состояние страницы
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Хуки для поиска
  const {
    searchState,
    search,
    setQuery,
    suggestions,
    isLoading,
    hasError,
    hasResults,
    availableDiameters,
    availableBrands,
    goToPage
  } = useTireSearch({
    debounceDelay: 300,
    autoSearch: false,
    saveHistory: true,
    enableSuggestions: true
  });

  const { favorites, toggleFavorite, isFavorite } = useTireFavorites();

  // Инициализация поиска из URL параметров
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    const pageFromUrl = parseInt(searchParams.get('page') || '1');
    
    if (queryFromUrl && queryFromUrl !== searchState.query) {
      setQuery(queryFromUrl);
      search(queryFromUrl);
    }
    
    if (pageFromUrl > 1 && pageFromUrl !== searchState.page) {
      goToPage(pageFromUrl);
    }
  }, [searchParams]);

  // Обновление URL при изменении поиска
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchState.query) {
      params.set('q', searchState.query);
    }
    
    if (searchState.page > 1) {
      params.set('page', searchState.page.toString());
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    const currentUrl = window.location.search;
    
    if (newUrl !== currentUrl) {
      setSearchParams(params, { replace: true });
    }
  }, [searchState.query, searchState.page, setSearchParams]);

  // Отслеживание прокрутки для кнопки "Наверх"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Предзагрузка популярных данных
  useEffect(() => {
    tireSearchCacheUtils.prefetchPopularData(dispatch);
  }, [dispatch]);

  // Обработка поиска
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setNotification({
        open: true,
        message: 'Введите поисковый запрос',
        severity: 'warning'
      });
      return;
    }

    try {
      await search(query.trim());
      
      if (searchState.results.length === 0) {
        setNotification({
          open: true,
          message: 'По вашему запросу ничего не найдено. Попробуйте другие ключевые слова.',
          severity: 'info'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Ошибка при выполнении поиска. Попробуйте еще раз.',
        severity: 'error'
      });
    }
  };

  // Обработка выбора предложения
  const handleSuggestionSelect = (suggestion: TireSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Обработка клика по результату
  const handleResultClick = (result: TireSearchResult) => {
    // Здесь можно добавить логику перехода к подробной информации
    console.log('Клик по результату:', result);
    
    // Пример: переход к поиску сервисных точек для данной конфигурации
    navigate(`/client/search?brand=${result.brand_name}&model=${result.model_name}`);
  };

  // Обработка переключения избранного
  const handleFavoriteToggle = (resultId: number) => {
    toggleFavorite(resultId);
    
    const result = searchState.results.find(r => r.id === resultId);
    if (result) {
      const message = isFavorite(resultId) 
        ? `${result.full_name} удален из избранного`
        : `${result.full_name} добавлен в избранное`;
      
      setNotification({
        open: true,
        message,
        severity: 'success'
      });
    }
  };

  // Обработка изменения страницы
  const handlePageChange = (page: number) => {
    goToPage(page);
    
    // Прокрутка к началу результатов
    const resultsElement = document.getElementById('search-results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Прокрутка наверх
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Закрытие уведомления
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Хлебные крошки */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/client"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Главная
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 0.5, fontSize: 20 }} />
            {t('navigation.search')}
          </Typography>
        </Breadcrumbs>

        {/* Заголовок страницы */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
          >
{t('title')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          >
            {t('subtitle')}
          </Typography>
        </Box>

        {/* Поисковая строка */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <TireSearchBar
            value={searchState.query}
            onChange={setQuery}
            onSearch={handleSearch}
            loading={isLoading}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder={t('searchPlaceholder')}
          />

          {/* Статистика системы */}
          {availableBrands.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                📊 В базе: {availableBrands.length} брендов
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🔧 Диаметры: R{availableDiameters.join(', R')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ❤️ Избранное: {favorites.length}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Популярные поиски и история - показываем когда нет активного поиска */}
        {!searchState.query && !isLoading && searchState.results.length === 0 && (
          <Box sx={{ mb: 4 }}>
            <PopularSearches 
              onSearchSelect={setQuery}
              maxItems={12}
              showTrends={true}
              compact={false}
              autoRefresh={true}
            />
            <SearchHistory 
              onSearchSelect={setQuery}
              maxItems={8}
              showFavorites={true}
              compact={false}
            />
          </Box>
        )}

        {/* Результаты поиска */}
        <Fade in timeout={500}>
          <Box id="search-results-section">
            <TireSearchResults
              results={searchState.results}
              loading={isLoading}
              error={hasError ? searchState.error : null}
              total={searchState.total}
              page={searchState.page}
              onPageChange={handlePageChange}
              onResultClick={handleResultClick}
              onFavoriteToggle={handleFavoriteToggle}
              favorites={favorites}
            />
          </Box>
        </Fade>

        {/* Дополнительная информация */}
        {!isLoading && !hasResults && !hasError && searchState.query && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Советы для улучшения поиска:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Используйте полное название бренда (BMW вместо БМВ)</li>
                <li>Добавьте модель автомобиля (3 Series, C-Class)</li>
                <li>Укажите год выпуска для более точных результатов</li>
                <li>Попробуйте синонимы (Тигуан = Tiguan)</li>
              </ul>
            </Alert>
          </Box>
        )}
      </Container>

      {/* Кнопка "Наверх" */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Fade>

      {/* Кнопка избранного (мобильная версия) */}
      {isMobile && favorites.length > 0 && (
        <Fab
          color="secondary"
          size="medium"
          onClick={() => navigate('/client/favorites')}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
        >
          <FavoriteIcon />
        </Fab>
      )}

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TireSearchPage;