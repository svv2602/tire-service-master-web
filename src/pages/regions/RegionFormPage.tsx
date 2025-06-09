import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
  Grid,
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
import CitiesList from '../../components/CitiesList';
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';

// Импорты UI компонентов
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Snackbar } from '../../components/ui/Snackbar';

/**
 * Схема валидации для формы региона
 * Определяет правила валидации полей региона:
 * - Название: от 2 до 100 символов (обязательно)
 * - Код: от 2 до 10 символов (обязательно)
 * - Статус активности: булево значение
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
 * Компонент формы создания/редактирования региона
 * Поддерживает два режима работы:
 * - Создание нового региона (без ID в URL)
 * - Редактирование существующего региона (с ID в URL + список городов)
 * 
 * Особенности:
 * - В режиме редактирования показывает список городов региона
 * - Уведомления об успешном сохранении/ошибках
 * - Валидация полей с помощью Yup
 * 
 * Использует централизованную систему стилей для консистентного UI
 */

const RegionFormPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Централизованные стили
  const cardStyles = getCardStyles(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme);

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // RTK Query хуки
  const { data: regionData, isLoading: isLoadingRegion } = useGetRegionByIdQuery(parseInt(id ?? '0'), {
    skip: !isEditMode,
  });
  const [createRegion, { isLoading: isCreating }] = useCreateRegionMutation();
  const [updateRegion, { isLoading: isUpdating }] = useUpdateRegionMutation();

  // Formik
  const formik = useFormik<RegionFormData>({
    initialValues: {
      name: regionData?.name || '',
      code: regionData?.code || '',
      is_active: regionData?.is_active ?? true,
    },
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении regionData
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode && id) {
          await updateRegion({ id: parseInt(id), region: values }).unwrap();
          setNotification({
            open: true,
            message: 'Регион успешно обновлен',
            severity: 'success',
          });
        } else {
          await createRegion(values).unwrap();
          setNotification({
            open: true,
            message: 'Регион успешно создан',
            severity: 'success',
          });
        }
        // Возвращаемся к списку после успешного сохранения
        setTimeout(() => navigate('/regions'), 1500);
      } catch (error: any) {
        console.error('Error saving region:', error);
        let errorMessage = 'Произошла ошибка при сохранении региона';
        
        if (error.data?.errors) {
          // Обработка ошибок валидации от Rails
          const errors = error.data.errors as Record<string, string[]>;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
            
          // Устанавливаем ошибки в форму
          formik.setErrors(
            Object.entries(errors).reduce((acc, [field, messages]) => ({
              ...acc,
              [field.replace('region.', '')]: messages[0]
            }), {} as Record<string, string>)
          );
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    },
  });

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    navigate('/regions');
  };

  // Отображение состояния загрузки
  if (isEditMode && isLoadingRegion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <Box sx={{ padding: SIZES.spacing.xl }}>
      {/* Заголовок и кнопка назад */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: SIZES.spacing.xl 
      }}>
        <IconButton
          onClick={handleBack}
          sx={{ 
            marginRight: SIZES.spacing.sm,
            ...secondaryButtonStyles,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4"
          sx={{
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
          }}
        >
          {isEditMode ? 'Редактирование региона' : 'Создание региона'}
        </Typography>
      </Box>

      <Grid container spacing={SIZES.spacing.xl}>
        {/* Форма региона */}
        <Grid item xs={12} md={isEditMode ? 6 : 12}>
          <Box sx={cardStyles}>
            <Typography 
              variant="h6" 
              sx={{
                marginBottom: SIZES.spacing.lg,
                fontSize: SIZES.fontSize.lg,
                fontWeight: 600,
              }}
            >
              Информация о регионе
            </Typography>
            
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ marginTop: SIZES.spacing.lg }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название региона"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                required
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                id="code"
                name="code"
                label="Код региона"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                margin="normal"
                required
                sx={textFieldStyles}
              />

              <Switch
                id="is_active"
                name="is_active"
                checked={formik.values.is_active}
                onChange={(checked) => formik.setFieldValue('is_active', checked)}
                label="Активен"
                sx={{ marginTop: SIZES.spacing.lg }}
              />

              <Box sx={{ 
                marginTop: SIZES.spacing.xl, 
                display: 'flex', 
                gap: SIZES.spacing.md 
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={isSaving}
                  sx={primaryButtonStyles}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={isSaving}
                  sx={secondaryButtonStyles}
                >
                  Отмена
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Список городов (только при редактировании) */}
        {isEditMode && id && (
          <Grid item xs={12} md={6}>
            <Box sx={cardStyles}>
              <Typography 
                variant="h6" 
                sx={{
                  marginBottom: SIZES.spacing.lg,
                  fontSize: SIZES.fontSize.lg,
                  fontWeight: 600,
                }}
              >
                Города региона
              </Typography>
              <Divider sx={{ marginBottom: SIZES.spacing.lg }} />
              <CitiesList regionId={id} />
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default RegionFormPage;
