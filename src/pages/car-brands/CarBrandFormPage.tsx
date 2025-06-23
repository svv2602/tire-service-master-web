/**
 * CarBrandFormPage - Страница формы создания/редактирования бренда автомобиля
 * 
 * Функциональность:
 * - Создание нового бренда автомобиля
 * - Редактирование существующего бренда
 * - Загрузка и управление логотипом бренда
 * - Валидация данных формы с использованием Yup
 * - Отображение списка моделей в бренде (только при редактировании)
 * - Централизованная система стилей для консистентного дизайна
 * - Двухколоночная раскладка при редактировании
 */

import React, { useState, useEffect } from 'react';
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
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  BrokenImage as BrokenImageIcon,
} from '@mui/icons-material';
import {
  useGetCarBrandByIdQuery,
  useCreateCarBrandMutation,
  useUpdateCarBrandMutation,
} from '../../api';
import { CarBrandFormData } from '../../types/car';
import { Button } from '../../components/ui';
import CarModelsList from '../../components/CarModelsList';
import config from '../../config';
import { getFormStyles, SIZES } from '../../styles';

/**
 * Схема валидации формы бренда автомобиля
 * Определяет правила валидации для всех полей формы
 */
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название бренда обязательно')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  is_active: Yup.boolean(),
});

// Константы для работы с файлами
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * CarBrandFormPage - Основной компонент страницы формы бренда автомобиля
 * Поддерживает создание новых брендов и редактирование существующих
 */
export const CarBrandFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // RTK Query хуки для работы с API брендов
  const { data: brand, isLoading } = useGetCarBrandByIdQuery(id!, {
    skip: !isEditing,
  });

  const [createBrand] = useCreateCarBrandMutation();
  const [updateBrand] = useUpdateCarBrandMutation();

  /**
   * Конфигурация Formik для управления состоянием формы
   * Включает валидацию, обработку отправки и начальные значения
   */
  const formik = useFormik<CarBrandFormData>({
    initialValues: {
      name: brand?.name || '',
      logo: null,
      is_active: brand?.is_active ?? true,
    },
    validationSchema,
    enableReinitialize: true, // Автоматически перезагружает значения при изменении initialValues
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        
        if (isEditing && id) {
          // Для редактирования используем только измененные поля
          const updateData: Partial<CarBrandFormData> = {
            name: values.name,
            is_active: values.is_active,
          };
          
          // Добавляем logo только если это файл
          if (values.logo instanceof File) {
            updateData.logo = values.logo;
            console.log('Logo is a File, will use FormData');
          } else {
            console.log('Logo is not a File, will use JSON');
          }
          
          console.log('Update data:', {
            ...updateData,
            logo: updateData.logo ? 'File object' : updateData.logo
          });
          console.log('Logo type:', typeof values.logo, values.logo?.constructor?.name);
          
          await updateBrand({ id, data: updateData }).unwrap();
        } else {
          // Для создания используем полный объект
          const createData: CarBrandFormData = {
            name: values.name,
            is_active: values.is_active,
            logo: values.logo instanceof File ? values.logo : null,
          };
          
          console.log('Sending create data:', createData);
          await createBrand(createData).unwrap();
        }
        navigate('/admin/car-brands');
      } catch (error: any) {
        console.error('Submit error:', error);
        setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');
      }
    },
  });

  /**
   * Обработчик возврата к списку брендов
   */
  const handleBack = () => {
    navigate('/admin/car-brands');
  };

  /**
   * Обработчик изменения логотипа
   */
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Валидация размера файла
      if (file.size > MAX_FILE_SIZE) {
        setSubmitError('Размер файла не должен превышать 5MB');
        return;
      }

      // Валидация типа файла
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setSubmitError('Поддерживаются только изображения в форматах JPEG, PNG, GIF, WebP');
        return;
      }

      formik.setFieldValue('logo', file);
      
      // Создание предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Обработчик удаления логотипа
   */
  const handleLogoDelete = () => {
    formik.setFieldValue('logo', null);
    setLogoPreview(null);
  };

  // Эффект для установки предпросмотра логотипа при редактировании
  useEffect(() => {
    if (brand?.logo) {
      const logoUrl = brand.logo.startsWith('http') || brand.logo.startsWith('/storage/')
        ? brand.logo
        : `${config.API_URL}${brand.logo}`;
      setLogoPreview(logoUrl);
    }
  }, [brand]);

  // Состояние загрузки для режима редактирования
  if (isEditing && isLoading) {
    return (
      <Box sx={formStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: theme.spacing(SIZES.spacing.md) }}>
          Загрузка бренда...
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
          {isEditing ? 'Редактировать бренд автомобиля' : 'Новый бренд автомобиля'}
        </Typography>
      </Box>

      <Grid container spacing={theme.spacing(SIZES.spacing.xl)}>
        {/* Основная форма бренда */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Box sx={formStyles.formCard}>
            <Typography variant="h6" sx={formStyles.sectionTitle}>
              Информация о бренде
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
              {/* Поле ввода названия бренда */}
              <TextField
                fullWidth
                name="name"
                label="Название бренда"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={formStyles.field}
              />

              {/* Секция управления логотипом */}
              <Box sx={formStyles.field}>
                <Typography variant="subtitle2" sx={{ mb: theme.spacing(SIZES.spacing.sm) }}>
                  Логотип бренда
                </Typography>
                
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(SIZES.spacing.md) }}>
                   {/* Предпросмотр логотипа */}
                   <Avatar
                     src={logoPreview || undefined}
                     variant="square"
                     sx={{
                       width: 80,
                       height: 80,
                       bgcolor: theme.palette.grey[200],
                     }}
                   >
                     {!logoPreview && <BrokenImageIcon />}
                   </Avatar>

                   {/* Кнопки управления логотипом */}
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(SIZES.spacing.sm) }}>
                     <input
                       accept="image/*"
                       id="logo-upload"
                       type="file"
                       onChange={handleLogoChange}
                       style={{ display: 'none' }}
                     />
                     <label htmlFor="logo-upload">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(SIZES.spacing.sm), cursor: 'pointer' }}>
                         <IconButton color="primary" component="span">
                           <UploadIcon />
                         </IconButton>
                         <Typography variant="body2" color="primary">
                           Загрузить лого
                         </Typography>
                       </Box>
                     </label>
                     
                     {logoPreview && (
                       <IconButton color="error" onClick={handleLogoDelete}>
                         <DeleteIcon />
                       </IconButton>
                     )}
                   </Box>
                 </Box>

                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Поддерживаются форматы: JPEG, PNG, GIF, WebP. Максимальный размер: 5MB
                </Typography>
              </Box>

              {/* Переключатель активности бренда */}
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

        {/* Список моделей в бренде (только при редактировании) */}
        {isEditing && id && (
          <Grid item xs={12} md={6}>
            <CarModelsList brandId={id} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CarBrandFormPage; 