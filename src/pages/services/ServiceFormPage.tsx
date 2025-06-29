/**
 * ServiceFormPage - Страница формы создания/редактирования категории услуг
 * 
 * Функциональность:
 * - Создание новой категории услуг
 * - Редактирование существующей категории услуг  
 * - Валидация данных формы с использованием Yup
 * - Отображение списка услуг в категории (только при редактировании)
 * - Централизованная система стилей для консистентного дизайна
 * - Двухколоночная раскладка при редактировании
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryFormData } from '../../types/service';
import { Button } from '../../components/ui';
import ServicesList from '../../components/ServicesList';
import { getFormStyles, SIZES } from '../../styles';

/**
 * Схема валидации формы категории услуг
 * Определяет правила валидации для всех полей формы
 */
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: Yup.string()
    .max(500, 'Описание не должно превышать 500 символов'),
  is_active: Yup.boolean(),
  sort_order: Yup.number()
    .min(0, 'Порядок сортировки должен быть неотрицательным')
    .max(9999, 'Порядок сортировки не должен превышать 9999'),
});

/**
 * ServiceFormPage - Основной компонент страницы формы категории услуг
 * Поддерживает создание новых категорий и редактирование существующих
 */
export const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // RTK Query хуки для работы с API категорий услуг
  const { data: category, isLoading } = useGetServiceCategoryByIdQuery(id!, {
    skip: !isEditing,
  });

  const [createCategory] = useCreateServiceCategoryMutation();
  const [updateCategory] = useUpdateServiceCategoryMutation();

  /**
   * Конфигурация Formik для управления состоянием формы
   * Включает валидацию, обработку отправки и начальные значения
   */
  const formik = useFormik<ServiceCategoryFormData>({
    initialValues: {
      name: category?.name || '',
      description: category?.description || '',
      is_active: category?.is_active ?? true,
      sort_order: category?.sort_order || 0,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        setSuccessMessage('');
        if (isEditing && id) {
          await updateCategory({ id, data: values }).unwrap();
          setSuccessMessage('Категория услуг успешно обновлена');
        } else {
          await createCategory(values).unwrap();
          setSuccessMessage('Категория услуг успешно создана');
        }
        setTimeout(() => navigate('/admin/services'), 1000);
      } catch (error: any) {
        setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');
      }
    },
  });

  /**
   * Обработчик возврата к списку категорий
   */
  const handleBack = () => {
    navigate('/admin/services');
  };

  // Состояние загрузки для режима редактирования
  if (isEditing && isLoading) {
    return (
      <Box sx={formStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: theme.spacing(SIZES.spacing.md) }}>
          Загрузка категории...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={formStyles.container}>
      {/* Заголовок страницы с кнопкой "Назад" */}
      <Box sx={formStyles.headerContainer}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: theme.spacing(SIZES.spacing.md) }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1" sx={formStyles.title}>
          {isEditing ? 'Редактировать категорию услуг' : 'Новая категория услуг'}
        </Typography>
      </Box>

      {/* Сообщения об ошибках и успехе */}
      {submitError && (
        <Alert severity="error" sx={{ mb: theme.spacing(SIZES.spacing.md) }}>
          {submitError}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: theme.spacing(SIZES.spacing.md) }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={theme.spacing(SIZES.spacing.xl)}>
        {/* Основная форма категории */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Box sx={formStyles.formCard}>
            <Typography variant="h6" sx={formStyles.sectionTitle}>
              Информация о категории
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Поле ввода названия категории */}
              <TextField
                fullWidth
                name="name"
                label="Название"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={formStyles.field}
              />

              {/* Поле ввода описания категории */}
              <TextField
                fullWidth
                name="description"
                label="Описание"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                sx={formStyles.field}
              />

              {/* Поле ввода порядка сортировки */}
              <TextField
                fullWidth
                name="sort_order"
                label="Порядок сортировки"
                type="number"
                value={formik.values.sort_order}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sort_order && Boolean(formik.errors.sort_order)}
                helperText={formik.touched.sort_order && formik.errors.sort_order}
                sx={formStyles.field}
              />

              {/* Переключатель активности категории */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активна"
                sx={formStyles.switchField}
              />

              {/* Кнопка сохранения формы */}
              <Box sx={formStyles.actionsContainer}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={formik.isSubmitting}
                >
                  {isEditing ? 'Сохранить' : 'Создать'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Список услуг в категории (только при редактировании) */}
        {isEditing && id && (
          <Grid item xs={12} md={6}>
            <ServicesList categoryId={id} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ServiceFormPage;
