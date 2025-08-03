import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Store as StoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetSupplierByIdQuery,
  useGetSupplierProductsQuery,
  useRegenerateSupplierApiKeyMutation,
  // useGetSupplierPriceVersionsQuery, // Временно отключено
  type SupplierProduct,
  type SupplierPriceVersion,
} from '../../../api/suppliers.api';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';
import { Pagination } from '../../../components/ui/Pagination/Pagination';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние страницы
  const [currentTab, setCurrentTab] = useState(0);
  const [productsPage, setProductsPage] = useState(1);
  const [versionsPage, setVersionsPage] = useState(1);
  const [productsSearch, setProductsSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [updatedAfter, setUpdatedAfter] = useState('');
  const [updatedBefore, setUpdatedBefore] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  const supplierId = parseInt(id || '0');

  // API хуки
  const { 
    data: supplierResponse, 
    isLoading: isLoadingSupplier,
    error: supplierError,
    refetch: refetchSupplier
  } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId,
  });

  const { 
    data: productsResponse, 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useGetSupplierProductsQuery({
    id: supplierId,
    page: productsPage,
    per_page: 20,
    in_stock_only: inStockOnly,
    search: productsSearch || undefined,
    updated_after: updatedAfter || undefined,
    updated_before: updatedBefore || undefined,
    sort_by: sortBy !== 'default' ? sortBy : undefined,
  }, {
    skip: !supplierId || currentTab !== 0,
  });

  // Временная заглушка для версий прайсов
  const versionsResponse = { data: [], meta: { current_page: 1, total_pages: 1, total_count: 0, per_page: 10 } };
  const isLoadingVersions = false;
  const refetchVersions = () => {};

  const supplier = supplierResponse?.supplier;
  const products = productsResponse?.data || [];
  const productsMeta = productsResponse?.meta;
  const versions = versionsResponse?.data || [];
  const versionsMeta = versionsResponse?.meta;

  // Обработчики событий
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'processing': return 'warning';
      default: return 'default';
    }
  };

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case 'never': return 'Не синхронизировано';
      case 'recent': return 'Недавно (< 1 часа)';
      case 'today': return 'Сегодня';
      case 'week': return 'На этой неделе';
      case 'old': return 'Давно (> 1 недели)';
      default: return 'Неизвестно';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'never': return 'default';
      case 'recent': return 'success';
      case 'today': return 'success';
      case 'week': return 'warning';
      case 'old': return 'error';
      default: return 'default';
    }
  };

  const getSyncStatusTooltip = (status: string) => {
    switch (status) {
      case 'never': return 'Прайс-лист еще не загружался';
      case 'recent': return 'Данные обновлены в течение последнего часа';
      case 'today': return 'Данные обновлены сегодня';
      case 'week': return 'Данные обновлены на этой неделе';
      case 'old': return 'Данные устарели (обновлены более недели назад)';
      default: return 'Статус синхронизации неизвестен';
    }
  };

  const handleImageClick = (imageUrl: string, alt: string) => {
    setSelectedImage({ url: imageUrl, alt });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // Функции для работы с фильтрами
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setProductsPage(1); // Сбрасываем на первую страницу
  };

  const handleClearFilters = () => {
    setProductsSearch('');
    setInStockOnly(false);
    setUpdatedAfter('');
    setUpdatedBefore('');
    setSortBy('default');
    setProductsPage(1);
  };

  const hasActiveFilters = productsSearch || inStockOnly || updatedAfter || updatedBefore || sortBy !== 'default';

  // API мутации
  const [regenerateApiKey, { isLoading: isRegeneratingApiKey }] = useRegenerateSupplierApiKeyMutation();

  // Обработчик регенерации API ключа
  const handleRegenerateApiKey = async () => {
    if (window.confirm('Вы уверены, что хотите регенерировать API ключ? Старый ключ станет недействительным.')) {
      try {
        await regenerateApiKey(supplierId).unwrap();
        // Обновляем данные поставщика для получения нового ключа
        refetchSupplier();
      } catch (error) {
        console.error('Ошибка регенерации API ключа:', error);
      }
    }
  };

  const getVersionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'failed': return <ErrorIcon fontSize="small" />;
      case 'processing': return <ScheduleIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  if (isLoadingSupplier) {
    return (
      <AdminPageWrapper>
        <Box sx={tablePageStyles.pageContainer}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Загрузка информации о поставщике...</Typography>
        </Box>
      </AdminPageWrapper>
    );
  }

  if (supplierError || !supplier || !supplier.statistics) {
    return (
      <AdminPageWrapper>
        <Box sx={tablePageStyles.pageContainer}>
          <Alert severity="error">
            Поставщик не найден или произошла ошибка при загрузке
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/suppliers')}
            sx={{ mt: 2 }}
          >
            Назад к списку
          </Button>
        </Box>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок страницы */}
        <Box sx={tablePageStyles.headerContainer}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/suppliers')}
              sx={{ mb: 1 }}
            >
              Назад к списку
            </Button>
            <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
              <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {supplier.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Firm ID: {supplier.firm_id} | Приоритет: {supplier.priority}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/admin/suppliers/${supplier.id}/edit`)}
            >
              Редактировать
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => navigate(`/admin/suppliers/${supplier.id}/upload`)}
            >
              Загрузить прайс
            </Button>
          </Box>
        </Box>

        {/* Основная информация */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Статус
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Chip
                    label={supplier.is_active ? 'Активен' : 'Неактивен'}
                    color={supplier.is_active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Создан: {formatDateTime(supplier.created_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обновлен: {formatDateTime(supplier.updated_at)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Статистика товаров
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="between">
                    <Typography variant="body2">Всего товаров:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {supplier.statistics.products_count}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="between">
                    <Typography variant="body2">В наличии:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {supplier.statistics.in_stock_products_count}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Синхронизация
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Tooltip title={getSyncStatusTooltip(supplier.statistics.sync_status)} placement="top">
                    <Chip
                      label={getSyncStatusText(supplier.statistics.sync_status)}
                      size="small"
                      color={getSyncStatusColor(supplier.statistics.sync_status)}
                      variant="outlined"
                    />
                  </Tooltip>
                </Box>
                {supplier.statistics.last_sync_ago && (
                  <Typography variant="body2" color="text.secondary">
                    {supplier.statistics.last_sync_ago}
                  </Typography>
                )}
                {supplier.statistics.last_version && (
                  <Typography variant="body2" color="text.secondary">
                    Версия: {supplier.statistics.last_version}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Вкладки */}
        <Paper sx={{ width: '100%' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="supplier tabs">
            <Tab label={`Товары (${supplier.statistics.products_count})`} />
            <Tab label="API ключ" />
            <Tab label="История прайсов" />
          </Tabs>

          {/* Вкладка товаров */}
          <TabPanel value={currentTab} index={0}>
            <Box>
              {/* Фильтры товаров */}
              <Box sx={{ mb: 2 }}>
                {/* Первая строка фильтров */}
                <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
                  <TextField
                    placeholder="Поиск по названию, бренду, модели, ID..."
                    value={productsSearch}
                    onChange={(e) => setProductsSearch(e.target.value)}
                    size="small"
                    sx={{ minWidth: 300, flexGrow: 1 }}
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
                      onChange={handleSortChange}
                    >
                      <MenuItem value="default">По умолчанию</MenuItem>
                      <MenuItem value="updated_at">По дате обновления</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton onClick={() => refetchProducts()} disabled={isLoadingProducts}>
                    <RefreshIcon />
                  </IconButton>
                </Box>

                {/* Вторая строка фильтров - фильтры по дате */}
                <Box display="flex" gap={2} mb={1} flexWrap="wrap" alignItems="center">
                  <TextField
                    label="Обновлено после"
                    type="date"
                    value={updatedAfter}
                    onChange={(e) => setUpdatedAfter(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="Обновлено до"
                    type="date"
                    value={updatedBefore}
                    onChange={(e) => setUpdatedBefore(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearFilters}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Сбросить фильтры
                    </Button>
                  )}
                </Box>

                {/* Индикатор активных фильтров */}
                {hasActiveFilters && (
                  <Alert severity="info" sx={{ py: 0.5 }}>
                    <Typography variant="caption">
                      Применены фильтры: {[
                        productsSearch && 'поиск',
                        inStockOnly && 'только в наличии',
                        updatedAfter && 'обновлено после',
                        updatedBefore && 'обновлено до',
                        sortBy !== 'default' && 'сортировка'
                      ].filter(Boolean).join(', ')}
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Загрузка товаров */}
              {isLoadingProducts && <LinearProgress sx={{ mb: 2 }} />}

              {/* Таблица товаров */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Фото</TableCell>
                      <TableCell>Товар</TableCell>
                      <TableCell>Размер</TableCell>
                      <TableCell>Индексы</TableCell>
                      <TableCell>Сезон</TableCell>
                      <TableCell>Цена</TableCell>
                      <TableCell>Страна</TableCell>
                      <TableCell>Год</TableCell>
                      <TableCell>Наличие</TableCell>
                      <TableCell>Обновлен</TableCell>
                      <TableCell>URL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product: SupplierProduct) => (
                      <TableRow key={product.id}>
                        {/* Фото */}
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
                        
                        {/* Товар */}
                        <TableCell>
                          <Box>
                            <Tooltip title={product.description || product.name || 'Описание отсутствует'} placement="top">
                              <Typography variant="body2" fontWeight="bold">
                                {product.brand} {product.model}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" display="block">
                              ID: {product.external_id}
                            </Typography>
                            {product.description && (
                              <Typography variant="caption" color="text.secondary" 
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  maxWidth: '200px'
                                }}
                              >
                                {product.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        
                        {/* Размер */}
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {product.size || `${product.width}/${product.height}R${product.diameter}`}
                          </Typography>
                        </TableCell>
                        
                        {/* Индексы */}
                        <TableCell>
                          {(product.load_index || product.speed_index) ? (
                            <Chip
                              label={`${product.load_index || '—'}${product.speed_index || '—'}`}
                              size="small"
                              variant="filled"
                              color="primary"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        
                        {/* Сезон */}
                        <TableCell>
                          <Chip
                            label={
                              product.season === 'winter' ? 'Зимние' :
                              product.season === 'summer' ? 'Летние' :
                              'Всесезонные'
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        {/* Цена */}
                        <TableCell>
                          {product.price_uah ? `${parseFloat(product.price_uah).toLocaleString()} грн` : '—'}
                        </TableCell>
                        
                        {/* Страна */}
                        <TableCell>
                          <Typography variant="body2">
                            {product.country || '—'}
                          </Typography>
                        </TableCell>
                        
                        {/* Год */}
                        <TableCell>
                          <Typography variant="body2">
                            {product.year_week || '—'}
                          </Typography>
                        </TableCell>
                        
                        {/* Наличие */}
                        <TableCell>
                          <Chip
                            label={product.in_stock ? 'В наличии' : 'Нет в наличии'}
                            size="small"
                            color={product.in_stock ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        
                        {/* Обновлен */}
                        <TableCell>
                          <Typography variant="caption">
                            {formatDateTime(product.updated_at)}
                          </Typography>
                        </TableCell>
                        
                        {/* URL */}
                        <TableCell>
                          {product.product_url ? (
                            <Button
                              variant="outlined"
                              size="small"
                              href={product.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              Перейти
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Пагинация товаров */}
              {products.length > 0 && productsMeta && productsMeta.total_pages > 1 && !isLoadingProducts && (
                <Box sx={tablePageStyles.paginationContainer}>
                  <Pagination
                    count={productsMeta.total_pages}
                    page={productsPage}
                    onChange={(newPage) => setProductsPage(newPage)}
                    disabled={isLoadingProducts}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Вкладка API ключа */}
          <TabPanel value={currentTab} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom>
                API ключ для загрузки прайсов
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Используйте этот ключ для автоматической загрузки прайсов через API
              </Alert>
              <TextField
                fullWidth
                label="API Key"
                value={supplier.api_key}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title="Регенерировать ключ">
                      <IconButton onClick={handleRegenerateApiKey} disabled={isRegeneratingApiKey}>
                        <KeyIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Endpoint для загрузки: POST /api/v1/suppliers/upload_price
              </Typography>
            </Box>
          </TabPanel>

          {/* Вкладка истории прайсов */}
          <TabPanel value={currentTab} index={2}>
            <Box>
              <Box display="flex" justify-content="between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  История загрузок прайсов
                </Typography>
                <IconButton onClick={() => refetchVersions()} disabled={isLoadingVersions}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Загрузка версий */}
              {isLoadingVersions && <LinearProgress sx={{ mb: 2 }} />}

              {/* Таблица версий */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Версия</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Товары</TableCell>
                      <TableCell>Время обработки</TableCell>
                      <TableCell>Загружено</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            История загрузок прайсов пуста
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Загрузите первый прайс-лист через вкладку "API ключ" или страницу загрузки
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      versions.map((version: SupplierPriceVersion) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {version.version}
                          </Typography>
                          {version.file_checksum && (
                            <Typography variant="caption" color="text.secondary">
                              Checksum: {version.file_checksum.substring(0, 8)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getVersionStatusIcon(version.status)}
                            label={
                              version.status === 'completed' ? 'Завершено' :
                              version.status === 'failed' ? 'Ошибка' :
                              'Обработка'
                            }
                            size="small"
                            color={getVersionStatusColor(version.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {version.processed_count} из {version.products_count}
                            </Typography>
                            {version.errors_count > 0 && (
                              <Typography variant="caption" color="error">
                                Ошибок: {version.errors_count}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {version.processing_time_seconds 
                            ? `${version.processing_time_seconds.toFixed(2)}s` 
                            : '—'
                          }
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDateTime(version.uploaded_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Просмотреть детали">
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Пагинация версий */}
              {versionsMeta && versionsMeta.total_pages > 1 && (
                <Box sx={tablePageStyles.paginationContainer}>
                  <Button
                    disabled={versionsPage <= 1}
                    onClick={() => setVersionsPage(versionsPage - 1)}
                  >
                    Назад
                  </Button>
                  <Typography variant="body2">
                    Страница {versionsPage} из {versionsMeta.total_pages}
                  </Typography>
                  <Button
                    disabled={versionsPage >= versionsMeta.total_pages}
                    onClick={() => setVersionsPage(versionsPage + 1)}
                  >
                    Далее
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
        </Paper>
      </Box>

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
    </AdminPageWrapper>
  );
};

export default SupplierDetailsPage;