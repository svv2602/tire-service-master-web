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
  Grid,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  FlagOutlined as CountryIcon,
  LocalCarWash as BrandIcon,
  DirectionsCar as ModelIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';
import { Pagination } from '../../../components/ui';
import {
  useGetTopUnprocessedQuery,
  useGetUnprocessedProductsQuery,
} from '../../../api/normalization.api';

interface ProblematicItem {
  name: string;
  count: number;
  examples?: string[];
  suggested_aliases?: string[];
  similarity_score?: number;
  suppliers?: Array<{
    name: string;
    count: number;
  }>;
}

interface DetailedProblematicData {
  countries: ProblematicItem[];
  brands: ProblematicItem[];
  models: ProblematicItem[];
  total_counts: {
    countries: number;
    brands: number;
    models: number;
  };
}

const ProblematicDataAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние
  const [selectedCategory, setSelectedCategory] = useState<'countries' | 'brands' | 'models'>('countries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProblematicItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aliasDialogOpen, setAliasDialogOpen] = useState(false);
  const [newAlias, setNewAlias] = useState('');

  // API хуки для получения топ проблемных записей
  const { data: countriesData } = useGetTopUnprocessedQuery({
    type: 'countries',
    limit: 20,
  });

  const { data: brandsData } = useGetTopUnprocessedQuery({
    type: 'brands',
    limit: 20,
  });

  const { data: modelsData } = useGetTopUnprocessedQuery({
    type: 'models',
    limit: 20,
  });

  // Получение товаров для выбранного проблемного элемента
  const {
    data: problematicProductsData,
    isLoading: isLoadingProducts,
  } = useGetUnprocessedProductsQuery({
    page: 1,
    per_page: 50,
    missing_type: selectedCategory === 'countries' ? 'country' : selectedCategory === 'brands' ? 'brand' : 'model',
    search: selectedItem?.name,
  }, {
    skip: !selectedItem,
  });

  // Форматирование данных
  const getCurrentData = () => {
    switch (selectedCategory) {
      case 'countries':
        return countriesData?.data || [];
      case 'brands':
        return brandsData?.data || [];
      case 'models':
        return modelsData?.data || [];
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    const data = getCurrentData();
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'countries':
        return <CountryIcon />;
      case 'brands':
        return <BrandIcon />;
      case 'models':
        return <ModelIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'countries':
        return 'info';
      case 'brands':
        return 'warning';
      case 'models':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleItemClick = (item: ProblematicItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleAddAlias = () => {
    setAliasDialogOpen(true);
  };

  const handleSaveAlias = () => {
    // Здесь будет логика сохранения алиаса
    console.log('Добавить алиас:', newAlias, 'для', selectedItem?.name);
    setNewAlias('');
    setAliasDialogOpen(false);
  };

  const getProblemSeverity = (count: number) => {
    if (count >= 100) return { severity: 'error' as const, label: 'Критично' };
    if (count >= 50) return { severity: 'warning' as const, label: 'Важно' };
    if (count >= 10) return { severity: 'info' as const, label: 'Внимание' };
    return { severity: 'success' as const, label: 'Незначительно' };
  };

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок и кнопка назад */}
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/normalization')}
            sx={{ mr: 2 }}
          >
            Назад к мониторингу
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              🔍 Анализ проблемных данных
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Детальный анализ некорректных названий стран, брендов и моделей
            </Typography>
          </Box>
        </Box>

        {/* Инструкция */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Как использовать эту страницу:</strong>
          </Typography>
          <Typography variant="body2">
            1. Выберите категорию (Страны/Бренды/Модели)<br/>
            2. Просмотрите список проблемных записей с количеством товаров<br/>
            3. Кликните на запись для просмотра конкретных товаров<br/>
            4. При необходимости добавьте алиас для исправления проблемы
          </Typography>
        </Alert>

        {/* Переключатель категорий */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Категория данных</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Категория данных"
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                  >
                    <MenuItem value="countries">
                      <Box display="flex" alignItems="center">
                        <CountryIcon sx={{ mr: 1 }} />
                        Проблемные страны
                      </Box>
                    </MenuItem>
                    <MenuItem value="brands">
                      <Box display="flex" alignItems="center">
                        <BrandIcon sx={{ mr: 1 }} />
                        Проблемные бренды
                      </Box>
                    </MenuItem>
                    <MenuItem value="models">
                      <Box display="flex" alignItems="center">
                        <ModelIcon sx={{ mr: 1 }} />
                        Проблемные модели
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Поиск по ${selectedCategory === 'countries' ? 'странам' : selectedCategory === 'brands' ? 'брендам' : 'моделям'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                >
                  Обновить
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CountryIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Страны</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {countriesData?.data?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  проблемных записей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <BrandIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Бренды</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {brandsData?.data?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  проблемных записей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ModelIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6">Модели</Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {modelsData?.data?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  проблемных записей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Таблица проблемных данных */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
              <Typography variant="h6">
                {getCategoryIcon(selectedCategory)}
                <Box component="span" sx={{ ml: 1 }}>
                  Проблемные {selectedCategory === 'countries' ? 'страны' : selectedCategory === 'brands' ? 'бренды' : 'модели'}
                </Box>
              </Typography>
              <Chip
                label={`Найдено: ${getFilteredData().length}`}
                color={getCategoryColor(selectedCategory) as any}
                variant="outlined"
              />
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Проблемное название</strong></TableCell>
                    <TableCell><strong>Количество товаров</strong></TableCell>
                    <TableCell><strong>Основные поставщики</strong></TableCell>
                    <TableCell><strong>Серьезность проблемы</strong></TableCell>
                    <TableCell><strong>Действия</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData().length > 0 ? (
                    getFilteredData().map((item, index) => {
                      const severity = getProblemSeverity(item.count);
                      return (
                        <TableRow key={`${item.name || 'empty'}-${index}`} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {!item.name || item.name.trim() === '' ? (
                                <Box component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                  (пустая строка)
                                </Box>
                              ) : (
                                `"${item.name}"`
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Оригинальное название из прайсов
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Typography variant="h6" sx={{ mr: 1 }}>
                                {item.count.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                товаров
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {item.suppliers ? (
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {item.suppliers.slice(0, 3).map((supplier: { name: string; count: number; id: number }, idx: number) => (
                                    <Chip
                                      key={idx}
                                      label={`${supplier.name} (${supplier.count})`}
                                      size="small"
                                      variant="outlined"
                                      color="default"
                                    />
                                  ))}
                                  {item.suppliers.length > 3 && (
                                    <Chip
                                      label={`+${item.suppliers.length - 3} еще`}
                                      size="small"
                                      variant="outlined"
                                      color="default"
                                    />
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Загрузка...
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={severity.label}
                              size="small"
                              color={severity.severity}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Посмотреть товары">
                                <IconButton
                                  size="small"
                                  onClick={() => handleItemClick(item)}
                                  color="primary"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Добавить алиас">
                                <IconButton
                                  size="small"
                                  onClick={handleAddAlias}
                                  color="success"
                                >
                                  <AddIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                          <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                          <Typography variant="h6" color="success.main">
                            Отлично! Нет проблемных {selectedCategory === 'countries' ? 'стран' : selectedCategory === 'brands' ? 'брендов' : 'моделей'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Все данные в этой категории корректно нормализованы
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Диалог просмотра товаров */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {getCategoryIcon(selectedCategory)}
            <Box sx={{ ml: 1 }}>
              Товары с проблемным {selectedCategory === 'countries' ? 'названием страны' : selectedCategory === 'brands' ? 'брендом' : 'моделью'}: {
                !selectedItem?.name || selectedItem.name.trim() === '' ? (
                  <Box component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    (пустая строка)
                  </Box>
                ) : (
                  `"${selectedItem.name}"`
                )
              }
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isLoadingProducts ? (
            <Box py={4}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Загрузка товаров...
              </Typography>
            </Box>
          ) : problematicProductsData?.data?.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell>Размер</TableCell>
                    <TableCell>Оригинальные данные</TableCell>
                    <TableCell>Поставщик</TableCell>
                    <TableCell>Цена</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {problematicProductsData.data.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {product.external_id || product.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {product.size_designation}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Бренд:</strong> "{product.original_brand}"
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Модель:</strong> "{product.original_model}"
                          </Typography>
                          <Typography variant="body2">
                            <strong>Страна:</strong> "{product.original_country}"
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.supplier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Поставщик #{product.supplier.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.price_uah?.toLocaleString() || '—'} грн
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Товары с этим названием не найдены или уже нормализованы
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Закрыть
          </Button>
          <Button
            variant="contained"
            onClick={handleAddAlias}
            startIcon={<AddIcon />}
          >
            Добавить алиас для исправления
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления алиаса */}
      <Dialog
        open={aliasDialogOpen}
        onClose={() => setAliasDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Добавить алиас для "{selectedItem?.name || '(пустая строка)'}"
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Алиас поможет системе правильно распознать это название в будущем
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Правильное название"
            fullWidth
            variant="outlined"
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            placeholder={`Введите корректное название ${selectedCategory === 'countries' ? 'страны' : selectedCategory === 'brands' ? 'бренда' : 'модели'}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAliasDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAlias}
            disabled={!newAlias.trim()}
          >
            Сохранить алиас
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  );
};

export default ProblematicDataAnalysisPage;