/**
 * CarModelsList - Компонент списка моделей автомобилей для конкретного бренда
 * 
 * Функциональность:
 * - Отображение моделей в табличном виде
 * - Поиск моделей по названию
 * - Создание новых моделей
 * - Редактирование существующих моделей
 * - Удаление моделей с подтверждением
 * - Переключение статуса активности
 * - Пагинация результатов
 * - Централизованная система стилей
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  DialogContentText,
  Chip,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// UI компоненты
import { Table, Column } from '../components/ui/Table';
import { Pagination as UIPagination } from '../components/ui/Pagination';
import { ActionsMenu, ActionItem } from '../components/ui/ActionsMenu/ActionsMenu';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetCarModelsByBrandIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
} from '../api/carModels.api';
import { CarModel, CarModelFormData } from '../types/car';
import { getTablePageStyles, SIZES } from '../styles';

interface CarModelsListProps {
  brandId: string;
}

/**
 * CarModelsList - Основной компонент списка моделей автомобилей
 */
const CarModelsList: React.FC<CarModelsListProps> = ({ brandId }) => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const { t } = useTranslation('components');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CarModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

  // Схема валидации формы модели автомобиля
  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('carModelsList.validation.nameRequired'))
      .min(2, t('carModelsList.validation.nameMinLength'))
      .max(100, t('carModelsList.validation.nameMaxLength')),
    is_active: Yup.boolean(),
    brand_id: Yup.number().required('ID бренда обязателен'),
  });

  // RTK Query хуки для работы с API моделей
  const { data: response, isLoading } = useGetCarModelsByBrandIdQuery({
    brandId,
    params: {
      page,
      per_page: PER_PAGE,
      query: searchQuery || undefined,
    },
  });

  const models = response?.car_models || [];
  const totalPages = response?.total_items ? Math.ceil(response.total_items / PER_PAGE) : 0;
  const [createModel] = useCreateCarModelMutation();
  const [updateModel] = useUpdateCarModelMutation();
  const [deleteModel] = useDeleteCarModelMutation();

  // Конфигурация действий для ActionsMenu
  const modelActions: ActionItem<CarModel>[] = [
    {
      id: 'edit',
      label: t('carModelsList.editModel'),
      icon: <EditIcon />,
      color: 'primary',
      tooltip: t('carModelsList.tooltips.edit'),
      onClick: (model: CarModel) => handleOpenDialog(model),
    },
    {
      id: 'delete',
      label: t('carModelsList.deleteModel'),
      icon: <DeleteIcon />,
      color: 'error',
      tooltip: t('carModelsList.tooltips.delete'),
      requireConfirmation: true,
      confirmationConfig: {
        title: t('carModelsList.dialogs.deleteTitle'),
        message: t('carModelsList.dialogs.deleteMessage', { name: '{item.name}' }),
      },
      onClick: (model: CarModel) => handleOpenDeleteDialog(model),
    },
  ];

  // Конфигурация колонок для UI Table
  const columns: Column[] = [
    { 
      id: 'name', 
      label: t('carModelsList.columns.name'), 
      minWidth: 200,
      format: (value: string, row: CarModel) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary,
            opacity: row.is_active ? 1 : 0.7,
          }}
        >
          {value}
        </Typography>
      )
    },
    { 
      id: 'is_active', 
      label: t('carModelsList.columns.status'), 
      minWidth: 120,
      format: (value: boolean) => (
        <Chip 
          label={value ? t('carModelsList.status.active') : t('carModelsList.status.inactive')}
          color={value ? 'success' : 'default'}
          size="small"
          sx={tablePageStyles.statusChip}
        />
      )
    },
    { 
      id: 'actions', 
      label: t('carModelsList.columns.actions'), 
      minWidth: 120,
      align: 'right',
      format: (value: any, row: CarModel) => (
        <ActionsMenu
          actions={modelActions}
          item={row}
          menuThreshold={0}
        />
      )
    }
  ];

  /**
   * Конфигурация Formik для управления состоянием формы
   */
  const formik = useFormik<CarModelFormData>({
    initialValues: {
      name: '',
      is_active: true,
      brand_id: parseInt(brandId),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedModel) {
          await updateModel({
            brandId,
            id: selectedModel.id.toString(),
            data: values,
          }).unwrap();
        } else {
          await createModel({
            brandId,
            data: values,
          }).unwrap();
        }
        handleCloseDialog();
      } catch (error: any) {
        console.error('Error saving model:', error);
        setError(error.data?.message || 'Произошла ошибка при сохранении модели');
      }
    },
  });

  /**
   * Открытие диалога создания/редактирования модели
   */
  const handleOpenDialog = (model?: CarModel) => {
    if (model) {
      setSelectedModel(model);
      formik.setValues({
        name: model.name,
        is_active: model.is_active,
        brand_id: parseInt(brandId),
      });
    } else {
      setSelectedModel(null);
      formik.resetForm();
    }
    setError(null);
    setIsDialogOpen(true);
  };

  /**
   * Закрытие диалога создания/редактирования
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedModel(null);
    formik.resetForm();
    setError(null);
  };

  /**
   * Открытие диалога подтверждения удаления
   */
  const handleOpenDeleteDialog = (model: CarModel) => {
    setModelToDelete(model);
    setIsDeleteDialogOpen(true);
    setError(null);
  };

  /**
   * Закрытие диалога подтверждения удаления
   */
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setModelToDelete(null);
    setError(null);
  };

  /**
   * Удаление модели
   */
  const handleDeleteModel = async () => {
    if (!modelToDelete) return;

    try {
      await deleteModel({
        brandId,
        id: modelToDelete.id.toString(),
      }).unwrap();
      
      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting model:', error);
      setError(error.data?.message || 'Произошла ошибка при удалении модели');
    }
  };

  /**
   * Обработчик изменения страницы пагинации
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Обработчик поиска
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Поиск и кнопка добавления */}
      <Box sx={tablePageStyles.filtersContainer}>
        <TextField
          placeholder={t('carModelsList.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={tablePageStyles.searchField}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={tablePageStyles.primaryButton}
        >
          {t('carModelsList.addModel')}
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

      {/* Таблица моделей с UI Table */}
      <Box sx={{ mb: 3 }}>
        <Table
          columns={columns}
          rows={models}
        />
      </Box>

      {/* Пустое состояние */}
      {models.length === 0 && !isLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {searchQuery ? t('carModelsList.emptyState.noModelsFound') : t('carModelsList.emptyState.noModels')}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {searchQuery 
              ? t('carModelsList.emptyState.changeSearchCriteria')
              : t('carModelsList.emptyState.addFirstModel')
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={tablePageStyles.primaryButton}
            >
              {t('carModelsList.addModel')}
            </Button>
          )}
        </Box>
      )}

      {/* Пагинация с UI Pagination */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <UIPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Диалог создания/редактирования модели */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          {selectedModel ? t('carModelsList.editModel') : t('carModelsList.newModel')}
        </DialogTitle>
        <DialogContent sx={{ pt: SIZES.spacing.sm }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: SIZES.spacing.md }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              name="name"
              label={t('carModelsList.form.modelName')}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: SIZES.spacing.md }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.is_active}
                  onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                  name="is_active"
                />
              }
              label={t('carModelsList.form.activeModel')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button onClick={handleCloseDialog}>
            {t('carModelsList.form.cancel')}
          </Button>
          <Button 
            onClick={formik.submitForm}
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {selectedModel ? t('carModelsList.form.save') : t('carModelsList.form.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: tablePageStyles.dialogPaper
        }}
      >
        <DialogTitle sx={tablePageStyles.dialogTitle}>
          {t('carModelsList.dialogs.deleteTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('carModelsList.dialogs.deleteMessage', { name: modelToDelete?.name })}
          </DialogContentText>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: SIZES.spacing.md }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button onClick={handleCloseDeleteDialog}>
            {t('carModelsList.form.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteModel}
            variant="contained"
            color="error"
          >
            {t('carModelsList.dialogs.deleteConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarModelsList; 