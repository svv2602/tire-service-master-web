import React, { useState, useMemo, useCallback } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  useGetCitiesQuery, 
  useDeleteCityMutation,
  useUpdateCityMutation,
} from '../../api/cities.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { City, Region } from '../../types/models';

// Импорты UI компонентов
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  type Column,
  Alert,
} from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getTablePageStyles } from '../../styles/components';

// Схема валидации для города
const validationSchema = yup.object({
  name: yup.string().required('Название города обязательно'),
  region_id: yup.string().required('Регион обязателен'),
});

interface CityFormData {
  name: string;
  region_id: string;
  is_active?: boolean;
}

const CitiesPage: React.FC = () => {
  const theme = useTheme();
  
  // Инициализация централизованных стилей
  const tablePageStyles = getTablePageStyles(theme);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // RTK Query хуки
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetCitiesQuery({
    query: search || undefined,
    region_id: regionFilter ? Number(regionFilter) : undefined,
    page: page + 1,
    per_page: rowsPerPage,
  });

  const { data: regionsData } = useGetRegionsQuery({});
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const isLoading = citiesLoading;
  const error = citiesError;
  const cities = citiesData?.data || [];
  const totalItems = citiesData?.pagination?.total_count || 0;
  const regions = useMemo(() => regionsData?.data || [], [regionsData?.data]);

  // Мемоизированные обработчики
  const handleOpenDialog = useCallback((city?: City) => {
    setEditingCity(city || null);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingCity(null);
  }, []);

  const handleDeleteClick = useCallback((city: City) => {
    setSelectedCity(city);
    setDeleteDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (city: City) => {
    try {
      await updateCity({
        id: Number(city.id),
        city: { is_active: !city.is_active }
      }).unwrap();
      setNotification({
        open: true,
        message: `Город ${!city.is_active ? 'активирован' : 'деактивирован'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      setNotification({
        open: true,
        message: 'Ошибка при изменении статуса города',
        severity: 'error'
      });
    }
  }, [updateCity]);

  // Удаление города
  const handleDeleteCity = async (id: number) => {
    try {
      await deleteCity(Number(id)).unwrap();
      setNotification({
        open: true,
        message: 'Город успешно удален',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedCity(null);
    } catch (error) {
      console.error('Ошибка при удалении города:', error);
      setNotification({
        open: true,
        message: 'Не удалось удалить город',
        severity: 'error'
      });
    }
  };

  // Формик для формы города
  const formik = useFormik<CityFormData>({
    initialValues: {
      name: editingCity?.name || '',
      region_id: editingCity?.region_id?.toString() || '',
      is_active: editingCity?.is_active ?? true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingCity) {
          await updateCity({ 
            id: Number(editingCity.id),
            city: {
              name: values.name,
              region_id: Number(values.region_id),
              is_active: values.is_active
            }
          }).unwrap();
          setNotification({
            open: true,
            message: 'Город успешно обновлен',
            severity: 'success'
          });
          handleCloseDialog();
        } else {
          setNotification({
            open: true,
            message: 'Функция создания города будет добавлена позже',
            severity: 'info'
          });
          handleCloseDialog();
        }
      } catch (error) {
        console.error('Ошибка при сохранении города:', error);
      }
    },
  });

  // Обновление formik при изменении editingCity
  React.useEffect(() => {
    if (editingCity) {
      formik.setValues({
        name: editingCity.name,
        region_id: editingCity.region_id.toString(),
        is_active: editingCity.is_active,
      });
    } else {
      formik.resetForm();
    }
  }, [editingCity, formik]);

  // Обработчики пагинации и поиска
  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage - 1);
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleRegionFilterChange = useCallback((event: SelectChangeEvent<string>) => {
    setRegionFilter(event.target.value);
    setPage(0);
  }, []);

  // Закрытие уведомления
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Конфигурация колонок таблицы
  const columns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: 'Название',
      wrap: true,
      format: (value, row: City) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <LocationCityIcon color="action" />
          <Typography>{row.name}</Typography>
        </Box>
      )
    },
    {
      id: 'region',
      label: 'Регион',
      wrap: true,
      format: (value, row: City) => (
        <Box sx={tablePageStyles.avatarContainer}>
          <LocationOnIcon color="action" />
          <Typography>
            {regions.find(r => r.id.toString() === row.region_id.toString())?.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value, row: City) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.is_active}
              onChange={() => handleToggleStatus(row)}
              size="small"
            />
          }
          label={row.is_active ? 'Активен' : 'Неактивен'}
          sx={{ m: 0 }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      format: (value, row: City) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(row)}
              sx={tablePageStyles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row)}
              sx={tablePageStyles.actionButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [handleOpenDialog, handleDeleteClick, handleToggleStatus, regions, tablePageStyles]);

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.errorContainer}>
      <Alert severity="error">
        Произошла ошибка при загрузке данных: {(error as any)?.data?.message || 'Неизвестная ошибка'}
      </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          Управление городами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={tablePageStyles.createButton}
        >
          Добавить город
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Box sx={tablePageStyles.filtersContainer}>
          <TextField
          placeholder="Поиск по названию города"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
          sx={tablePageStyles.searchField}
            InputProps={{
            startAdornment: <SearchIcon />,
            }}
          />
        
        <FormControl size="small" sx={tablePageStyles.filterSelect}>
            <InputLabel>Регион</InputLabel>
            <Select
              value={regionFilter}
              onChange={handleRegionFilterChange}
              label="Регион"
            >
              <MenuItem value="">Все регионы</MenuItem>
              {regions.map((region: Region) => (
                <MenuItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

      {/* Таблица городов */}
      <Box>
        <Table 
          columns={columns} 
          rows={cities}
        />

        {/* Пагинация */}
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
            disabled={totalItems <= rowsPerPage}
        />
        </Box>
      </Box>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingCity ? 'Редактировать город' : 'Добавить город'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Название"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <FormControl fullWidth>
                <InputLabel>Регион</InputLabel>
                <Select
                  name="region_id"
                  value={formik.values.region_id}
                  onChange={formik.handleChange}
                  label="Регион"
                  error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                >
                  {regions.map((region: Region) => (
                    <MenuItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formik.values.is_active}
                    onChange={formik.handleChange}
                  />
                }
                label="Активен"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCity ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить город {selectedCity?.name}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={() => selectedCity && handleDeleteCity(selectedCity.id)}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CitiesPage;