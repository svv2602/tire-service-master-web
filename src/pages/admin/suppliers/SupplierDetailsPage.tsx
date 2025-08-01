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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useGetSupplierByIdQuery,
  useGetSupplierProductsQuery,
  useGetSupplierPriceVersionsQuery,
  type SupplierProduct,
  type SupplierPriceVersion,
} from '../../../api/suppliers.api';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';

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
  }, {
    skip: !supplierId || currentTab !== 1,
  });

  const { 
    data: versionsResponse, 
    isLoading: isLoadingVersions,
    refetch: refetchVersions
  } = useGetSupplierPriceVersionsQuery({
    id: supplierId,
    page: versionsPage,
    per_page: 10,
  }, {
    skip: !supplierId || currentTab !== 2,
  });

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

  if (supplierError || !supplier) {
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
                  <Chip
                    icon={getVersionStatusIcon(supplier.statistics.sync_status)}
                    label={
                      supplier.statistics.sync_status === 'never' ? 'Не синхронизировано' :
                      supplier.statistics.sync_status === 'success' ? 'Успешно' :
                      supplier.statistics.sync_status === 'failed' ? 'Ошибка' :
                      'В процессе'
                    }
                    size="small"
                    color={getVersionStatusColor(supplier.statistics.sync_status)}
                    variant="outlined"
                  />
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
            <Tab label="API ключ" />
            <Tab label={`Товары (${supplier.statistics.products_count})`} />
            <Tab label="История прайсов" />
          </Tabs>

          {/* Вкладка API ключа */}
          <TabPanel value={currentTab} index={0}>
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
                      <IconButton>
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

          {/* Вкладка товаров */}
          <TabPanel value={currentTab} index={1}>
            <Box>
              {/* Фильтры товаров */}
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  placeholder="Поиск товаров..."
                  value={productsSearch}
                  onChange={(e) => setProductsSearch(e.target.value)}
                  size="small"
                  sx={{ minWidth: 300 }}
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
                <IconButton onClick={() => refetchProducts()} disabled={isLoadingProducts}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Загрузка товаров */}
              {isLoadingProducts && <LinearProgress sx={{ mb: 2 }} />}

              {/* Таблица товаров */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell>Размер</TableCell>
                      <TableCell>Сезон</TableCell>
                      <TableCell>Цена</TableCell>
                      <TableCell>Наличие</TableCell>
                      <TableCell>Обновлен</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product: SupplierProduct) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {product.brand} {product.model}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {product.external_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {product.width}/{product.height}R{product.diameter}
                          {product.load_index && product.speed_index && (
                            <> {product.load_index}{product.speed_index}</>
                          )}
                        </TableCell>
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
                        <TableCell>
                          {product.price_uah ? `${parseFloat(product.price_uah).toLocaleString()} грн` : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.in_stock ? 'В наличии' : 'Нет в наличии'}
                            size="small"
                            color={product.in_stock ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDateTime(product.updated_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Пагинация товаров */}
              {productsMeta && productsMeta.total_pages > 1 && (
                <Box sx={tablePageStyles.paginationContainer}>
                  <Button
                    disabled={productsPage <= 1}
                    onClick={() => setProductsPage(productsPage - 1)}
                  >
                    Назад
                  </Button>
                  <Typography variant="body2">
                    Страница {productsPage} из {productsMeta.total_pages}
                  </Typography>
                  <Button
                    disabled={productsPage >= productsMeta.total_pages}
                    onClick={() => setProductsPage(productsPage + 1)}
                  >
                    Далее
                  </Button>
                </Box>
              )}
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
                    {versions.map((version: SupplierPriceVersion) => (
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
                    ))}
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
    </AdminPageWrapper>
  );
};

export default SupplierDetailsPage;