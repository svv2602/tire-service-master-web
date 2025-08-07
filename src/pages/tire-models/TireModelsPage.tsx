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
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as TireModelIcon,
  Search as SearchIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  WbSunny as SummerIcon,
  AcUnit,
  AllInclusive as AllSeasonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';
import { 
  useGetTireModelsQuery,
  useCreateTireModelMutation,
  useUpdateTireModelMutation,
  useDeleteTireModelMutation,
  useToggleTireModelStatusMutation,
  useGetTireSeasonsQuery,
  TireModel,
  TireModelFormData
} from '../../api/tireModels.api';
import { useGetTireBrandsQuery } from '../../api/tireBrands.api';
import Notification from '../../components/Notification';

const TireModelsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');
  const [seasonFilter, setSeasonFilter] = useState<'summer' | 'winter' | 'all_season' | ''>('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingModel, setEditingModel] = useState<TireModel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<TireModel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  
  // Форма
  const [formData, setFormData] = useState<TireModelFormData>({
    name: '',
    tire_brand_id: 0,
    season_type: undefined,
    is_active: true,
    rating_score: 5,
    description: '',
    aliases: []
  });

  const itemsPerPage = 10;

  // API хуки
  const { data: modelsData, isLoading, error, refetch } = useGetTireModelsQuery({
    search: searchTerm,
    brand_id: brandFilter || undefined,
    season: (seasonFilter as 'summer' | 'winter' | 'all_season') || undefined,
    active_only: activeOnly,
    page: currentPage,
    per_page: itemsPerPage
  });

  const { data: brandsData } = useGetTireBrandsQuery({ per_page: 100 });
  const { data: seasonsData } = useGetTireSeasonsQuery();

  const [createModel, { isLoading: isCreating }] = useCreateTireModelMutation();
  const [updateModel, { isLoading: isUpdating }] = useUpdateTireModelMutation();
  const [deleteModel, { isLoading: isDeleting }] = useDeleteTireModelMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleTireModelStatusMutation();

  const models = modelsData?.data || [];
  const pagination = modelsData?.pagination;
  const brands = brandsData?.data || [];
  const seasons = seasonsData?.data || [];

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tire_brand_id: 0,
      season_type: undefined,
      is_active: true,
      rating_score: 5,
      description: '',
      aliases: []
    });
    setEditingModel(null);
  };

  const handleCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleEdit = (model: TireModel) => {
    setFormData({
      name: model.name,
      tire_brand_id: model.tire_brand_id,
      season_type: model.season_type,
      is_active: model.is_active,
      rating_score: model.rating_score,
      description: '',
      aliases: []
    });
    setEditingModel(model);
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingModel) {
        await updateModel({ id: editingModel.id, data: formData }).unwrap();
        showNotification('Модель успешно обновлена', 'success');
      } else {
        await createModel(formData).unwrap();
        showNotification('Модель успешно создана', 'success');
      }
      setOpenModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка', 'error');
    }
  };

  const handleDelete = (model: TireModel) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    
    try {
      await deleteModel(modelToDelete.id).unwrap();
      showNotification('Модель успешно удалена', 'success');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка при удалении', 'error');
    }
  };

  const handleToggleStatus = async (model: TireModel) => {
    try {
      await toggleStatus(model.id).unwrap();
      showNotification(`Модель ${model.is_active ? 'деактивирована' : 'активирована'}`, 'success');
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getSeasonIcon = (seasonType?: string) => {
    switch (seasonType) {
      case 'summer':
        return <SummerIcon sx={{ fontSize: 16, color: 'orange' }} />;
      case 'winter':
        return <AcUnit sx={{ fontSize: 16, color: 'blue' }} />;
      case 'all_season':
        return <AllSeasonIcon sx={{ fontSize: 16, color: 'green' }} />;
      default:
        return null;
    }
  };

  const getSeasonLabel = (seasonType?: string) => {
    switch (seasonType) {
      case 'summer':
        return 'Летние';
      case 'winter':
        return 'Зимние';
      case 'all_season':
        return 'Всесезонные';
      default:
        return '—';
    }
  };

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки данных. Попробуйте обновить страницу.
        </Alert>
      </Box>
    );
  }

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
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            sx={{ flexGrow: 1, minWidth: 300 }}
            variant="outlined"
            placeholder="Поиск по названию модели или бренда..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Бренд</InputLabel>
            <Select
              value={brandFilter}
              label="Бренд"
              onChange={(e) => setBrandFilter(e.target.value as number | '')}
            >
              <MenuItem value="">Все бренды</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Сезон</InputLabel>
            <Select
              value={seasonFilter}
              label="Сезон"
              onChange={(e) => setSeasonFilter(e.target.value as 'summer' | 'winter' | 'all_season' | '')}
            >
              <MenuItem value="">Все</MenuItem>
              {seasons.map((season) => (
                <MenuItem key={season.value} value={season.value}>
                  {season.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={activeOnly ? 'active' : 'all'}
              label="Статус"
              onChange={(e) => setActiveOnly(e.target.value === 'active')}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Модель</TableCell>
              <TableCell>Бренд</TableCell>
              <TableCell>Сезон</TableCell>
              <TableCell>Рейтинг</TableCell>
              <TableCell>Размеры</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Модели шин не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow key={model.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {model.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.tire_brand_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getSeasonIcon(model.season_type)}
                      <Typography variant="body2">
                        {getSeasonLabel(model.season_type)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.rating_score}/10
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.available_sizes.length > 0 
                        ? `${model.available_sizes.length} размеров`
                        : 'Нет данных'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.is_active ? 'Активна' : 'Неактивна'}
                      color={model.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(model.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(model)}
                      disabled={isToggling}
                      sx={{ mr: 1 }}
                      title={model.is_active ? 'Деактивировать' : 'Активировать'}
                    >
                      {model.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(model)}
                      sx={{ mr: 1 }}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(model)}
                      color="error"
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      {pagination && pagination.total_pages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={pagination.total_pages}
            page={pagination.current_page}
            onChange={handlePageChange}
          />
        </Box>
      )}

      {/* Модальное окно создания/редактирования */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingModel ? 'Редактировать модель' : 'Создать модель'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Название модели"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Бренд шин</InputLabel>
              <Select
                value={formData.tire_brand_id || ''}
                label="Бренд шин"
                onChange={(e) => setFormData(prev => ({ ...prev, tire_brand_id: Number(e.target.value) }))}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Сезон</InputLabel>
              <Select
                value={formData.season_type || ''}
                label="Сезон"
                onChange={(e) => setFormData(prev => ({ ...prev, season_type: e.target.value as any }))}
              >
                <MenuItem value="">Не указан</MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season.value} value={season.value}>
                    {season.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Рейтинг (1-10)"
              type="number"
              value={formData.rating_score}
              onChange={(e) => setFormData(prev => ({ ...prev, rating_score: Number(e.target.value) }))}
              inputProps={{ min: 1, max: 10 }}
            />
            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Отменить
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={isCreating || isUpdating || !formData.name.trim() || !formData.tire_brand_id}
          >
            {isCreating || isUpdating ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить модель "{modelToDelete?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отменить
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default TireModelsPage;