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
  Public as CountryIcon,
  Search as SearchIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';
import { 
  useGetCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useToggleCountryStatusMutation,
  Country,
  CountryFormData
} from '../../api/countries.api';
import Notification from '../../components/Notification';

const CountriesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  
  // Форма
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    iso_code: '',
    is_active: true,
    rating_score: 5,
    aliases: []
  });

  const itemsPerPage = 10;

  // API хуки
  const { data: countriesData, isLoading, error, refetch } = useGetCountriesQuery({
    search: searchTerm,
    active_only: activeOnly,
    page: currentPage,
    per_page: itemsPerPage
  });

  const [createCountry, { isLoading: isCreating }] = useCreateCountryMutation();
  const [updateCountry, { isLoading: isUpdating }] = useUpdateCountryMutation();
  const [deleteCountry, { isLoading: isDeleting }] = useDeleteCountryMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleCountryStatusMutation();

  const countries = countriesData?.data || [];
  const pagination = countriesData?.pagination;

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      iso_code: '',
      is_active: true,
      rating_score: 5,
      aliases: []
    });
    setEditingCountry(null);
  };

  const handleCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleEdit = (country: Country) => {
    setFormData({
      name: country.name,
      iso_code: country.iso_code || '',
      is_active: country.is_active,
      rating_score: country.rating_score,
      aliases: []
    });
    setEditingCountry(country);
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingCountry) {
        await updateCountry({ id: editingCountry.id, data: formData }).unwrap();
        showNotification('Страна успешно обновлена', 'success');
      } else {
        await createCountry(formData).unwrap();
        showNotification('Страна успешно создана', 'success');
      }
      setOpenModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка', 'error');
    }
  };

  const handleDelete = (country: Country) => {
    setCountryToDelete(country);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!countryToDelete) return;
    
    try {
      await deleteCountry(countryToDelete.id).unwrap();
      showNotification('Страна успешно удалена', 'success');
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
      refetch();
    } catch (error: any) {
      showNotification(error?.data?.error || 'Произошла ошибка при удалении', 'error');
    }
  };

  const handleToggleStatus = async (country: Country) => {
    try {
      await toggleStatus(country.id).unwrap();
      showNotification(`Страна ${country.is_active ? 'деактивирована' : 'активирована'}`, 'success');
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
          <CountryIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.title}>
            {t('navigation.countries', 'Страны')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={tablePageStyles.primaryButton}
        >
          Добавить страну
        </Button>
      </Box>

      {/* Фильтры */}
      <Paper sx={tablePageStyles.filtersContainer}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по названию или ISO коду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={activeOnly ? 'active' : 'all'}
              label="Статус"
              onChange={(e) => setActiveOnly(e.target.value === 'active')}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="active">Только активные</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>ISO код</TableCell>
              <TableCell>Рейтинг</TableCell>
              <TableCell>Бренды шин</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : countries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Страны не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              countries.map((country) => (
                <TableRow key={country.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {country.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {country.iso_code || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {country.rating_score}/10
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {country.tire_brands_count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={country.is_active ? 'Активна' : 'Неактивна'}
                      color={country.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(country.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(country)}
                      disabled={isToggling}
                      sx={{ mr: 1 }}
                      title={country.is_active ? 'Деактивировать' : 'Активировать'}
                    >
                      {country.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(country)}
                      sx={{ mr: 1 }}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(country)}
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
          {editingCountry ? 'Редактировать страну' : 'Создать страну'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Название страны"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="ISO код (например, UA, DE, JP)"
              value={formData.iso_code}
              onChange={(e) => setFormData(prev => ({ ...prev, iso_code: e.target.value.toUpperCase() }))}
              inputProps={{ maxLength: 3 }}
            />
            <TextField
              fullWidth
              label="Рейтинг (1-10)"
              type="number"
              value={formData.rating_score}
              onChange={(e) => setFormData(prev => ({ ...prev, rating_score: Number(e.target.value) }))}
              inputProps={{ min: 1, max: 10 }}
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
            Вы уверены, что хотите удалить страну "{countryToDelete?.name}"?
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

export default CountriesPage;