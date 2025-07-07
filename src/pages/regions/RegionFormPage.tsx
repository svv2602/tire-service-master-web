/**
 * RegionFormPage - Страница формы создания/редактирования региона
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
import { useTranslation } from 'react-i18next';
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
const createValidationSchema = (t: any) => Yup.object({
  name: Yup.string()
    .required(t('forms.region.validation.nameRequired'))
    .min(2, t('forms.region.validation.nameMin'))
    .max(100, t('forms.region.validation.nameMax')),
  code: Yup.string()
    .required(t('forms.region.validation.codeRequired'))
    .min(2, t('forms.region.validation.codeMin'))
    .max(10, t('forms.region.validation.codeMax')),
  is_active: Yup.boolean(),
});

/**
 * RegionFormPage - Основной компонент страницы формы региона
 * Поддерживает создание новых регионов и редактирование существующих
 */
export const RegionFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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
    validationSchema: createValidationSchema(t),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        setSuccessMessage('');
        if (isEditing && id) {
          await updateRegion({ id: parseInt(id), region: values }).unwrap();
          setSuccessMessage(t('forms.region.messages.updateSuccess'));
        } else {
          await createRegion(values).unwrap();
          setSuccessMessage(t('forms.region.messages.createSuccess'));
        }
        setTimeout(() => navigate('/admin/regions'), 1000);
      } catch (error: any) {
        console.error('Submit error:', error);
        
        // Обработка ошибок валидации от API
        if (error?.data?.errors) {
          const errorMessages = Array.isArray(error.data.errors) 
            ? error.data.errors.join(', ')
            : Object.values(error.data.errors).flat().join(', ');
          setSubmitError(errorMessages);
        } else if (error?.data?.message) {
          setSubmitError(error.data.message);
        } else if (error?.status === 422) {
          setSubmitError(t('forms.region.messages.validationError'));
        } else {
          setSubmitError(t('forms.region.messages.saveError'));
        }
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
          {t('forms.region.loading')}
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
          {t('forms.common.back')}
        </Button>
        <Typography variant="h4" component="h1" sx={formStyles.title}>
          {isEditing ? t('forms.region.title.edit') : t('forms.region.title.create')}
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
        {/* Основная форма региона */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Box sx={formStyles.formCard}>
            <Typography variant="h6" sx={formStyles.sectionTitle}>
              {t('forms.region.sections.regionInfo')}
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Поле ввода названия региона */}
              <TextField
                fullWidth
                name="name"
                label={t('forms.region.fields.name')}
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
                label={t('forms.region.fields.code')}
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
                label={t('forms.region.fields.isActive')}
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
                  {isEditing ? t('forms.common.update') : t('forms.common.create')}
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
