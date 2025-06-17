import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
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

// Импорты UI компонентов
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
} from '../../components/ui';

// Импорт централизованных стилей
import { getFormStyles } from '../../styles/components';

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

  // Инициализация централизованных стилей
  const formStyles = getFormStyles(theme);

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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <Box sx={{ padding: theme.spacing(3) }}>
      {/* Заголовок и кнопка назад */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: theme.spacing(3)
      }}>
        <IconButton
          onClick={handleBack}
          sx={{ 
            marginRight: theme.spacing(1),
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4"
          sx={formStyles.sectionTitle}
        >
          {isEditMode ? 'Редактирование региона' : 'Создание региона'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Форма региона */}
        <Grid item xs={12} md={isEditMode ? 6 : 12}>
          <Box sx={formStyles.container}>
            <Typography 
              variant="h6" 
              sx={formStyles.sectionTitle}
            >
              Информация о регионе
            </Typography>
            
            <Box component="form" onSubmit={formik.handleSubmit} sx={formStyles.section}>
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
                sx={formStyles.field}
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
                sx={formStyles.field}
              />

              <Switch
                id="is_active"
                name="is_active"
                checked={formik.values.is_active}
                onChange={(event, checked) => formik.setFieldValue('is_active', checked)}
                label="Активен"
                sx={{ marginTop: theme.spacing(2) }}
              />

              <Box sx={{ 
                marginTop: theme.spacing(3), 
                display: 'flex', 
                gap: 2
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={isSaving}
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
            <CitiesList regionId={id} />
          </Grid>
        )}
      </Grid>

      {/* Уведомления - используем старый Snackbar пока не создадим централизованную систему */}
      {notification.open && (
        <Box sx={{
          position: 'fixed',
          top: theme.spacing(2),
          right: theme.spacing(2),
          zIndex: 9999,
          padding: theme.spacing(2),
          backgroundColor: notification.severity === 'error' ? theme.palette.error.main : theme.palette.success.main,
          color: theme.palette.common.white,
          borderRadius: theme.shape.borderRadius,
          minWidth: 300,
        }}>
          <Typography>{notification.message}</Typography>
          <Button 
            size="small" 
            onClick={handleCloseNotification}
            sx={{ color: 'inherit', marginTop: 1 }}
          >
            Закрыть
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RegionFormPage;
