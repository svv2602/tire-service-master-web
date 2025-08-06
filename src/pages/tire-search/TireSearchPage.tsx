import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Fade,
  Alert,
  Snackbar,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TireSearchBar from '../../components/tire-search/TireSearchBar/TireSearchBar';
import TireSearchResults from '../../components/tire-search/TireSearchResults/TireSearchResults';
import SupplierProductsResults from '../../components/tire-search/SupplierProductsResults';
import { SearchHistory, PopularSearches, TireConversation } from '../../components/tire-search';
import { useTireSearch, useTireFavorites } from '../../hooks/useTireSearch';
import { useSupplierProductsSearch } from '../../hooks/useSupplierProductsSearch';
import { tireSearchCacheUtils } from '../../api/tireSearch.api';
import { useAppDispatch } from '../../store';
import { getThemeColors } from '../../styles';
import { isTireSizeOnlyResult, extractSingleTireSize, createTireOffersUrl, extractSearchParams } from '../../utils/tireSearchUtils';
import ClientLayout from '../../components/client/ClientLayout';
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
  
  // Состояние для мини-чата
  const [conversationData, setConversationData] = useState<any>(null);
  const [isConversationMode, setIsConversationMode] = useState(false);
  
  // Состояние для автоматического перенаправления
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

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

  // Хук для поиска товаров поставщиков
  const {
    groups: supplierGroups,
    loading: supplierLoading,
    error: supplierError,
    searchProducts: searchSupplierProducts,
    clearResults: clearSupplierResults,
    totalGroups: supplierTotalGroups,
    totalProducts: supplierTotalProducts,
  } = useSupplierProductsSearch({
    autoSearch: false,
    enableFilters: true
  });

  // Обработка автоматического перенаправления
  useEffect(() => {
    if (pendingRedirect) {
      console.log('Выполняем отложенный переход на:', pendingRedirect);
      navigate(pendingRedirect);
      setPendingRedirect(null);
    }
  }, [pendingRedirect, navigate]);

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

  // Обработка поиска товаров поставщиков на основе parsed_data
  const handleSupplierProductsSearch = async (parsedData: any) => {
    try {
      // Очищаем предыдущие результаты
      clearSupplierResults();
      
      // Извлекаем параметры поиска из parsed_data
      const searchParams: any = {};
      
      if (parsedData.tire_brands?.length > 0) {
        searchParams.brand = parsedData.tire_brands[0]; // Берем первый бренд
      }
      
      if (parsedData.seasonality) {
        // Конвертируем сезонность в нужный формат
        const seasonMap: { [key: string]: string } = {
          'зимние': 'winter',
          'летние': 'summer', 
          'всесезонные': 'all_season',
          'winter': 'winter',
          'summer': 'summer',
          'all_season': 'all_season'
        };
        searchParams.season = seasonMap[parsedData.seasonality.toLowerCase()] || parsedData.seasonality;
      }
      
      if (parsedData.tire_sizes?.length > 0) {
        const firstSize = parsedData.tire_sizes[0];
        if (firstSize.width) searchParams.width = parseInt(firstSize.width);
        if (firstSize.height) searchParams.height = parseInt(firstSize.height);
        if (firstSize.diameter) searchParams.diameter = firstSize.diameter.toString();
      }
      
      // Только товары в наличии
      searchParams.in_stock_only = true;
      
      console.log('Searching supplier products with params:', searchParams);
      
      // Выполняем поиск товаров поставщиков
      await searchSupplierProducts(searchParams);
      
    } catch (error) {
      console.error('Supplier products search error:', error);
    }
  };

  // Обработка поиска
  const handleSearch = async (query: string, filters?: any) => {
    if (!query.trim()) {
      setNotification({
        open: true,
        message: 'Введите поисковый запрос',
        severity: 'warning'
      });
      return;
    }

    try {
      const result = await search(query.trim(), filters);
      
      // Отладочная информация
      console.log('Search result:', result);
      console.log('conversation_mode field:', result?.conversation_mode);
      console.log('success field:', result?.success);
      console.log('message field:', result?.message);
      console.log('follow_up_questions field:', result?.follow_up_questions);
      console.log('tire_sizes field:', result?.tire_sizes?.length, 'results');
      console.log('tire_sizes diameters:', result?.tire_sizes?.map((s: any) => s.diameter).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i));
      
      // Проверяем, включен ли режим разговора
      if (result && 'conversation_mode' in result && result.conversation_mode) {
        console.log('Activating conversation mode with data:', result);
        setIsConversationMode(true);
        setConversationData(result);
      } else {
        console.log('No conversation mode, clearing data');
        setIsConversationMode(false);
        setConversationData(null);
      }
      
      // Проверяем условие для автоматического перехода на tire-offers
      // Используем результаты из API ответа, а не из состояния (которое может быть устаревшим)
      if (result?.results && result.results.length > 0 && !isConversationMode) {
        console.log('Проверка результатов для автоматического перехода:', result.results.length, 'результатов');
        
        // Проверяем, является ли результат "только размером шин" без автомобиля
        if (isTireSizeOnlyResult(result.results)) {
          // Извлекаем единственный размер шины
          const singleTireSize = extractSingleTireSize(result.results);
          
          if (singleTireSize) {
            console.log('Найден единственный размер шин без автомобиля:', singleTireSize);
            
            // Извлекаем параметры поиска (сезонность, бренд шин)
            const searchParameters = extractSearchParams(query.trim(), result?.parsed_data);
            console.log('Параметры поиска для фильтрации:', searchParameters);
            
            // Создаем URL для перехода с фильтрами
            const offersUrl = createTireOffersUrl(singleTireSize, searchParameters);
            console.log('Запланирован автоматический переход на:', offersUrl);
            
            // Устанавливаем отложенный переход (будет выполнен в useEffect)
            setPendingRedirect(offersUrl);
          } else {
            console.log('Найдено несколько размеров шин, автоматический переход отменен');
          }
        } else {
          console.log('Результаты содержат информацию об автомобиле, автоматический переход отменен');
        }
      } else {
        console.log('Нет результатов для автоматического перехода или активен режим разговора');
      }
      
      // Автоматический поиск товаров поставщиков если есть parsed_data
      if (result?.parsed_data) {
        await handleSupplierProductsSearch(result.parsed_data);
      }
      
      if ((!result?.results || result.results.length === 0) && !isConversationMode) {
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

  // Обработчики для мини-чата
  const handleConversationSuggestion = (suggestion: string) => {
    // Извлекаем модель из suggestion (например, "Mazda 6" -> "6")
    const context = conversationData?.context || {};
    const brand = context.brand || '';
    
    // Если suggestion содержит бренд, извлекаем только модель
    let modelQuery = suggestion;
    
    // Проверяем разные варианты брендов в suggestion
    const knownBrands = ['Mazda', 'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Volkswagen', 'Ford'];
    let detectedBrand = brand;
    
    // Если бренд не найден в контексте, пытаемся определить из suggestion
    if (!detectedBrand) {
      for (const knownBrand of knownBrands) {
        if (suggestion.toLowerCase().includes(knownBrand.toLowerCase())) {
          detectedBrand = knownBrand;
          break;
        }
      }
    }
    
    if (detectedBrand && suggestion.toLowerCase().includes(detectedBrand.toLowerCase())) {
      // Убираем бренд из строки, оставляем только модель
      const brandRegex = new RegExp(`^${detectedBrand}\\s+`, 'gi');
      modelQuery = suggestion.replace(brandRegex, '').trim();
      
      // Если после удаления бренда ничего не осталось, используем весь suggestion
      if (!modelQuery) {
        modelQuery = suggestion;
      }
    }
    
    setQuery(modelQuery);
    console.log('Suggestion click:', { 
      original: suggestion, 
      extracted: modelQuery, 
      brand: detectedBrand, 
      context 
    });
    console.log('conversationData:', conversationData);
    console.log('conversationData?.context:', conversationData?.context);
    console.log('Calling handleSearch with filters:', { context });
    handleSearch(modelQuery, { context });
  };

  const handleConversationAnswer = (field: string, value: string) => {
    // Сохраняем ответ и обновляем состояние
    console.log(`Answered ${field}: ${value}`);
    // Передаем ответ как новый поиск с контекстом
    const context = conversationData?.context || {};
    handleSearch(value, { context });
  };

  const handleConversationNewSearch = (query: string) => {
    setQuery(query);
    // Для нового поиска не передаем контекст (начинаем сначала)
    handleSearch(query);
  };

  // Прокрутка наверх
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Закрытие уведомления
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const colors = getThemeColors(theme);

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>

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
            bgcolor: colors.backgroundSecondary,
            border: `1px solid ${colors.borderPrimary}`
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

        {/* Мини-чат для уточнения запроса */}
        {isConversationMode && conversationData && (
          <TireConversation
            searchResponse={conversationData}
            onSuggestionClick={handleConversationSuggestion}
            onQuestionAnswer={handleConversationAnswer}
            onNewSearch={handleConversationNewSearch}
          />
        )}

        {/* Результаты поиска - скрываем в режиме диалога */}
        {!isConversationMode && (
          <Fade in timeout={500}>
            <Box id="search-results-section">
              <TireSearchResults
                results={searchState.results}
                loading={isLoading}
                error={hasError ? searchState.error : null}
                total={searchState.total}
                page={searchState.page}
                query={searchState.query}
                carInfo={searchState.carInfo}
                onPageChange={handlePageChange}
                onResultClick={handleResultClick}
                onFavoriteToggle={handleFavoriteToggle}
                onSearchExample={handleSearch}
                favorites={favorites}
              />
            
            {/* Результаты поиска товаров поставщиков - скрываем в режиме диалога и если нет данных */}
            {supplierGroups && supplierGroups.length > 0 && (
              <SupplierProductsResults
                groups={supplierGroups}
                loading={supplierLoading}
                error={supplierError || undefined}
                showAllOffers={true}
                onProductClick={(product) => {
                  // Открытие товара в новой вкладке
                  if (product.product_url) {
                    window.open(product.product_url, '_blank', 'noopener,noreferrer');
                  }
                }}
                onSupplierClick={(supplierId) => {
                  // TODO: Добавить логику перехода к странице поставщика
                }}
              />
            )}
          </Box>
        </Fade>
        )}

        {/* Дополнительная информация */}
        {!isLoading && !hasResults && !hasError && searchState.query && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('help.tips')}
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>{t('help.tip1')}</li>
                <li>{t('help.tip2')}</li>
                <li>{t('help.tip3')}</li>
                <li>{t('help.tip4')}</li>
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
    </ClientLayout>
  );
};

export default TireSearchPage;