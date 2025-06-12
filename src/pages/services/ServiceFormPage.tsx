/**
 * ServiceFormPage - Страница формы создания/редактирования категории услуг
 * 
 * Основные функции:
 * - Создание новой категории услуг
 * - Редактирование существующей категории услуг  
 * - Валидация данных формы
 * - Отображение списка услуг в категории (только при редактировании)
 * - Использование централизованной системы стилей для консистентного дизайна
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Divider,
  useTheme,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryFormData } from '../../types/service';
import ServicesList from '../../components/ServicesList';

// Импорт централизованной системы стилей для консистентного дизайна
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  SIZES 
} from '../../styles';

/**
 * Схема валидации формы категории услуг
 * Определяет правила валидации для всех полей формы
 */
const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  description: Yup.string(),
  is_active: Yup.boolean(),
  sort_order: Yup.number().min(0, 'Порядок сортировки должен быть неотрицательным'),
});

/**
 * ServiceFormPage - Основной компонент страницы формы категории услуг
 * Поддерживает создание новых категорий и редактирование существующих
 */
export const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');

  // Хук темы для использования централизованных стилей
  const theme = useTheme();
  
  // Получаем стили из централизованной системы для консистентного дизайна
  const cardStyles = getCardStyles(theme, 'primary'); // Стили для основных карточек
  const primaryButtonStyles = getButtonStyles(theme, 'primary'); // Стили для основных кнопок  
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary'); // Стили для вторичных кнопок
  const textFieldStyles = getTextFieldStyles(theme, 'filled'); // Стили для полей ввода

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
    enableReinitialize: true, // Автоматически перезагружает значения при изменении initialValues
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        if (isEditing && id) {
          await updateCategory({ id, data: values }).unwrap();
        } else {
          await createCategory(values).unwrap();
        }
        navigate('/services');
      } catch (error: any) {
        setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');
      }
    },
  });

  // Состояние загрузки для режима редактирования
  if (isEditing && isLoading) {
    return (
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: SIZES.spacing.xl }}>
      {/* Заголовок страницы с кнопкой "Назад" */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: SIZES.spacing.xl 
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/services')}
          sx={{
            ...secondaryButtonStyles,
            marginRight: SIZES.spacing.md,
          }}
        >
          Назад
        </Button>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: SIZES.fontSize.xl,
            fontWeight: 700,
          }}
        >
          {isEditing ? 'Редактировать категорию услуг' : 'Новая категория услуг'}
        </Typography>
      </Box>

      <Grid container spacing={SIZES.spacing.xl}>
        {/* Основная форма категории */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Card sx={cardStyles}>
            <CardContent sx={{ padding: SIZES.spacing.xl }}>
              <Typography 
                variant="h6" 
                sx={{
                  marginBottom: SIZES.spacing.lg,
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                }}
              >
                Информация о категории
              </Typography>

              {/* Отображение ошибок отправки формы */}
              {submitError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    marginBottom: SIZES.spacing.md,
                    borderRadius: SIZES.borderRadius.md,
                  }}
                >
                  {submitError}
                </Alert>
              )}

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
                  sx={{
                    ...textFieldStyles,
                    marginBottom: SIZES.spacing.md,
                  }}
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
                  sx={{
                    ...textFieldStyles,
                    marginBottom: SIZES.spacing.md,
                  }}
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
                  sx={{
                    ...textFieldStyles,
                    marginBottom: SIZES.spacing.md,
                  }}
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
                  sx={{ 
                    marginTop: SIZES.spacing.md,
                    marginBottom: SIZES.spacing.lg,
                  }}
                />

                {/* Кнопка сохранения формы */}
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting}
                    sx={primaryButtonStyles}
                  >
                    {isEditing ? 'Сохранить' : 'Создать'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Список услуг в категории (только при редактировании) */}
        {isEditing && id && (
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles}>
              <CardContent sx={{ padding: SIZES.spacing.xl }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    marginBottom: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600,
                  }}
                >
                  Услуги в категории
                </Typography>
                <Divider sx={{ 
                  marginBottom: SIZES.spacing.md,
                  borderColor: theme.palette.divider,
                }} />
                <ServicesList categoryId={id} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ServiceFormPage;
