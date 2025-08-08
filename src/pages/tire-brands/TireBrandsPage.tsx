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
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as TireBrandIcon,
  Search as SearchIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';
import { 
  useGetTireBrandsQuery,
  useCreateTireBrandMutation,
  useUpdateTireBrandMutation,
  useDeleteTireBrandMutation,
  useToggleTireBrandStatusMutation,
  TireBrand,
  TireBrandFormData
} from '../../api/tireBrands.api';
import { useGetCountriesQuery } from '../../api/countries.api';
import Notification from '../../components/Notification';

const TireBrandsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<number | ''>('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<TireBrand | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<TireBrand | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  
  // Форма
  const [formData, setFormData] = useState<TireBrandFormData>({
    name: '',
    country_id: undefined,
    is_active: true,
    is_premium: false,
    rating_score: 5,
    aliases: []
  });

  const itemsPerPage = 10;

  // API хуки
  const { data: brandsData, isLoading, error, refetch } = useGetTireBrandsQuery({
    search: searchTerm,
    country_id: countryFilter || undefined,
    active_only: activeOnly,
    premium_only: premiumOnly,
    page: currentPage,
    per_page: itemsPerPage
  });

  const { data: countriesData } = useGetCountriesQuery({ per_page: 100 });

  const [createBrand, { isLoading: isCreating }] = useCreateTireBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateTireBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteTireBrandMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleTireBrandStatusMutation();

  const brands = brandsData?.data || [];
  const pagination = brandsData?.pagination;
  const countries = countriesData?.data || [];

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country_id: undefined,
      is_active: true,
      is_premium: false,
      rating_score: 5,
      aliases: []
    });
    setEditingBrand(null);
  };

  const handleCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleEdit = (brand: TireBrand) => {
    setFormData({
      name: brand.name,
      country_id: brand.country_id,
      is_active: brand.is_active,
      is_premium: brand.is_premium,
      rating_score: brand.rating_score,
      aliases: []
    });
    setEditingBrand(brand);
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingBrand) {
        await updateBrand({ id: editingBrand.id, data: formData }).unwrap();
        showNotification('Бренд успешно обновлен', 'success');
      } else {
        await createBrand(formData).unwrap();
        showNotification('Бренд успешно создан', 'success');
      }
      setOpenModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка', 'error');
    }
  };

  const handleDelete = (brand: TireBrand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    
    try {
      await deleteBrand(brandToDelete.id).unwrap();
      showNotification('Бренд успешно удален', 'success');
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка при удалении', 'error');
    }
  };

  const handleToggleStatus = async (brand: TireBrand) => {
    try {
      await toggleStatus(brand.id).unwrap();
      showNotification(`Бренд ${brand.is_active ? 'деактивирован' : 'активирован'}`, 'success');
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <TireBrandIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.title}>
            {t('navigation.tireBrands', 'Шинные бренды')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={tablePageStyles.primaryButton}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Фильтры */}
      <Paper sx={tablePageStyles.filtersContainer}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            sx={{ flexGrow: 1, minWidth: 300 }}
            variant="outlined"
            placeholder="Поиск по названию бренда или стране..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Страна</InputLabel>
            <Select
              value={countryFilter}
              label="Страна"
              onChange={(e) => setCountryFilter(e.target.value as number | '')}
            >
              <MenuItem value="">Все страны</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name}
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
          <FormControlLabel
            control={
              <Switch
                checked={premiumOnly}
                onChange={(e) => setPremiumOnly(e.target.checked)}
              />
            }
            label="Только премиум"
          />
        </Stack>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Бренд</TableCell>
              <TableCell>Страна</TableCell>
              <TableCell>Рейтинг</TableCell>
              <TableCell>Моделей</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Премиум</TableCell>
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
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Бренды шин не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {brand.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {brand.country_name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {brand.rating_score}/10
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {brand.models_count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={brand.is_active ? 'Активен' : 'Неактивен'}
                      color={brand.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {brand.is_premium ? (
                      <Chip
                        icon={<StarBorderIcon />}
                        label="Премиум"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(brand.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(brand)}
                      disabled={isToggling}
                      sx={{ mr: 1 }}
                      title={brand.is_active ? 'Деактивировать' : 'Активировать'}
                    >
                      {brand.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(brand)}
                      sx={{ mr: 1 }}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(brand)}
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
          {editingBrand ? 'Редактировать бренд' : 'Создать бренд'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Название бренда"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Страна производства</InputLabel>
              <Select
                value={formData.country_id || ''}
                label="Страна производства"
                onChange={(e) => setFormData(prev => ({ ...prev, country_id: e.target.value as number || undefined }))}
              >
                <MenuItem value="">Не указана</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
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

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_premium || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_premium: e.target.checked }))}
                />
              }
              label="Премиум бренд"
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
            disabled={isCreating || isUpdating || !formData.name.trim()}
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
            Вы уверены, что хотите удалить бренд "{brandToDelete?.name}"?
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

export default TireBrandsPage;