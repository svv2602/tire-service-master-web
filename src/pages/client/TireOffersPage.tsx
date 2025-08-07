import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogContent,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  LocalOffer as LocalOfferIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/ui/Pagination/Pagination';
import { useGetAllSupplierProductsQuery, SupplierProduct } from '../../api/suppliers.api';
import ClientLayout from '../../components/client/ClientLayout';
import OrderModal from '../../components/client/OrderModal';
import { TireChatWidget } from '../../components/tire-chat';

const TireOffersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Функция для получения локализованного названия сезона
  const getSeasonLabel = (season: string): string => {
    const seasonKey = `forms.clientPages.tireOffers.seasons.${season}`;
    const translated = t(seasonKey);
    // Если перевод не найден, используем fallback
    if (translated === seasonKey) {
      switch (season) {
        case 'winter': return 'Зимние';
        case 'summer': return 'Летние';
        case 'all_season': return 'Всесезонные';
        default: return season;
      }
    }
    return translated;
  };
  
  // Состояние страницы
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState('price_asc');
  
  // Дополнительные фильтры
  const [widthFilter, setWidthFilter] = useState(searchParams.get('width') || '');
  const [heightFilter, setHeightFilter] = useState(searchParams.get('height') || '');
  const [diameterFilter, setDiameterFilter] = useState(searchParams.get('diameter') || '');
  const [seasonFilter, setSeasonFilter] = useState(searchParams.get('seasonality') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || searchParams.get('manufacturer') || '');
  
  // Состояние модального окна для изображений
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  
  // Состояние модального окна для заказа
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
  
  // Состояние чата
  const [chatOpen, setChatOpen] = useState(false);
  
  // Извлекаем параметры из URL
  const tireSize = searchParams.get('size') || '';
  const brand = searchParams.get('brand') || '';
  const seasonality = searchParams.get('seasonality') || '';
  const manufacturer = searchParams.get('manufacturer') || '';

  // Автоматически извлекаем размеры из параметра size при загрузке
  useEffect(() => {
    const currentTireSize = searchParams.get('size') || '';
    const currentWidth = searchParams.get('width') || '';
    const currentHeight = searchParams.get('height') || '';
    const currentDiameter = searchParams.get('diameter') || '';
    
    // Если есть параметр size, но нет отдельных параметров размеров
    if (currentTireSize && !currentWidth && !currentHeight && !currentDiameter) {
      // Парсим размер вида "225/60R16"
      const sizeMatch = currentTireSize.match(/^(\d+)\/(\d+)R(\d+)$/);
      if (sizeMatch) {
        const [, width, height, diameter] = sizeMatch;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('width', width);
        newParams.set('height', height);
        newParams.set('diameter', diameter);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Преобразование сезонности для API с расширенной локализацией
  const convertSeasonForAPI = (season: string): string => {
    const seasonMap: { [key: string]: string } = {
      // Русский - полные формы и сокращения
      'зимние': 'winter',
      'зимняя': 'winter',
      'зимний': 'winter',
      'зима': 'winter',
      'зимн': 'winter',
      'зим': 'winter',
      'зимних': 'winter',
      'зимой': 'winter',
      'зимне': 'winter',
      'зимку': 'winter',
      
      'летние': 'summer', 
      'летняя': 'summer',
      'летний': 'summer',
      'лето': 'summer',
      'летн': 'summer',
      'лет': 'summer',
      'ле': 'summer',
      'летних': 'summer',
      'летом': 'summer',
      'летне': 'summer',
      
      'всесезонные': 'all_season',
      'всесезонная': 'all_season',
      'всесезонный': 'all_season',
      'всесезон': 'all_season',
      'всесезонка': 'all_season',
      'всесезонных': 'all_season',
      'всесезонными': 'all_season',
      'круглогодичные': 'all_season',
      'круглогодичная': 'all_season',
      'круглогодичный': 'all_season',
      
      // Украинский - уникальные формы и сокращения
      'зимові': 'winter',
      'зимова': 'winter',
      'зимовий': 'winter',
      'зимових': 'winter',
      'зимовою': 'winter',
      'зимове': 'winter',
      
      'літні': 'summer',
      'літня': 'summer',
      'літній': 'summer',
      'літо': 'summer',
      'літн': 'summer',
      'літ': 'summer',
      'літніх': 'summer',
      'літньою': 'summer',
      'літнє': 'summer',
      
      'всесезонні': 'all_season',
      'всесезонна': 'all_season',
      'всесезонний': 'all_season',
      'всесезонних': 'all_season',
      'всесезонними': 'all_season',
      'цілорічні': 'all_season',
      'цілорічна': 'all_season',
      'цілорічний': 'all_season',
      
      // Английский (как есть)
      'winter': 'winter',
      'summer': 'summer',
      'all_season': 'all_season',
      'all-season': 'all_season',
      'allseason': 'all_season'
    };
    return seasonMap[season.toLowerCase()] || season;
  };

  // Функция для обработки расширенного поиска
  const processEnhancedSearch = (searchQuery: string): { search: string; season?: string; searchWords: string[] } => {
    if (!searchQuery.trim()) return { search: '', searchWords: [] };

    // Разделяем поисковый запрос на части (пробелы и слеши)
    const searchParts = searchQuery.toLowerCase()
      .split(/[\s\/]+/)
      .filter(part => part.trim().length > 0);

    const processedParts: string[] = [];
    let detectedSeason: string | undefined;

    // Проверяем каждую часть на сезонность
    for (const part of searchParts) {
      const seasonMatch = convertSeasonForAPI(part);
      if (['winter', 'summer', 'all_season'].includes(seasonMatch)) {
        // Найдена сезонность - сохраняем для отдельного параметра
        detectedSeason = seasonMatch;
      } else if (part.length >= 2) { // Игнорируем слишком короткие слова
        // Обычное слово - добавляем к поиску
        processedParts.push(part);
      }
    }

    return {
      search: processedParts.join(' '), // Объединяем обратно пробелами для backend
      searchWords: processedParts, // Отдельные слова для сложного поиска
      season: detectedSeason
    };
  };

  // Синхронизируем фильтры с URL параметрами
  useEffect(() => {
    if (seasonality && !seasonFilter) {
      setSeasonFilter(seasonality);
    }
    if ((brand || manufacturer) && !brandFilter) {
      setBrandFilter(brand || manufacturer);
    }
  }, [seasonality, brand, manufacturer, seasonFilter, brandFilter]);
  
  // Обработка расширенного поиска
  const processedSearch = processEnhancedSearch(search);

  // API запрос с улучшенной логикой поиска
  const {
    data: offersResponse,
    isLoading,
    error,
    refetch
  } = useGetAllSupplierProductsQuery({
    page,
    per_page: 20,
    search: processedSearch.search.trim(),
    in_stock_only: inStockOnly,
    sort_by: sortBy,
    // Автоматически определенная сезонность из поиска
    season: processedSearch.season || (seasonFilter ? convertSeasonForAPI(seasonFilter) : undefined),
    // Сохраняем поддержку URL параметров для обратной совместимости
    width: widthFilter ? parseInt(widthFilter) : undefined,
    height: heightFilter ? parseInt(heightFilter) : undefined,
    diameter: diameterFilter || undefined,
    brand: brandFilter || undefined
  });

  // Синхронизация всех фильтров с URL параметрами
  useEffect(() => {
    const newSearch = searchParams.get('search') || '';
    const newWidth = searchParams.get('width') || '';
    const newHeight = searchParams.get('height') || '';
    const newDiameter = searchParams.get('diameter') || '';
    const newSeason = searchParams.get('seasonality') || '';
    const newBrand = searchParams.get('brand') || searchParams.get('manufacturer') || '';
    
    setSearch(newSearch);
    setWidthFilter(newWidth);
    setHeightFilter(newHeight);
    setDiameterFilter(newDiameter);
    setSeasonFilter(newSeason);
    setBrandFilter(newBrand);
  }, [searchParams]);

  // Обработчики
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleProductClick = (product: SupplierProduct) => {
    if (product.product_url) {
      window.open(product.product_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSupplierClick = (product: SupplierProduct) => {
    if (product.supplier?.id) {
          // Показываем информацию о поставщике
    alert(t('forms.clientPages.tireOffers.actions.supplierInfo', {
      name: product.supplier.name,
      id: product.supplier.firm_id,
      priority: product.supplier.priority,
      defaultValue: 'Поставщик: {{name}}\nID: {{id}}\nПриоритет: {{priority}}'
    }));
    }
  };

  // Обработчики модального окна для изображений
  const handleImageClick = (imageUrl: string, alt: string) => {
    setSelectedImage({ url: imageUrl, alt });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // Обработчики модального окна для заказа
  const handleOrderClick = (product: SupplierProduct) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedProduct(null);
  };

  // Обработчики удаления фильтров
  const handleRemoveFilter = (filterType: 'size' | 'brand' | 'season' | 'search') => {
    console.log('Удаление фильтра:', filterType);
    const newParams = new URLSearchParams(searchParams);
    
    switch (filterType) {
      case 'size':
        newParams.delete('size');
        newParams.delete('width');
        newParams.delete('height'); 
        newParams.delete('diameter');
        break;
      case 'brand':
        newParams.delete('brand');
        newParams.delete('manufacturer');
        break;
      case 'season':
        newParams.delete('seasonality');
        break;
      case 'search':
        newParams.delete('search');
        break;
    }
    
    console.log('Новые параметры URL:', newParams.toString());
    setSearchParams(newParams);
    setPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  // Функция для очистки всех фильтров
  const handleClearAllFilters = () => {
    console.log('Очистка всех фильтров');
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

  // Рендер заголовка страницы
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          <LocalOfferIcon sx={{ mr: 2, fontSize: 'inherit', verticalAlign: 'middle' }} />
          {t('forms.clientPages.tireOffers.title', 'Предложения шин')}
        </Typography>
        
        {/* Кнопка чата в правом верхнем углу */}
        <Button
          variant="contained"
          startIcon={<ChatIcon />}
          onClick={() => setChatOpen(true)}
          sx={{
            bgcolor: '#4CAF50',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              bgcolor: '#45A049',
              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Онлайн-консультант
        </Button>
      </Box>
      
      {(tireSize || processedSearch.season || brand || seasonality || processedSearch.search) && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('forms.clientPages.tireOffers.filters.activeFilters', 'Активные фильтры:')}
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<ClearIcon />}
              onClick={handleClearAllFilters}
              sx={{ 
                fontSize: '0.75rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'error.main' }
              }}
            >
              {t('forms.clientPages.tireOffers.filters.clearAll', 'Очистить все')}
            </Button>
          </Box>
          
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {tireSize && (
              <Chip 
                label={`${t('forms.clientPages.tireOffers.filters.size', 'Размер')}: ${tireSize}`} 
                color="primary" 
                variant="filled"
                icon={<CategoryIcon />}
                onDelete={() => handleRemoveFilter('size')}
                deleteIcon={<CloseIcon />}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    fontSize: 18
                  }
                }}
              />
            )}
            {brand && (
              <Chip 
                label={`${t('forms.clientPages.tireOffers.filters.brand', 'Бренд')}: ${brand}`} 
                color="secondary" 
                variant="outlined"
                onDelete={() => handleRemoveFilter('brand')}
                deleteIcon={<CloseIcon />}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    fontSize: 18
                  }
                }}
              />
            )}
            {(processedSearch.season || seasonality) && (
              <Chip 
                label={`${t('forms.clientPages.tireOffers.filters.season', 'Сезон')}: ${
                  processedSearch.season 
                    ? getSeasonLabel(processedSearch.season)
                    : seasonality
                }`} 
                color="info" 
                variant={processedSearch.season ? "filled" : "outlined"}
                icon={processedSearch.season ? <SearchIcon /> : undefined}
                onDelete={() => handleRemoveFilter('season')}
                deleteIcon={<CloseIcon />}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    fontSize: 18
                  }
                }}
              />
            )}
            {processedSearch.search && (
              <Chip 
                label={`${t('forms.clientPages.tireOffers.search.clear', 'Поиск')}: "${processedSearch.search}"`} 
                color="success" 
                variant="outlined"
                icon={<SearchIcon />}
                onDelete={() => handleRemoveFilter('search')}
                deleteIcon={<CloseIcon />}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    fontSize: 18
                  }
                }}
              />
            )}
          </Stack>
        </Box>
      )}
      
      <Typography variant="body1" color="text.secondary">
        {t('forms.clientPages.tireOffers.table.actualOffers', 'Актуальные предложения от проверенных поставщиков')}
      </Typography>
    </Box>
  );

  // Рендер фильтров
  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Основная строка фильтров */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder={t('forms.clientPages.tireOffers.search.placeholder', 'Поиск шин по размеру, бренду, модели...')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 400 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
                      helperText={t('forms.clientPages.tireOffers.filters.searchHelper', 'Используйте пробелы или слеши (/) для поиска по нескольким словам')}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
          }
          label={t('forms.clientPages.tireOffers.filters.inStock', 'Только в наличии')}
        />
        
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('forms.clientPages.tireOffers.filters.sortBy', 'Сортировка')}</InputLabel>
          <Select
            value={sortBy}
            label={t('forms.clientPages.tireOffers.filters.sortBy', 'Сортировка')}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="price_asc">{t('forms.clientPages.tireOffers.sorting.price_asc', 'Цена: по возрастанию')}</MenuItem>
            <MenuItem value="price_desc">{t('forms.clientPages.tireOffers.sorting.price_desc', 'Цена: по убыванию')}</MenuItem>
            <MenuItem value="updated_at">{t('forms.clientPages.tireOffers.sorting.updated_at', 'По дате обновления')}</MenuItem>
            <MenuItem value="supplier_name">{t('forms.clientPages.tireOffers.sorting.supplier_name', 'По поставщику')}</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          onClick={() => {
            setSearch('');
            setPage(1);
          }}
          size="small"
          disabled={!search.trim()}
        >
          {t('forms.clientPages.tireOffers.chips.removeFilter', 'Очистить')}
        </Button>
        
        <Tooltip title={t('forms.clientPages.tireOffers.search.loading', 'Обновить данные')}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Дополнительные фильтры скрыты - поиск улучшен в основной строке */}
    </Paper>
  );

  // Рендер таблицы предложений
  const renderOffersTable = () => {
    if (!offersResponse?.data?.length) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography>
            {t('forms.clientPages.tireOffers.table.noResults', 'По заданным критериям предложения не найдены.')} 
            {t('forms.clientPages.tireOffers.filters.tryChangeFilters', 'Попробуйте изменить фильтры или обратитесь к менеджеру.')}
          </Typography>
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('forms.clientPages.tireOffers.tableHeaders.photo', 'Фото')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.supplier', 'Поставщик')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.product', 'Товар')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.size', 'Размер')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.season', 'Сезон')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.price', 'Цена')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.table.availability', 'Наличие')}</TableCell>
              <TableCell>{t('forms.clientPages.tireOffers.tableHeaders.updated', 'Обновлено')}</TableCell>
              <TableCell align="center">{t('forms.clientPages.tireOffers.table.actions', 'Действия')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offersResponse.data.map((product: SupplierProduct) => (
              <TableRow key={product.id} hover>
                {/* Фото товара */}
                <TableCell>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image_url ? (
                      <Box
                        component="img"
                        src={product.image_url}
                        alt={`${product.brand} ${product.model}`}
                        onClick={() => handleImageClick(product.image_url!, `${product.brand} ${product.model}`)}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.05)',
                            border: '1px solid #1976d2'
                          }
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span style="color: #999; font-size: 12px;">${t('forms.clientPages.tireOffers.availability.noPhoto', 'Нет фото')}</span>`;
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {t('forms.clientPages.tireOffers.availability.noPhoto', 'Нет фото')}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                {/* Поставщик */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <StoreIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.supplier?.name || t('forms.clientPages.tireOffers.table.unknownSupplier', 'Неизвестный поставщик')}
                      </Typography>
                      {product.supplier?.firm_id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {product.supplier.firm_id}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {product.brand} {product.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {product.description.substring(0, 50)}...
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={product.size}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                  {product.load_speed_index && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {product.load_speed_index}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={product.season}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                </TableCell>
                
                <TableCell>
                  {product.price_uah ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {product.price_uah} UAH
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t('forms.clientPages.tireOffers.table.priceOnRequest', 'Цена по запросу')}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={product.in_stock ? t('forms.clientPages.tireOffers.availability.inStock', 'В наличии') : t('forms.clientPages.tireOffers.availability.onOrder', 'Под заказ')}
                    size="small"
                    color={product.in_stock ? 'success' : 'warning'}
                    variant={product.in_stock ? 'filled' : 'outlined'}
                  />
                  {product.stock_status && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {product.stock_status}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(product.updated_at).toLocaleDateString('ru-RU')}
                  </Typography>
                </TableCell>
                
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={t('forms.clientPages.tireOffers.actions.order', 'Заказать товар')}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOrderClick(product)}
                        startIcon={<ShoppingCartIcon />}
                        disabled={!product.in_stock}
                        sx={{ minWidth: 100 }}
                      >
                        Заказать
                      </Button>
                    </Tooltip>
                    
                    {product.product_url && (
                      <Tooltip title={t('forms.clientPages.tireOffers.actions.openWebsite', 'Открыть на сайте поставщика')}>
                        <IconButton
                          size="small"
                          onClick={() => handleProductClick(product)}
                          color="primary"
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title={t('forms.clientPages.tireOffers.actions.productInfo', 'Информация о товаре')}>
                      <IconButton
                        size="small"
                        onClick={() => handleSupplierClick(product)}
                        color="secondary"
                      >
                        <StoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Рендер пагинации
  const renderPagination = () => {
    if (!offersResponse?.meta) return null;
    
    const { total_pages, current_page } = offersResponse.meta;
    
    if (total_pages <= 1) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={total_pages}
          page={current_page}
          onChange={(newPage) => setPage(newPage)}
          color="primary"
          size="large"
        />
      </Box>
    );
  };

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {renderHeader()}
        {renderFilters()}
        
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('forms.clientPages.tireOffers.search.noResults', 'Ошибка загрузки предложений. Попробуйте обновить страницу.')}
          </Alert>
        )}
        
        {renderOffersTable()}
        {renderPagination()}
      </Container>

      {/* Модальное окно для просмотра изображения */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', textAlign: 'center' }}>
          {selectedImage && (
            <>
              <Box
                component="img"
                src={selectedImage.url}
                alt={selectedImage.alt}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
              />
              <IconButton
                onClick={handleCloseImageModal}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.9)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 1, 
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {selectedImage.alt}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно заказа */}
      <OrderModal
        open={orderModalOpen}
        onClose={handleCloseOrderModal}
        product={selectedProduct}
      />

      {/* Чат-консультант */}
      <TireChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initialMessage={tireSize ? `Помогите подобрать шины размера ${tireSize}` : undefined}
      />
    </ClientLayout>
  );
};

export default TireOffersPage;