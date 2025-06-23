/**
 * RegionFormPage - Страница формы создания/редактирования региона
 * ТЕСТ: Проверка применения изменений - границы удалены
 * 
 * Функциональность:
 * - Создание нового региона
 * - Редактирование существующего региона
 * - Валидация данных формы с использованием Yup
 * - Отображение списка городов в регионе (только при редактировании)
 * - Централизованная система стилей для консистентного дизайна
 * - Двухколоночная раскладка при редактировании
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useGetRegionByIdQuery,
} from '../../api/regions.api';
import { RegionFormData } from '../../types/models';
import { Button } from '../../components/ui';
import CitiesList from '../../components/CitiesList';
import { getFormStyles, SIZES } from '../../styles';

/**
 * Схема валидации формы региона
 * Определяет правила валидации для всех полей формы
 */
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название региона обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  code: Yup.string()
    .required('Код региона обязателен')
    .min(2, 'Код должен содержать минимум 2 символа')
    .max(10, 'Код не должен превышать 10 символов'),
  is_active: Yup.boolean(),
});

/**
 * RegionFormPage - Основной компонент страницы формы региона
 * Поддерживает создание новых регионов и редактирование существующих
 */
export const RegionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');

  // RTK Query хуки для работы с API регионов
  const { data: regionData, isLoading } = useGetRegionByIdQuery(parseInt(id ?? '0'), {
    skip: !isEditing,
  });
  const [createRegion] = useCreateRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();

  /**
   * Конфигурация Formik для управления состоянием формы
   * Включает валидацию, обработку отправки и начальные значения
   */
  const formik = useFormik<RegionFormData>({
    initialValues: {
      name: regionData?.name || '',
      code: regionData?.code || '',
      is_active: regionData?.is_active ?? true,
    },
    validationSchema,
    enableReinitialize: true, // Автоматически перезагружает значения при изменении initialValues
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        if (isEditing && id) {
          await updateRegion({ id: parseInt(id), region: values }).unwrap();
        } else {
          await createRegion(values).unwrap();
        }
        navigate('/admin/regions');
      } catch (error: any) {
        console.error('Submit error:', error);
        setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');
      }
    },
  });

  /**
   * Обработчик возврата к списку регионов
   */
  const handleBack = () => {
    navigate('/admin/regions');
  };

  // Состояние загрузки для режима редактирования
  if (isEditing && isLoading) {
    return (
      <Box sx={formStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: theme.spacing(SIZES.spacing.md) }}>
          Загрузка региона...
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
          {isEditing ? 'Редактировать регион' : 'Новый регион'}
        </Typography>
      </Box>

      <Grid container spacing={theme.spacing(SIZES.spacing.xl)}>
        {/* Основная форма региона */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Box sx={formStyles.formCard}>
            <Typography variant="h6" sx={formStyles.sectionTitle}>
              Информация о регионе
            </Typography>

            {/* Отображение ошибок отправки формы */}
            {submitError && (
              <Alert 
                severity="error" 
                sx={formStyles.errorAlert}
              >
                {submitError}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Поле ввода названия региона */}
              <TextField
                fullWidth
                name="name"
                label="Название региона"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={formStyles.field}
              />

              {/* Поле ввода кода региона */}
              <TextField
                fullWidth
                name="code"
                label="Код региона"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                sx={formStyles.field}
              />

              {/* Переключатель активности региона */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активен"
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

        {/* Список городов региона (только при редактировании) */}
        {isEditing && id && (
          <Grid item xs={12} md={6}>
            <CitiesList regionId={id} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RegionFormPage;
