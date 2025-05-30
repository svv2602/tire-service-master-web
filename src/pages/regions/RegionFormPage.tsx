import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  IconButton,
  Divider,
  Grid,
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
import Notification from '../../components/Notification';
import CitiesList from '../../components/CitiesList';

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

const RegionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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
      name: '',
      code: '',
      is_active: true,
    },
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

  // Эффект для установки начальных значений при редактировании
  useEffect(() => {
    if (regionData) {
      formik.setValues({
        name: regionData.name,
        code: regionData.code,
        is_active: regionData.is_active,
      });
    }
  }, [regionData]);

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
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка назад */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование региона' : 'Создание региона'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Форма региона */}
        <Grid item xs={12} md={isEditMode ? 6 : 12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация о регионе
            </Typography>
            
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
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
              />

              <FormControlLabel
                control={
                  <Switch
                    id="is_active"
                    name="is_active"
                    checked={formik.values.is_active}
                    onChange={formik.handleChange}
                  />
                }
                label="Активен"
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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
          </Paper>
        </Grid>

        {/* Список городов (только при редактировании) */}
        {isEditMode && id && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Города региона
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <CitiesList regionId={id} />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default RegionFormPage;
