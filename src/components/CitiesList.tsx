import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  Tooltip,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
import { useLocalizedName } from '../utils/localizationHelpers';

// Импорты UI компонентов
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Modal } from '../components/ui/Modal';
import { Switch } from '../components/ui/Switch';
import { Chip } from '../components/ui/Chip';
import { Pagination } from '../components/ui/Pagination';
import { Table, Column } from '../components/ui/Table';
import { ActionsMenu, ActionItem } from '../components/ui/ActionsMenu/ActionsMenu';

const createValidationSchema = (t: any) => Yup.object({
  name: Yup.string()
    .required(t('forms.city.validation.nameRequired'))
    .min(2, t('forms.city.validation.nameMin'))
    .max(100, t('forms.city.validation.nameMax')),
  name_ru: Yup.string()
    .min(2, t('forms.city.validation.nameRuMin'))
    .max(100, t('forms.city.validation.nameRuMax')),
  name_uk: Yup.string()
    .min(2, t('forms.city.validation.nameUkMin'))
    .max(100, t('forms.city.validation.nameUkMax')),
  is_active: Yup.boolean(),
  region_id: Yup.number().required(t('forms.city.validation.regionRequired')),
});

interface CitiesListProps {
  regionId: string | number;
}

const CitiesList: React.FC<CitiesListProps> = ({ regionId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const localizedName = useLocalizedName();

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
      name_ru: '',
      name_uk: '',
      is_active: true,
      region_id: typeof regionId === 'string' ? parseInt(regionId) : regionId,
    },
    validationSchema: createValidationSchema(t),
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
        console.error('City save error:', err);
        setError(err?.data?.message || t('forms.city.messages.saveError'));
      }
    },
  });

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setSelectedCity(city);
      formik.setValues({
        name: city.name,
        name_ru: city.name_ru || '',
        name_uk: city.name_uk || '',
        is_active: city.is_active,
        region_id: city.region_id,
      });
    } else {
      setSelectedCity(null);
      formik.setValues({
        name: '',
        name_ru: '',
        name_uk: '',
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
        console.error('City delete error:', err);
        let errorMessage = t('forms.city.messages.deleteError');
        
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
   * Конфигурация действий для ActionsMenu
   */
  const cityActions: ActionItem<City>[] = [
    {
      id: 'edit',
      label: t('forms.city.actions.edit'),
      icon: <EditIcon />,
      onClick: (city: City) => handleOpenDialog(city),
      color: 'primary',
      tooltip: t('forms.city.actions.editTooltip')
    },
    {
      id: 'delete',
      label: t('forms.city.actions.delete'),
      icon: <DeleteIcon />,
      onClick: (city: City) => handleOpenDeleteDialog(city),
      color: 'error',
      tooltip: t('forms.city.actions.deleteTooltip'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('forms.city.dialogs.deleteConfirmation.title'),
        message: t('forms.city.dialogs.deleteConfirmation.message'),
      }
    }
  ];

  /**
   * Конфигурация колонок для UI Table
   */
  const columns: Column[] = [
    {
      id: 'name',
      label: t('forms.city.table.columns.name'),
      minWidth: 200,
      wrap: true,
      format: (value: string, row: City) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary
          }}
        >
          {localizedName(row)}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: t('forms.city.table.columns.status'),
      align: 'center',
      format: (value: boolean) => (
        <Chip 
          label={value ? t('forms.city.status.active') : t('forms.city.status.inactive')}
          color={value ? 'success' : 'default'}
          size="small"
          sx={tablePageStyles.statusChip}
        />
      )
    },
    {
      id: 'actions',
      label: t('forms.city.table.columns.actions'),
      align: 'right',
      minWidth: 120,
      format: (value: any, row: City) => (
        <ActionsMenu
          actions={cityActions}
          item={row}
          menuThreshold={0}
        />
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
        {t('forms.city.title')}
      </Typography>

      {/* Поиск и кнопка добавления */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder={t('forms.city.search.placeholder')}
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
          {t('forms.city.buttons.add')}
        </Button>
      </Box>

      {/* Ошибки */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
        >
          ❌ {error}
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
            {searchQuery ? t('forms.city.emptyState.notFound') : t('forms.city.emptyState.noCities')}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {searchQuery 
              ? t('forms.city.emptyState.changeSearch')
              : t('forms.city.emptyState.addFirst')
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={tablePageStyles.primaryButton}
            >
              {t('forms.city.buttons.add')}
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
        title={selectedCity ? t('forms.city.dialogs.edit.title') : t('forms.city.dialogs.create.title')}
        maxWidth={600}
        actions={
          <>
            <Button onClick={handleCloseDialog}>{t('forms.city.buttons.cancel')}</Button>
            <Button 
              onClick={() => formik.handleSubmit()} 
              variant="contained"
            >
              {selectedCity ? t('forms.city.buttons.save') : t('forms.city.buttons.create')}
            </Button>
          </>
        }
      >
        <Box pt={SIZES.spacing.sm}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label={t('forms.city.fields.name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: SIZES.spacing.md }}
          />
          
          {/* Поля переводов */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
            {t('forms.city.sections.translations')}
          </Typography>
          
          <TextField
            fullWidth
            id="name_ru"
            name="name_ru"
            label={t('forms.city.fields.nameRu')}
            value={formik.values.name_ru}
            onChange={formik.handleChange}
            error={formik.touched.name_ru && Boolean(formik.errors.name_ru)}
            helperText={formik.touched.name_ru && formik.errors.name_ru}
            placeholder={t('forms.city.placeholders.nameRu')}
            sx={{ mb: SIZES.spacing.md }}
          />
          
          <TextField
            fullWidth
            id="name_uk"
            name="name_uk"
            label={t('forms.city.fields.nameUk')}
            value={formik.values.name_uk}
            onChange={formik.handleChange}
            error={formik.touched.name_uk && Boolean(formik.errors.name_uk)}
            helperText={formik.touched.name_uk && formik.errors.name_uk}
            placeholder={t('forms.city.placeholders.nameUk')}
            sx={{ mb: SIZES.spacing.md }}
          />
          
          <Switch
            label={t('forms.city.fields.isActive')}
            checked={formik.values.is_active}
            onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
          />
        </Box>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal 
        open={isDeleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        title={t('forms.city.dialogs.delete.title')}
        maxWidth={400}
        actions={
          <>
            <Button onClick={handleCloseDeleteDialog}>{t('forms.city.buttons.cancel')}</Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
            >
              {t('forms.city.buttons.delete')}
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: SIZES.fontSize.md }}>
          {t('forms.city.dialogs.delete.message', { name: cityToDelete ? localizedName(cityToDelete) : '' })}
        </Typography>
      </Modal>
    </Box>
  );
};

export default CitiesList;
