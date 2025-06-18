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
  IconButton,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material';
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
import { Pagination } from './ui';
import { getTablePageStyles, SIZES } from '../styles';

/**
 * Схема валидации формы модели автомобиля
 */
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название модели обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
  brand_id: Yup.number().required('ID бренда обязателен'),
});

interface CarModelsListProps {
  brandId: string;
}

/**
 * CarModelsList - Основной компонент списка моделей автомобилей
 */
const CarModelsList: React.FC<CarModelsListProps> = ({ brandId }) => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CarModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PER_PAGE = 10;

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
        let errorMessage = 'Произошла ошибка при сохранении модели';
        
        // Обрабатываем различные форматы ошибок от API
        if (error.data?.error) {
          // Основной формат ошибок с ограничениями
          errorMessage = error.data.error;
        } else if (error.data?.errors) {
          // Ошибки валидации
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else if (error.data?.message) {
          // Альтернативный формат
          errorMessage = error.data.message;
        } else if (error.message) {
          // Общие ошибки
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }
    },
  });

  /**
   * Обработчик открытия диалога создания/редактирования
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
    setIsDialogOpen(true);
    setError(null);
  };

  /**
   * Обработчик закрытия диалога создания/редактирования
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedModel(null);
    formik.resetForm();
    setError(null);
  };

  /**
   * Обработчик открытия диалога удаления
   */
  const handleOpenDeleteDialog = (model: CarModel) => {
    setModelToDelete(model);
    setIsDeleteDialogOpen(true);
    setError(null);
  };

  /**
   * Обработчик закрытия диалога удаления
   */
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setModelToDelete(null);
    setError(null);
  };

  /**
   * Обработчик удаления модели
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
      let errorMessage = 'Произошла ошибка при удалении модели';
      
      // Обрабатываем различные форматы ошибок от API
      if (error.data?.error) {
        // Основной формат ошибок с ограничениями
        errorMessage = error.data.error;
      } else if (error.data?.message) {
        // Альтернативный формат
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        // Ошибки валидации
        const errors = error.data.errors as Record<string, string[]>;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
      } else if (error.message) {
        // Общие ошибки
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  /**
   * Обработчик изменения страницы пагинации
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Обработчик поиска моделей
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
          placeholder="Поиск моделей"
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
          Добавить модель
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

      {/* Таблица моделей */}
      <TableContainer sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead sx={tablePageStyles.tableHeader}>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model: CarModel) => (
              <TableRow 
                key={model.id}
                sx={{
                  ...tablePageStyles.tableRow,
                  opacity: model.is_active ? 1 : 0.7,
                }}
              >
                <TableCell sx={tablePageStyles.tableCell}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}
                  >
                    {model.name}
                  </Typography>
                </TableCell>
                <TableCell sx={tablePageStyles.tableCell}>
                  <Chip 
                    label={model.is_active ? 'Активна' : 'Неактивна'}
                    color={model.is_active ? 'success' : 'default'}
                    size="small"
                    sx={tablePageStyles.statusChip}
                  />
                </TableCell>
                <TableCell align="right" sx={tablePageStyles.tableCell}>
                  <Box sx={tablePageStyles.actionsContainer}>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenDialog(model)}
                        sx={tablePageStyles.actionButton}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenDeleteDialog(model)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пустое состояние */}
      {models.length === 0 && !isLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {searchQuery ? 'Модели не найдены' : 'В данном бренде пока нет моделей'}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {searchQuery 
              ? 'Попробуйте изменить критерии поиска'
              : 'Добавьте первую модель в этот бренд'
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={tablePageStyles.primaryButton}
            >
              Добавить модель
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
            size="large"
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
          {selectedModel ? 'Редактировать модель' : 'Новая модель'}
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
              label="Название модели"
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
              label="Активная модель"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={tablePageStyles.dialogActions}>
          <Button onClick={handleCloseDialog}>
            Отмена
          </Button>
          <Button 
            onClick={formik.submitForm}
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {selectedModel ? 'Сохранить' : 'Создать'}
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
          Подтвердите удаление
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить модель "{modelToDelete?.name}"?
            Это действие нельзя отменить.
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
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteModel}
            variant="contained"
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarModelsList; 