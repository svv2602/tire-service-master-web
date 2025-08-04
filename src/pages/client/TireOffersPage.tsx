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
  DialogContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  LocalOffer as LocalOfferIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/ui/Pagination/Pagination';
import { useGetAllSupplierProductsQuery, SupplierProduct } from '../../api/suppliers.api';

const TireOffersPage: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  
  // Извлекаем параметры из URL
  const tireSize = searchParams.get('size') || '';
  const brand = searchParams.get('brand') || '';
  const seasonality = searchParams.get('seasonality') || '';
  const manufacturer = searchParams.get('manufacturer') || '';

  // Автоматически извлекаем размеры из параметра size при загрузке
  useEffect(() => {
    if (tireSize && !widthFilter && !heightFilter && !diameterFilter) {
      // Парсим размер вида "225/60R16"
      const sizeMatch = tireSize.match(/^(\d+)\/(\d+)R(\d+)$/);
      if (sizeMatch) {
        const [, width, height, diameter] = sizeMatch;
        setWidthFilter(width);
        setHeightFilter(height);
        setDiameterFilter(diameter);
      }
    }
  }, [tireSize, widthFilter, heightFilter, diameterFilter]);

  // Синхронизируем фильтры с URL параметрами
  useEffect(() => {
    if (seasonality && !seasonFilter) {
      setSeasonFilter(seasonality);
    }
    if ((brand || manufacturer) && !brandFilter) {
      setBrandFilter(brand || manufacturer);
    }
  }, [seasonality, brand, manufacturer, seasonFilter, brandFilter]);
  
  // API запрос с расширенными фильтрами
  const {
    data: offersResponse,
    isLoading,
    error,
    refetch
  } = useGetAllSupplierProductsQuery({
    page,
    per_page: 20,
    search: search.trim(),
    in_stock_only: inStockOnly,
    sort_by: sortBy,
    // Добавляем дополнительные параметры фильтрации
    width: widthFilter ? parseInt(widthFilter) : undefined,
    height: heightFilter ? parseInt(heightFilter) : undefined,
    diameter: diameterFilter || undefined,
    season: seasonFilter || undefined,
    brand: brandFilter || undefined
  });

  // Обновление поиска при изменении параметров URL
  useEffect(() => {
    const newSearch = searchParams.get('search') || '';
    setSearch(newSearch);
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
      alert(`Поставщик: ${product.supplier.name}\nID: ${product.supplier.firm_id}\nПриоритет: ${product.supplier.priority}`);
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

  // Рендер заголовка страницы
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        <LocalOfferIcon sx={{ mr: 2, fontSize: 'inherit', verticalAlign: 'middle' }} />
        Предложения шин
      </Typography>
      
      {tireSize && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label={`Размер: ${tireSize}`} 
            color="primary" 
            variant="filled"
            icon={<CategoryIcon />}
          />
          {brand && (
            <Chip 
              label={`Бренд: ${brand}`} 
              color="secondary" 
              variant="outlined"
            />
          )}
          {seasonality && (
            <Chip 
              label={`Сезон: ${seasonality}`} 
              color="info" 
              variant="outlined"
            />
          )}
        </Stack>
      )}
      
      <Typography variant="body1" color="text.secondary">
        Актуальные предложения от проверенных поставщиков
      </Typography>
    </Box>
  );

  // Рендер фильтров
  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Основная строка фильтров */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="Дополнительный поиск по названию, бренду..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
          }
          label="Только в наличии"
        />
        
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={sortBy}
            label="Сортировка"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
            <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
            <MenuItem value="updated_at">По дате обновления</MenuItem>
            <MenuItem value="supplier_name">По поставщику</MenuItem>
          </Select>
        </FormControl>
        
        <Tooltip title="Обновить данные">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Дополнительные фильтры */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          label="Ширина"
          placeholder="225"
          value={widthFilter}
          onChange={(e) => setWidthFilter(e.target.value)}
          size="small"
          sx={{ width: 100 }}
          type="number"
        />
        
        <TextField
          label="Высота"
          placeholder="60"
          value={heightFilter}
          onChange={(e) => setHeightFilter(e.target.value)}
          size="small"
          sx={{ width: 100 }}
          type="number"
        />
        
        <TextField
          label="Диаметр"
          placeholder="16"
          value={diameterFilter}
          onChange={(e) => setDiameterFilter(e.target.value)}
          size="small"
          sx={{ width: 100 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Сезонность</InputLabel>
          <Select
            value={seasonFilter}
            label="Сезонность"
            onChange={(e) => setSeasonFilter(e.target.value)}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="зимние">Зимние</MenuItem>
            <MenuItem value="летние">Летние</MenuItem>
            <MenuItem value="всесезонные">Всесезонные</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Бренд"
          placeholder="Michelin, Continental..."
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        />
        
        <Button
          variant="outlined"
          onClick={() => {
            setWidthFilter('');
            setHeightFilter('');
            setDiameterFilter('');
            setSeasonFilter('');
            setBrandFilter('');
            setSearch('');
            setPage(1);
          }}
          size="small"
        >
          Сбросить
        </Button>
      </Stack>
    </Paper>
  );

  // Рендер таблицы предложений
  const renderOffersTable = () => {
    if (!offersResponse?.data?.length) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography>
            По заданным критериям предложения не найдены. 
            Попробуйте изменить фильтры или обратитесь к менеджеру.
          </Typography>
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Фото</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell>Сезон</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Наличие</TableCell>
              <TableCell>Обновлено</TableCell>
              <TableCell align="center">Действия</TableCell>
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
                          e.currentTarget.parentElement!.innerHTML = '<span style="color: #999; font-size: 12px;">Нет фото</span>';
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        Нет фото
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
                        {product.supplier?.name || 'Неизвестный поставщик'}
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
                      Цена по запросу
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={product.in_stock ? 'В наличии' : 'Под заказ'}
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
                    {product.product_url && (
                      <Tooltip title="Открыть на сайте поставщика">
                        <IconButton
                          size="small"
                          onClick={() => handleProductClick(product)}
                          color="primary"
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Информация о товаре">
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {renderHeader()}
      {renderFilters()}
      
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки предложений. Попробуйте обновить страницу.
        </Alert>
      )}
      
      {renderOffersTable()}
      {renderPagination()}

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
    </Box>
  );
};

export default TireOffersPage;