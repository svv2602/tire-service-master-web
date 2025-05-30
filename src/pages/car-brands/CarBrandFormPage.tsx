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
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  BrokenImage as BrokenImageIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
  useGetCarBrandByIdQuery,
} from '../../api';
import { CarBrandFormData } from '../../types/car';
import Notification from '../../components/Notification';
import CarModelsList from '../../components/CarModelsList';
import config from '../../config';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название бренда обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
});

// Максимальный размер файла (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Допустимые типы файлов
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const CarBrandFormPage: React.FC = () => {
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

  // Состояние для ошибки загрузки изображения
  const [imageError, setImageError] = useState<string | null>(null);

  // RTK Query хуки
  const { data: brandData, isLoading: isLoadingBrand } = useGetCarBrandByIdQuery(id ?? '', {
    skip: !isEditMode,
  });
  const [createBrand, { isLoading: isCreating }] = useCreateCarBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateCarBrandMutation();

  // Состояние для предпросмотра изображения
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);

  // Formik
  const formik = useFormik<CarBrandFormData>({
    initialValues: {
      name: '',
      logo: null,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode && id) {
          await updateBrand({ id, data: values }).unwrap();
          setNotification({
            open: true,
            message: 'Бренд успешно обновлен',
            severity: 'success',
          });
        } else {
          await createBrand(values).unwrap();
          setNotification({
            open: true,
            message: 'Бренд успешно создан',
            severity: 'success',
          });
        }
        // Возвращаемся к списку после успешного сохранения
        setTimeout(() => navigate('/car-brands'), 1500);
      } catch (error: any) {
        console.error('Error saving brand:', error);
        let errorMessage = 'Произошла ошибка при сохранении бренда';
        
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
              [field.replace('car_brand.', '')]: messages[0]
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
    if (brandData) {
      formik.setValues({
        name: brandData.name,
        logo: null,
        is_active: brandData.is_active,
      });
      
      // Устанавливаем URL логотипа для предпросмотра
      if (brandData.logo) {
        try {
          // Проверяем, является ли URL абсолютным или относительным
          const logoUrl = brandData.logo.startsWith('http') || brandData.logo.startsWith('data:') || brandData.logo.startsWith('/storage/') 
            ? brandData.logo 
            : `${config.API_URL}${brandData.logo}`;
          setLogoPreview(logoUrl);
          setLogoError(false);
          setImageError(null);
        } catch (error) {
          console.error('Error setting logo preview:', error);
          setLogoError(true);
          setImageError('Ошибка при загрузке изображения');
        }
      } else {
        setLogoPreview(null);
        setLogoError(false);
        setImageError(null);
      }
    }
  }, [brandData]);

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    console.error('Image loading error for:', brandData?.logo);
    setLogoError(true);
    setImageError('Ошибка при загрузке изображения');
    
    // Если изображение не загрузилось, пробуем загрузить его снова с правильным URL
    if (brandData?.logo) {
      try {
        const logoUrl = brandData.logo.startsWith('http') || brandData.logo.startsWith('data:') || brandData.logo.startsWith('/storage/') 
          ? brandData.logo 
          : `${config.API_URL}${brandData.logo}`;
        setLogoPreview(logoUrl);
      } catch (error) {
        console.error('Error retrying logo load:', error);
      }
    }
  };

  // Обработчик загрузки изображения
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);
    setLogoError(false);

    if (file) {
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setImageError('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверка типа файла
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setImageError('Допустимые форматы: JPEG, PNG, GIF, WebP');
        return;
      }

      formik.setFieldValue('logo', file);
      
      // Создаем URL для предпросмотра
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      
      // Очищаем URL при размонтировании компонента
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Обработчик удаления изображения
  const handleLogoDelete = () => {
    formik.setFieldValue('logo', null);
    setLogoPreview(null);
    setLogoError(false);
    setImageError(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoadingBrand) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/car-brands')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {isEditMode ? 'Редактирование бренда' : 'Создание бренда'}
        </Typography>
      </Box>

      {isLoadingBrand ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Название бренда"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Логотип
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {logoPreview ? (
                    <Box position="relative">
                      <Avatar
                        src={logoPreview}
                        alt="Brand logo"
                        variant="rounded"
                        sx={{ width: 100, height: 100 }}
                        onError={handleImageError}
                      />
                      {logoError && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          width="100%"
                          height="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bgcolor="rgba(0, 0, 0, 0.5)"
                        >
                          <BrokenImageIcon sx={{ color: 'white' }} />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{ width: 100, height: 100, bgcolor: 'grey.200' }}
                    >
                      <BrokenImageIcon sx={{ color: 'grey.400' }} />
                    </Avatar>
                  )}
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-upload"
                      type="file"
                      onChange={handleLogoChange}
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        Загрузить
                      </Button>
                    </label>
                    {logoPreview && (
                      <IconButton
                        color="error"
                        onClick={handleLogoDelete}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {imageError && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {imageError}
                  </Typography>
                )}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) =>
                      formik.setFieldValue('is_active', e.target.checked)
                    }
                    name="is_active"
                  />
                }
                label="Активен"
              />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </Box>
            </Box>
          </form>

          {isEditMode && id && (
            <>
              <Divider sx={{ my: 3 }} />
              <CarModelsList brandId={id} />
            </>
          )}
        </Paper>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CarBrandFormPage; 