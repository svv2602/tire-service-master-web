// Форма создания и редактирования брендов автомобилей
// Использует централизованную систему стилей для единообразия интерфейса

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  IconButton,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  BrokenImage as BrokenImageIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
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
// Импорты централизованной системы стилей
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles 
} from '../../styles/components';
import { SIZES } from '../../styles/theme';

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

/**
 * Страница формы бренда автомобиля - создание и редактирование брендов
 * 
 * Функциональность:
 * - Создание нового бренда автомобиля
 * - Редактирование существующего бренда
 * - Загрузка и управление логотипом бренда  
 * - Валидация полей формы с помощью Yup
 * - Интеграция с RTK Query для API операций
 * - Централизованная система стилей для консистентного UI
 * 
 * Разделы формы:
 * - Основная информация (название бренда)
 * - Загрузка логотипа с предпросмотром
 * - Настройки активности бренда
 * - Список моделей автомобилей (только при редактировании)
 */
const CarBrandFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEditMode = Boolean(id);

  // Формируем стили с помощью централизованной системы
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const outlinedButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandData]); // Не включаем formik в зависимости, так как это приведет к бесконечной перерисовке

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
    <Box sx={{ 
      maxWidth: 1000, 
      mx: 'auto', 
      p: SIZES.spacing.lg 
    }}>
      {/* Заголовок и навигация */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <IconButton 
          onClick={() => navigate('/car-brands')} 
          sx={{ 
            mr: SIZES.spacing.md,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4"
          sx={{
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          {isEditMode ? 'Редактирование бренда' : 'Создание бренда'}
        </Typography>
      </Box>

      {/* Показать индикатор загрузки при получении данных */}
      {isLoadingBrand ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={cardStyles}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={SIZES.spacing.lg}>
              {/* Основная информация */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    mb: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Основная информация
                </Typography>
              </Grid>
              
              {/* Название бренда */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Название бренда"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  required
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Статус активности */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '100%' 
                }}>
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
                    label="Активный бренд"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: SIZES.fontSize.md,
                        color: theme.palette.text.primary,
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Управление логотипом */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    mt: SIZES.spacing.md,
                    mb: SIZES.spacing.md,
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Логотип бренда
                </Typography>
                
                <Grid container spacing={SIZES.spacing.md} alignItems="center">
                  {/* Предпросмотр логотипа */}
                  <Grid item>
                    {logoPreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={logoPreview}
                          alt="Логотип бренда"
                          variant="rounded"
                          sx={{ 
                            width: 100, 
                            height: 100,
                            border: `2px solid ${theme.palette.divider}`,
                          }}
                          onError={handleImageError}
                        />
                        {logoError && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(0, 0, 0, 0.5)',
                              borderRadius: SIZES.borderRadius.md,
                            }}
                          >
                            <BrokenImageIcon sx={{ color: 'white' }} />
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          bgcolor: theme.palette.grey[200],
                          border: `2px solid ${theme.palette.divider}`,
                        }}
                      >
                        <BrokenImageIcon sx={{ color: theme.palette.grey[400] }} />
                      </Avatar>
                    )}
                  </Grid>
                  
                  {/* Кнопки управления логотипом */}
                  <Grid item>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: SIZES.spacing.sm 
                    }}>
                      <input
                        accept="image/*"
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoChange}
                        hidden
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={outlinedButtonStyles}
                        >
                          Загрузить логотип
                        </Button>
                      </label>
                      {logoPreview && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleLogoDelete}
                          sx={{
                            ...outlinedButtonStyles,
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: theme.palette.error.main,
                              color: theme.palette.error.contrastText,
                            },
                          }}
                        >
                          Удалить
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Информация об ограничениях файла */}
                <Typography 
                  variant="caption" 
                  color="textSecondary" 
                  sx={{ 
                    mt: SIZES.spacing.sm,
                    display: 'block',
                    fontSize: SIZES.fontSize.sm,
                  }}
                >
                  Допустимые форматы: JPEG, PNG, GIF, WebP. Максимальный размер: 5 МБ
                </Typography>
                
                {/* Отображение ошибки загрузки */}
                {imageError && (
                  <Typography 
                    color="error" 
                    variant="caption" 
                    sx={{ 
                      mt: SIZES.spacing.sm,
                      display: 'block',
                      fontSize: SIZES.fontSize.sm,
                    }}
                  >
                    {imageError}
                  </Typography>
                )}
              </Grid>

              {/* Кнопки действий */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  gap: SIZES.spacing.md,
                  mt: SIZES.spacing.lg,
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/car-brands')}
                    disabled={isCreating || isUpdating}
                    sx={outlinedButtonStyles}
                  >
                    Отмена
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? undefined : <SaveIcon />}
                    disabled={isCreating || isUpdating}
                    sx={buttonStyles}
                  >
                    {isCreating || isUpdating ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      isEditMode ? 'Сохранить изменения' : 'Создать бренд'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Список моделей автомобилей (только при редактировании) */}
          {isEditMode && id && (
            <>
              <Divider sx={{ 
                my: SIZES.spacing.xl,
                borderColor: theme.palette.divider,
              }} />
              <CarModelsList brandId={id} />
            </>
          )}
        </Paper>
      )}

      {/* Компонент уведомлений */}
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