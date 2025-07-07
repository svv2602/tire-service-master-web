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
import { useTranslation } from 'react-i18next';
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
const createValidationSchema = (t: any) => Yup.object({
  name: Yup.string()
    .required(t('forms.carBrand.validation.nameRequired'))
    .min(2, t('forms.carBrand.validation.nameMin'))
    .max(100, t('forms.carBrand.validation.nameMax')),
  is_active: Yup.boolean(),
});

// Константы для работы с файлами (синхронизированы с бэкендом)
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB (как на бэкенде)
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png']; // Только JPEG и PNG как на бэкенде

/**
 * CarBrandFormPage - Основной компонент страницы формы бренда автомобиля
 * Поддерживает создание новых брендов и редактирование существующих
 */
export const CarBrandFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
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
    validationSchema: createValidationSchema(t),
    enableReinitialize: true, // Автоматически перезагружает значения при изменении initialValues
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        setSuccessMessage('');
        
        if (isEditing && id) {
          // Для редактирования используем только измененные поля
          const updateData: Partial<CarBrandFormData> = {
            name: values.name,
            is_active: values.is_active,
          };
          
          // Добавляем logo только если это новый файл (File объект)
          // Если logo это строка (URL), значит логотип не изменился и не нужно его отправлять
          if (values.logo instanceof File) {
            updateData.logo = values.logo;
            console.log('Logo is a File, will use FormData');
          } else if (values.logo === null) {
            // Если logo === null, значит пользователь удалил логотип
            updateData.logo = null;
            console.log('Logo is null, will remove logo');
          } else {
            // Если logo это строка (URL), не отправляем его - логотип не изменился
            console.log('Logo is URL string, not sending logo field');
          }
          
          console.log('Update data:', {
            ...updateData,
            logo: updateData.logo ? 'File object' : updateData.logo
          });
          console.log('Logo type:', typeof values.logo, values.logo?.constructor?.name);
          
          await updateBrand({ id, data: updateData }).unwrap();
          setSuccessMessage(t('forms.carBrand.messages.updateSuccess'));
        } else {
          // Для создания используем полный объект
          const createData: CarBrandFormData = {
            name: values.name,
            is_active: values.is_active,
            logo: values.logo instanceof File ? values.logo : null,
          };
          
          console.log('Sending create data:', createData);
          await createBrand(createData).unwrap();
          setSuccessMessage(t('forms.carBrand.messages.createSuccess'));
        }
        setTimeout(() => navigate('/admin/car-brands'), 1000);
      } catch (error: any) {
        console.error('Submit error:', error);
        
        // Обработка ошибок валидации от API
        if (error?.data?.errors) {
          // Если есть массив ошибок (например, для валидации полей)
          const errorMessages = Array.isArray(error.data.errors) 
            ? error.data.errors.join(', ')
            : Object.values(error.data.errors).flat().join(', ');
          setSubmitError(errorMessages);
        } else if (error?.data?.message) {
          setSubmitError(error.data.message);
        } else if (error?.status === 422) {
          setSubmitError(t('forms.carBrand.messages.validationError'));
        } else {
          setSubmitError(t('forms.carBrand.messages.saveError'));
        }
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
        setSubmitError(t('forms.carBrand.messages.fileSizeError'));
        return;
      }

      // Валидация типа файла
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setSubmitError(t('forms.carBrand.messages.fileTypeError'));
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
          {t('forms.carBrand.loading')}
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
          {t('common.back')}
        </Button>
        <Typography variant="h4" component="h1" sx={formStyles.title}>
          {isEditing ? t('forms.carBrand.title.edit') : t('forms.carBrand.title.create')}
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
        {/* Основная форма бренда */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Box sx={formStyles.formCard}>
            <Typography variant="h6" sx={formStyles.sectionTitle}>
              {t('forms.carBrand.sections.brandInfo')}
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Поле ввода названия бренда */}
              <TextField
                fullWidth
                name="name"
                label={t('forms.carBrand.fields.name')}
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
                  {t('forms.carBrand.fields.logo')}
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
                           {t('forms.carBrand.buttons.uploadLogo')}
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
                  {t('forms.carBrand.messages.logoRequirements')}
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
                label={t('forms.carBrand.fields.isActive')}
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
                  {isEditing ? t('common.save') : t('common.create')}
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