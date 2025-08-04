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
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  LocalOffer as LocalOfferIcon,
  Store as StoreIcon,
  Category as CategoryIcon
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
  
  // Извлекаем параметры из URL
  const tireSize = searchParams.get('size') || '';
  const brand = searchParams.get('brand') || '';
  const seasonality = searchParams.get('seasonality') || '';
  
  // API запрос
  const {
    data: offersResponse,
    isLoading,
    error,
    refetch
  } = useGetAllSupplierProductsQuery({
    page,
    per_page: 20,
    search: `${tireSize} ${brand} ${seasonality} ${search}`.trim(),
    in_stock_only: inStockOnly,
    sort_by: sortBy
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
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
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
    </Box>
  );
};

export default TireOffersPage;