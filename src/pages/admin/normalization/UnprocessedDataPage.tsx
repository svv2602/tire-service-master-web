import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Checkbox,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';
import { Pagination } from '../../../components/ui';
import {
  useGetUnprocessedProductsQuery,
  useGetTopUnprocessedQuery,
  useRunNormalizationMutation,
  UnprocessedProduct,
} from '../../../api/normalization.api';

const UnprocessedDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние фильтров и поиска
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [missingType, setMissingType] = useState<'brand' | 'country' | 'model' | 'score'>('brand');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // API хуки
  const {
    data: unprocessedData,
    isLoading,
    refetch,
  } = useGetUnprocessedProductsQuery({
    page,
    per_page: perPage,
    missing_type: missingType,
    search: searchTerm || undefined,
  });

  const { data: topUnprocessedData } = useGetTopUnprocessedQuery({
    type: missingType === 'brand' ? 'brands' : missingType === 'country' ? 'countries' : 'models',
    limit: 5,
  });

  const [runNormalization, { isLoading: isNormalizing }] = useRunNormalizationMutation();

  // Обработчики событий
  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    refetch();
  };

  const handleTypeChange = (newType: 'brand' | 'country' | 'model' | 'score') => {
    setMissingType(newType);
    setPage(1);
    setSelectedProductIds([]);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (!unprocessedData?.data) return;
    
    const allIds = unprocessedData.data.map(product => product.id);
    setSelectedProductIds(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  };

  const handleRunNormalization = async (productIds?: number[]) => {
    try {
      const result = await runNormalization({
        product_ids: productIds?.length ? productIds : undefined,
      }).unwrap();

      if (result.success) {
        setSelectedProductIds([]);
        refetch();
      }
    } catch (error) {
      console.error('Ошибка нормализации:', error);
    }
  };

  // Вспомогательные функции
  const getMissingTypeLabel = (type: string) => {
    switch (type) {
      case 'brand': return 'Бренды';
      case 'country': return 'Страны';
      case 'model': return 'Модели';
      case 'score': return 'Рейтинги';
      default: return type;
    }
  };

  const getMissingFieldsChips = (missingFields: string[]) => {
    return missingFields.map(field => (
      <Chip
        key={field}
        label={getMissingTypeLabel(field)}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ mr: 0.5 }}
      />
    ));
  };

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок страницы */}
        <Box sx={tablePageStyles.headerContainer}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/normalization')}
              sx={{ mb: 1 }}
            >
              Назад к мониторингу
            </Button>
            <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
              Ненормализованные данные
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Товары без привязки к справочникам - требуют внимания
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Обновить
            </Button>
            {selectedProductIds.length > 0 && (
              <Button
                variant="contained"
                startIcon={<RunIcon />}
                onClick={() => handleRunNormalization(selectedProductIds)}
                disabled={isNormalizing}
                color="primary"
              >
                Нормализовать выбранные ({selectedProductIds.length})
              </Button>
            )}
          </Box>
        </Box>

        {/* Фильтры и поиск */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип отсутствующих данных</InputLabel>
                  <Select
                    value={missingType}
                    label="Тип отсутствующих данных"
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                  >
                    <MenuItem value="brand">Без брендов</MenuItem>
                    <MenuItem value="country">Без стран</MenuItem>
                    <MenuItem value="model">Без моделей</MenuItem>
                    <MenuItem value="score">Без рейтингов</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Поиск по названию, бренду или модели..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <Box display="flex" gap={0.5}>
                        {searchTerm && (
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={handleSearch}>
                          <SearchIcon />
                        </IconButton>
                      </Box>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RunIcon />}
                  onClick={() => handleRunNormalization()}
                  disabled={isNormalizing}
                  color="warning"
                >
                  Нормализовать все
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Топ проблемных записей */}
        {topUnprocessedData && topUnprocessedData.data.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Топ-5 наиболее проблемных {getMissingTypeLabel(missingType).toLowerCase()}:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {topUnprocessedData.data.map((item, index) => (
                <Chip
                  key={`${item.name}-${index}`}
                  label={`${item.name} (${item.count})`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Box>
          </Alert>
        )}

        {/* Прогресс нормализации */}
        {isNormalizing && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RunIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Выполняется нормализация...
                </Typography>
              </Box>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Пожалуйста, подождите. Процесс может занять некоторое время.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Таблица ненормализованных товаров */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={unprocessedData?.data ? selectedProductIds.length === unprocessedData.data.length : false}
                      indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < (unprocessedData?.data?.length || 0)}
                      onChange={handleSelectAll}
                      disabled={!unprocessedData?.data?.length}
                    />
                  </TableCell>
                  <TableCell>Товар</TableCell>
                  <TableCell>Оригинальные данные</TableCell>
                  <TableCell>Размер</TableCell>
                  <TableCell>Сезон</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Отсутствует</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : unprocessedData?.data?.length ? (
                  unprocessedData.data.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {product.external_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>Бренд:</strong> {product.original_brand}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Модель:</strong> {product.original_model}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Страна:</strong> {product.original_country}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {product.size_designation}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.season}
                          size="small"
                          color={product.season === 'winter' ? 'info' : product.season === 'summer' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {product.price_uah ? (
                          <Typography variant="body2">
                            {product.price_uah.toLocaleString()} грн
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не указана
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.supplier.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {getMissingFieldsChips(product.missing_fields)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                        <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" color="success.main">
                          Отлично! Нет товаров без {getMissingTypeLabel(missingType).toLowerCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Все товары в этой категории успешно нормализованы
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Пагинация */}
          {unprocessedData?.meta && unprocessedData.meta.total_pages > 1 && (
            <Box sx={tablePageStyles.paginationContainer}>
              <Pagination
                count={unprocessedData.meta.total_pages}
                page={page}
                onChange={(newPage) => setPage(newPage)}
                disabled={isLoading}
              />
            </Box>
          )}
        </Card>

        {/* Информация о статистике */}
        {unprocessedData?.meta && (
          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Показано {unprocessedData.data.length} из {unprocessedData.meta.total_count} товаров без {getMissingTypeLabel(missingType).toLowerCase()}
            </Typography>
          </Box>
        )}
      </Box>
    </AdminPageWrapper>
  );
};

export default UnprocessedDataPage;