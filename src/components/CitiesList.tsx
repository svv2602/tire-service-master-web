import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  Tooltip,
} from '@mui/material';
import { SIZES } from '../styles/theme';
import { 
  getTablePageStyles
} from '../styles/components';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} from '../api/cities.api';
import { City, CityFormData } from '../types/models';

// Импорты UI компонентов
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Switch } from '../components/ui/Switch';
import { Chip } from '../components/ui/Chip';
import { Pagination } from '../components/ui/Pagination';
import { Table, Column } from '../components/ui/Table';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название города обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
  region_id: Yup.number().required('ID региона обязателен'),
});

interface CitiesListProps {
  regionId: string | number;
}

const CitiesList: React.FC<CitiesListProps> = ({ regionId }) => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

  // RTK Query хуки
  const { data: response, isLoading } = useGetCitiesQuery({
    region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
    page,
    per_page: PER_PAGE,
    query: searchQuery || undefined,
  });

  const cities = response?.data || [];
  const totalPages = response?.pagination?.total_count ? Math.ceil(response.pagination.total_count / PER_PAGE) : 0;
  const [createCity] = useCreateCityMutation();
  const [updateCity] = useUpdateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  const formik = useFormik<CityFormData>({
    initialValues: {
      name: '',
      is_active: true,
      region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedCity) {
          await updateCity({
            id: selectedCity.id,
            city: values,
          }).unwrap();
        } else {
          await createCity(values).unwrap();
        }
        handleCloseDialog();
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при сохранении города:', err);
        setError(err?.data?.message || 'Произошла ошибка при сохранении города');
      }
    },
  });

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setSelectedCity(city);
      formik.setValues({
        name: city.name,
        is_active: city.is_active,
        region_id: city.region_id,
      });
    } else {
      setSelectedCity(null);
      formik.setValues({
        name: '',
        is_active: true,
        region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
      });
    }
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCity(null);
    formik.resetForm();
    setError(null);
  };

  const handleOpenDeleteDialog = (city: City) => {
    setCityToDelete(city);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCityToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (cityToDelete) {
      try {
        await deleteCity(cityToDelete.id).unwrap();
        handleCloseDeleteDialog();
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при удалении города:', err);
        let errorMessage = 'Произошла ошибка при удалении города';
        
        // Обрабатываем различные форматы ошибок от API
        if (err?.data?.error) {
          // Основной формат ошибок с ограничениями
          errorMessage = err.data.error;
        } else if (err?.data?.message) {
          // Альтернативный формат
          errorMessage = err.data.message;
        } else if (err?.data?.errors) {
          // Ошибки валидации
          const errors = err.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (err?.message) {
          // Общие ошибки
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        handleCloseDeleteDialog();
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Конфигурация колонок для UI Table
   */
  const columns: Column[] = [
    {
      id: 'name',
      label: 'Название',
      minWidth: 200,
      wrap: true,
      format: (value: string) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary
          }}
        >
          {value}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: 'Статус',
      align: 'center',
      format: (value: boolean) => (
        <Chip 
          label={value ? 'Активен' : 'Неактивен'}
          color={value ? 'success' : 'default'}
          size="small"
          sx={tablePageStyles.statusChip}
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      minWidth: 120,
      format: (value: any, row: City) => (
        <Box sx={tablePageStyles.actionsContainer}>
          <Tooltip title="Редактировать">
            <IconButton 
              size="small"
              onClick={() => handleOpenDialog(row)}
              sx={tablePageStyles.actionButton}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton 
              size="small"
              onClick={() => handleOpenDeleteDialog(row)}
              sx={{
                ...tablePageStyles.actionButton,
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}15`,
                  color: theme.palette.error.main
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SIZES.spacing.sm,
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600,
          mb: SIZES.spacing.md
        }}
      >
        <LocationCityIcon />
        Города в регионе
      </Typography>

      {/* Поиск и кнопка добавления */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder="Поиск городов"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={tablePageStyles.searchField}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={tablePageStyles.primaryButton}
        >
          Добавить город
        </Button>
      </Box>

      {/* Ошибки */}
      {error && (
        <Alert 
          severity="error" 
          sx={tablePageStyles.errorAlert}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Таблица городов с UI Table */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={cities}
        />
      </Box>

      {/* Пустое состояние */}
      {cities.length === 0 && !isLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {searchQuery ? 'Города не найдены' : 'В данном регионе пока нет городов'}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {searchQuery 
              ? 'Попробуйте изменить критерии поиска'
              : 'Добавьте первый город в этот регион'
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={tablePageStyles.primaryButton}
            >
              Добавить город
            </Button>
          )}
        </Box>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Модальное окно создания/редактирования города */}
      <Modal 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        title={selectedCity ? 'Редактировать город' : 'Добавить город'}
        maxWidth={600}
        actions={
          <>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button 
              onClick={() => formik.handleSubmit()} 
              variant="contained"
            >
              {selectedCity ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        <Box pt={SIZES.spacing.sm}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Название города"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: SIZES.spacing.md }}
          />
          <Switch
            label="Активен"
            checked={formik.values.is_active}
            onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
          />
        </Box>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={isDeleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        title="Подтверждение удаления"
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
            >
              Удалить
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          Вы действительно хотите удалить город "{cityToDelete?.name}"?
          Это действие нельзя будет отменить.
        </Typography>
      </Modal>
    </Box>
  );
};

export default CitiesList;
