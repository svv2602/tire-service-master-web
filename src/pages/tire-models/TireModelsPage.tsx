import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Stack,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DonutLarge as TireModelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';

// Временные типы данных (позже заменить на реальные API)
interface TireModel {
  id: number;
  name: string;
  brandId: number;
  brandName: string;
  season: 'summer' | 'winter' | 'all_season';
  category: 'passenger' | 'suv' | 'truck' | 'motorcycle';
  description?: string;
  sizes: string[]; // Доступные размеры
  isActive: boolean;
  createdAt: string;
}

const TireModelsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TireModel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Временные данные (заменить на API)
  const mockModels: TireModel[] = [
    {
      id: 1,
      name: 'Pilot Sport 4',
      brandId: 1,
      brandName: 'Michelin',
      season: 'summer',
      category: 'passenger',
      sizes: ['205/55R16', '225/45R17', '245/40R18'],
      isActive: true,
      createdAt: '2025-01-01',
      description: 'Высокопроизводительная летняя шина'
    },
    {
      id: 2,
      name: 'X-Ice Snow',
      brandId: 1,
      brandName: 'Michelin',
      season: 'winter',
      category: 'passenger',
      sizes: ['195/65R15', '205/55R16', '215/60R16'],
      isActive: true,
      createdAt: '2025-01-01',
      description: 'Зимняя шина с превосходным сцеплением'
    },
    {
      id: 3,
      name: 'PremiumContact 6',
      brandId: 2,
      brandName: 'Continental',
      season: 'summer',
      category: 'passenger',
      sizes: ['205/55R16', '225/50R17', '235/45R18'],
      isActive: true,
      createdAt: '2025-01-01',
      description: 'Комфортная летняя шина'
    },
    {
      id: 4,
      name: 'WinterContact TS 870',
      brandId: 2,
      brandName: 'Continental',
      season: 'winter',
      category: 'passenger',
      sizes: ['185/65R15', '195/65R15', '205/55R16'],
      isActive: true,
      createdAt: '2025-01-01',
      description: 'Зимняя шина нового поколения'
    },
  ];

  const seasonLabels = {
    summer: 'Летние',
    winter: 'Зимние',
    all_season: 'Всесезонные'
  };

  const categoryLabels = {
    passenger: 'Легковые',
    suv: 'Внедорожники',
    truck: 'Грузовые',
    motorcycle: 'Мотоциклетные'
  };

  const filteredModels = mockModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeason = !seasonFilter || model.season === seasonFilter;
    const matchesCategory = !categoryFilter || model.category === categoryFilter;
    const matchesBrand = !brandFilter || model.brandName === brandFilter;

    return matchesSearch && matchesSeason && matchesCategory && matchesBrand;
  });

  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredModels.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + rowsPerPage);

  const uniqueBrands = Array.from(new Set(mockModels.map(m => m.brandName)));

  const handleCreate = () => {
    setSelectedModel(null);
    setDialogOpen(true);
  };

  const handleEdit = (model: TireModel) => {
    setSelectedModel(model);
    setDialogOpen(true);
  };

  const handleDelete = (model: TireModel) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Реализовать сохранение через API
    setDialogOpen(false);
    setSelectedModel(null);
  };

  const handleConfirmDelete = () => {
    // TODO: Реализовать удаление через API
    setDeleteDialogOpen(false);
    setSelectedModel(null);
  };

  const clearFilters = () => {
    setSeasonFilter('');
    setCategoryFilter('');
    setBrandFilter('');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TireModelIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.title}>
            {t('navigation.tireModels', 'Модели шин')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={tablePageStyles.primaryButton}
        >
          Добавить модель
        </Button>
      </Box>

      {/* Фильтры */}
      <Paper sx={tablePageStyles.filtersContainer}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск по названию модели или бренду..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Бренд</InputLabel>
              <Select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                label="Бренд"
              >
                <MenuItem value="">Все бренды</MenuItem>
                {uniqueBrands.map(brand => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Сезон</InputLabel>
              <Select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                label="Сезон"
              >
                <MenuItem value="">Все сезоны</MenuItem>
                <MenuItem value="summer">Летние</MenuItem>
                <MenuItem value="winter">Зимние</MenuItem>
                <MenuItem value="all_season">Всесезонные</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Категория"
              >
                <MenuItem value="">Все категории</MenuItem>
                <MenuItem value="passenger">Легковые</MenuItem>
                <MenuItem value="suv">Внедорожники</MenuItem>
                <MenuItem value="truck">Грузовые</MenuItem>
                <MenuItem value="motorcycle">Мотоциклетные</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
              fullWidth
            >
              Очистить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Уведомление о разработке */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>В разработке:</strong> Эта страница находится в стадии разработки. 
          Функциональность создания, редактирования и удаления моделей шин будет добавлена в следующих обновлениях.
        </Typography>
      </Alert>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Модель</TableCell>
              <TableCell>Бренд</TableCell>
              <TableCell>Сезон</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Размеры</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedModels.map((model) => (
              <TableRow key={model.id} hover>
                <TableCell>
                  <Stack>
                    <Typography variant="body1" fontWeight={600}>
                      {model.name}
                    </Typography>
                    {model.description && (
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {model.brandName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={seasonLabels[model.season]}
                    size="small"
                    color={
                      model.season === 'winter' ? 'info' :
                      model.season === 'summer' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {categoryLabels[model.category]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {model.sizes.slice(0, 2).map((size, index) => (
                      <Chip
                        key={index}
                        label={size}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {model.sizes.length > 2 && (
                      <Chip
                        label={`+${model.sizes.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: model.isActive ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {model.isActive ? 'Активна' : 'Неактивна'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(model)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(model)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={setPage}
          />
        </Box>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedModel ? 'Редактировать модель' : 'Добавить модель'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название модели"
                  variant="outlined"
                  defaultValue={selectedModel?.name || ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Бренд</InputLabel>
                  <Select
                    defaultValue={selectedModel?.brandName || ''}
                    label="Бренд"
                  >
                    {uniqueBrands.map(brand => (
                      <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Сезон</InputLabel>
                  <Select
                    defaultValue={selectedModel?.season || ''}
                    label="Сезон"
                  >
                    <MenuItem value="summer">Летние</MenuItem>
                    <MenuItem value="winter">Зимние</MenuItem>
                    <MenuItem value="all_season">Всесезонные</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    defaultValue={selectedModel?.category || ''}
                    label="Категория"
                  >
                    <MenuItem value="passenger">Легковые</MenuItem>
                    <MenuItem value="suv">Внедорожники</MenuItem>
                    <MenuItem value="truck">Грузовые</MenuItem>
                    <MenuItem value="motorcycle">Мотоциклетные</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  variant="outlined"
                  multiline
                  rows={3}
                  defaultValue={selectedModel?.description || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Доступные размеры"
                  variant="outlined"
                  defaultValue={selectedModel?.sizes.join(', ') || ''}
                  helperText="Введите размеры через запятую (например: 205/55R16, 225/45R17)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedModel ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить модель "{selectedModel?.name}" бренда "{selectedModel?.brandName}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TireModelsPage;