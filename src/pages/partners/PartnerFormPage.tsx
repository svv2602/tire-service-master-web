import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { 
  useGetPartnerByIdQuery, 
  useCreatePartnerMutation, 
  useUpdatePartnerMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
} from '../../api';
import { getRoleId } from '../../utils/roles.utils';
import { PartnerFormData } from '../../types/models';
import { SelectChangeEvent } from '@mui/material';
// Импорт централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles, SIZES } from '../../styles';

/**
 * Страница формы партнера - создание и редактирование партнеров
 * 
 * Функциональность:
 * - Создание нового партнера с данными пользователя
 * - Редактирование существующего партнера
 * - Валидация полей формы с помощью Yup
 * - Управление регионами и городами с каскадной загрузкой
 * - Интеграция с RTK Query для API операций
 * - Централизованная система стилей для консистентного UI
 * 
 * Разделы формы:
 * - Основная информация о компании (название, описание, контактное лицо, сайт, логотип)
 * - Юридическая информация (налоговый номер, юридический адрес)
 * - Местоположение (регион и город с каскадной загрузкой)
 * - Статус (активность партнера)
 * - Данные пользователя (только при создании - имя, фамилия, email, телефон, пароль)
 */

// Определяем локальный интерфейс для формы пользователя
interface FormUserData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password?: string;
}

interface FormValues {
  company_name: string;
  company_description?: string;
  contact_person?: string;
  logo_url?: string;
  website?: string;
  tax_number?: string;
  legal_address?: string;
  region_id?: string;
  city_id?: string;
  is_active: boolean;
  user: FormUserData | null;
}

// Создаем типизированные версии touched и errors для пользователя (используются в полях формы)

// Функция для создания схемы валидации в зависимости от режима
const createValidationSchema = (isEdit: boolean) => yup.object({
  company_name: yup.string()
    .required('Название компании обязательно')
    .min(2, 'Название должно быть не менее 2 символов')
    .max(100, 'Название должно быть не более 100 символов'),
  
  company_description: yup.string()
    .max(2000, 'Описание должно быть не более 2000 символов')
    .nullable(),
  
  contact_person: yup.string()
    .required('Контактное лицо обязательно')
    .min(2, 'ФИО должно быть не менее 2 символов'),
  
  website: yup.string()
    .url('Введите корректный URL (например, https://example.com)')
    .nullable(),
  
  tax_number: yup.string()
    .nullable()
    .test('tax-number-format', 'Налоговый номер должен содержать от 8 до 15 цифр и дефисов', function(value) {
      if (!value) return true; // Если поле пустое, то валидация проходит
      return /^[0-9-]{8,15}$/.test(value);
    }),
  
  legal_address: yup.string()
    .required('Юридический адрес обязателен')
    .max(500, 'Адрес должен быть не более 500 символов'),
  
  logo_url: yup.string()
    .url('Введите корректный URL логотипа')
    .nullable(),
  
  region_id: yup.string()
    .required('Выберите регион'),
  
  city_id: yup.string()
    .required('Выберите город'),
  
  is_active: yup.boolean(),
  
  user: isEdit 
    ? yup.object().nullable() // При редактировании user может быть null
    : yup.object().shape({     // При создании user обязателен
        email: yup.string()
          .email('Введите корректный email')
          .required('Email обязателен'),
        phone: yup.string()
          .required('Телефон обязателен')
          .matches(/^\+?[0-9]{10,12}$/, 'Введите корректный номер телефона'),
        first_name: yup.string()
          .required('Имя обязательно')
          .min(2, 'Имя должно быть не менее 2 символов'),
        last_name: yup.string()
          .required('Фамилия обязательна')
          .min(2, 'Фамилия должна быть не менее 2 символов'),
        password: yup.string()
          .min(6, 'Пароль должен быть не менее 6 символов')
          .nullable(),
      }).required('Данные пользователя обязательны'),
});

const PartnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();
  
  // Централизованная система стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  // RTK Query хуки
  const { data: partner, isLoading: partnerLoading } = useGetPartnerByIdQuery(id ? parseInt(id) : 0, {
    skip: !id,
  });
  const { data: regionsData } = useGetRegionsQuery({});
  
  // Обновляем логику запроса городов
  const regionIdForCities = useMemo(() => {
    if (partner && isEdit && partner.region_id) {
      return partner.region_id;
    }
    return selectedRegionId ? Number(selectedRegionId) : undefined;
  }, [partner, isEdit, selectedRegionId]);
  
  const { data: citiesData } = useGetCitiesQuery(
    { 
      region_id: regionIdForCities || undefined,
      page: 1,
      per_page: 100
    }, 
    { skip: !regionIdForCities }
  );
  
  const [createPartner, { isLoading: createLoading }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: updateLoading }] = useUpdatePartnerMutation();

  // Состояние для управления ошибками API и сообщениями успеха
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Функция для извлечения понятного сообщения об ошибке из API ответа
  const extractErrorMessage = (error: any): string => {
    if (!error) return 'Произошла неизвестная ошибка';
    
    console.log('Полная информация об ошибке:', error);
    
    // Обрабатываем ошибки парсинга
    if (error.status === 'PARSING_ERROR' && error.data) {
      try {
        // Пытаемся извлечь JSON из строки
        const jsonMatch = error.data.match(/\{.*\}/);
        if (jsonMatch) {
          const parsedError = JSON.parse(jsonMatch[0]);
          if (parsedError.errors) {
            return extractErrorsFromObject(parsedError.errors);
          }
        }
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
      }
      
      // Если не удалось распарсить, пытаемся извлечь читаемое сообщение
      if (typeof error.data === 'string') {
        // Ищем сообщения об ошибках в строке
        if (error.data.includes('Email has already')) {
          return 'Пользователь с таким email уже существует. Используйте другой email или войдите под существующим аккаунтом.';
        }
        return 'Ошибка обработки данных на сервере. Проверьте правильность заполнения формы.';
      }
    }
    
    // Проверяем различные форматы ошибок API
    if (error.data?.message) return error.data.message;
    if (error.data?.error) return error.data.error;
    
    if (error.data?.errors) {
      return extractErrorsFromObject(error.data.errors);
    }
    
    if (error.message) return error.message;
    
    return 'Ошибка при обработке запроса';
  };

  // Вспомогательная функция для извлечения ошибок из объекта
  const extractErrorsFromObject = (errors: any): string => {
    if (typeof errors === 'string') return errors;
    
    // Обрабатываем ошибки в формате { user: [...], partner: [...] }
    if (errors.user || errors.partner) {
      let errorMessages: string[] = [];
      if (errors.user) {
        errorMessages = [...errorMessages, ...errors.user];
      }
      if (errors.partner) {
        errorMessages = [...errorMessages, ...errors.partner];
      }
      return errorMessages.join('; ');
    }
    
    // Обрабатываем ошибки в формате { field1: [...], field2: [...] }
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
      .join('; ');
  };

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => {
    if (partner && isEdit) {
      return {
        company_name: partner.company_name || '',
        company_description: partner.company_description || '',
        contact_person: partner.contact_person || '',
        logo_url: partner.logo_url || '',
        website: partner.website || '',
        tax_number: partner.tax_number || '',
        legal_address: partner.legal_address || '',
        region_id: partner.region_id?.toString() || '',
        city_id: partner.city_id?.toString() || '',
        is_active: partner.is_active ?? true,
        user: null,
      };
    }
    return {
      company_name: '',
      company_description: '',
      contact_person: '',
      logo_url: '',
      website: '',
      tax_number: '', // Необязательное поле
      legal_address: '', // Обязательное поле
      region_id: '',
      city_id: '',
      is_active: true,
      user: {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        password: '',
      },
    };
  }, [partner, isEdit]);

  // Используем FormikProps для типизации
  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении initialValues
    validationSchema: createValidationSchema(isEdit),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Подготавливаем данные для отправки
        
        // Подготавливаем данные в формате, ожидаемом API
        const submitData: PartnerFormData = {
          company_name: values.company_name,
          company_description: values.company_description || undefined,
          contact_person: values.contact_person || undefined,
          logo_url: values.logo_url || undefined,
          website: values.website || undefined,
          tax_number: values.tax_number || undefined,
          legal_address: values.legal_address || undefined,
          region_id: values.region_id ? Number(values.region_id) : undefined,
          city_id: values.city_id ? Number(values.city_id) : undefined,
          is_active: values.is_active
        };
        
        // Добавляем пользовательские данные только при создании или если они определены
        if (values.user && (!isEdit || Object.values(values.user).some(v => v))) {
          submitData.user = {
            email: values.user.email,
            phone: values.user.phone || '',
            first_name: values.user.first_name,
            role_id: getRoleId('partner'),
            last_name: values.user.last_name,
            password: values.user.password || undefined,
            // Добавляем обязательные поля, которых нет в форме
            is_active: true,
            role: 'operator', // Используем роль оператора для новых пользователей
            email_verified: false,
            phone_verified: false
          };
        }

        if (isEdit && id) {
          await updatePartner({ 
            id: parseInt(id), 
            partner: submitData 
          }).unwrap();
          setSuccessMessage('Партнер успешно обновлен');
          setTimeout(() => navigate('/partners'), 1500);
        } else {
          // Оборачиваем данные в объект partner при создании нового партнера
          await createPartner({ partner: submitData }).unwrap();
          setSuccessMessage('Партнер успешно создан');
          setTimeout(() => navigate('/partners'), 1500);
        }
      } catch (error) {
        console.error('Ошибка при сохранении партнера:', error);
        setApiError(extractErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Устанавливаем выбранный регион при загрузке данных партнера
  useEffect(() => {
    if (partner && isEdit && partner.region_id) {
      setSelectedRegionId(partner.region_id);
    }
  }, [partner, isEdit]);

  // Обработчик изменения региона
  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const newRegionId = event.target.value;
    
    formik.setFieldValue('region_id', newRegionId);
    formik.setFieldValue('city_id', '');
    
    if (newRegionId && newRegionId !== '') {
      setSelectedRegionId(Number(newRegionId));
    } else {
      setSelectedRegionId(undefined);
    }
  };

  // Обработчик изменения города
  const handleCityChange = (event: SelectChangeEvent<string>) => {
    const newCityId = event.target.value;
    formik.setFieldValue('city_id', newCityId);
  };

  if (partnerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const isLoading = createLoading || updateLoading;

  // Создаем типизированные версии touched и errors для пользователя (используются в полях формы)
  type FormikTouchedUser = {
    first_name?: boolean;
    last_name?: boolean;
    email?: boolean;
    phone?: boolean;
    password?: boolean;
  };

  type FormikErrorsUser = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  type FormikTouchedValues = {
    company_name?: boolean;
    company_description?: boolean;
    contact_person?: boolean;
    logo_url?: boolean;
    website?: boolean;
    tax_number?: boolean;
    legal_address?: boolean;
    region_id?: boolean;
    city_id?: boolean;
    is_active?: boolean;
    user?: FormikTouchedUser;
  };

  type FormikErrorsValues = {
    company_name?: string;
    company_description?: string;
    contact_person?: string;
    logo_url?: string;
    website?: string;
    tax_number?: string;
    legal_address?: string;
    region_id?: string;
    city_id?: string;
    is_active?: string;
    user?: FormikErrorsUser;
  };

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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/partners')}
          sx={{ 
            ...secondaryButtonStyles,
            mr: SIZES.spacing.md 
          }}
        >
          Назад
        </Button>
        <Typography 
          variant="h4" 
          sx={{ fontSize: SIZES.fontSize.xl }}
        >
          {isEdit ? 'Редактировать партнера' : 'Создать партнера'}
        </Typography>
      </Box>
          
      <form onSubmit={formik.handleSubmit}>
        <Paper sx={cardStyles}>
          <Grid container spacing={SIZES.spacing.lg}>
            {/* Основная информация о компании */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Основная информация о компании
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="company_name"
                label="Название компании"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                helperText={formik.touched.company_name && formik.errors.company_name}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="contact_person"
                label="Контактное лицо"
                value={formik.values.contact_person}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                helperText={formik.touched.contact_person && formik.errors.contact_person}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="company_description"
                label="Описание компании"
                value={formik.values.company_description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.company_description && Boolean(formik.errors.company_description)}
                helperText={formik.touched.company_description && formik.errors.company_description}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="website"
                label="Веб-сайт"
                placeholder="https://example.com"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.website && Boolean(formik.errors.website)}
                helperText={formik.touched.website && formik.errors.website}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="logo_url"
                label="URL логотипа"
                placeholder="https://example.com/logo.png"
                value={formik.values.logo_url}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.logo_url && Boolean(formik.errors.logo_url)}
                helperText={formik.touched.logo_url && formik.errors.logo_url}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Юридическая информация */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg 
                }}
              >
                Юридическая информация
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="tax_number"
                label="Налоговый номер (необязательно)"
                placeholder="12345678"
                value={formik.values.tax_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tax_number && Boolean(formik.errors.tax_number)}
                helperText={formik.touched.tax_number && formik.errors.tax_number}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="legal_address"
                label="Юридический адрес"
                value={formik.values.legal_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.legal_address && Boolean(formik.errors.legal_address)}
                helperText={formik.touched.legal_address && formik.errors.legal_address}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Местоположение */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg 
                }}
              >
                Местоположение
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
                <InputLabel>Регион *</InputLabel>
                <Select
                  name="region_id"
                  value={formik.values.region_id?.toString() || ''}
                  onChange={handleRegionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                >
                  <MenuItem value="">Не выбран</MenuItem>
                  {regionsData?.data?.map((region) => (
                    <MenuItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.region_id && formik.errors.region_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.region_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={formik.touched.city_id && Boolean(formik.errors.city_id)}>
                <InputLabel>Город *</InputLabel>
                <Select
                  name="city_id"
                  value={formik.values.city_id?.toString() || ''}
                  onChange={handleCityChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                  disabled={!formik.values.region_id}
                >
                  <MenuItem value="">Не выбран</MenuItem>
                  {citiesData?.data?.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.city_id && formik.errors.city_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.city_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Статус */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: SIZES.spacing.md,
                  fontSize: SIZES.fontSize.lg 
                }}
              >
                Статус
              </Typography>
              <Divider sx={{ mb: SIZES.spacing.md }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label="Активный партнер"
              />
            </Grid>

            {/* Данные пользователя (только при создании) */}
            {!isEdit && (
              <>
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      mt: SIZES.spacing.md,
                      fontSize: SIZES.fontSize.lg 
                    }}
                  >
                    Данные пользователя
                  </Typography>
                  <Divider sx={{ mb: SIZES.spacing.md }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="user.first_name"
                    label="Имя"
                    value={formik.values.user?.first_name || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      (formik.touched as FormikTouchedValues).user?.first_name && 
                      (formik.errors as FormikErrorsValues).user?.first_name
                    )}
                    helperText={
                      ((formik.touched as FormikTouchedValues).user?.first_name && 
                      (formik.errors as FormikErrorsValues).user?.first_name) || ''
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="user.last_name"
                    label="Фамилия"
                    value={formik.values.user?.last_name || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      (formik.touched as FormikTouchedValues).user?.last_name && 
                      (formik.errors as FormikErrorsValues).user?.last_name
                    )}
                    helperText={
                      ((formik.touched as FormikTouchedValues).user?.last_name && 
                      (formik.errors as FormikErrorsValues).user?.last_name) || ''
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    name="user.email"
                    label="Email"
                    value={formik.values.user?.email || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      (formik.touched as FormikTouchedValues).user?.email && 
                      (formik.errors as FormikErrorsValues).user?.email
                    )}
                    helperText={
                      ((formik.touched as FormikTouchedValues).user?.email && 
                      (formik.errors as FormikErrorsValues).user?.email) || ''
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="user.phone"
                    label="Телефон"
                    placeholder="+380671234567"
                    value={formik.values.user?.phone || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      (formik.touched as FormikTouchedValues).user?.phone && 
                      (formik.errors as FormikErrorsValues).user?.phone
                    )}
                    helperText={
                      ((formik.touched as FormikTouchedValues).user?.phone && 
                      (formik.errors as FormikErrorsValues).user?.phone) || ''
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="password"
                    name="user.password"
                    label="Пароль (оставьте пустым для автогенерации)"
                    value={formik.values.user?.password || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      (formik.touched as FormikTouchedValues).user?.password && 
                      (formik.errors as FormikErrorsValues).user?.password
                    )}
                    helperText={
                      ((formik.touched as FormikTouchedValues).user?.password && 
                      (formik.errors as FormikErrorsValues).user?.password) || ''
                    }
                    sx={textFieldStyles}
                  />
                </Grid>
              </>
            )}

            {/* Кнопки действий */}
            <Grid item xs={12}>
              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>
              )}
              
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                gap: SIZES.spacing.md, 
                justifyContent: 'flex-end', 
                mt: SIZES.spacing.lg 
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/partners')}
                  disabled={isLoading}
                  sx={secondaryButtonStyles}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading || !formik.isValid}
                  sx={primaryButtonStyles}
                >
                  {isLoading ? 'Сохранение...' : (isEdit ? 'Обновить' : 'Создать')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </Box>
  );
};

export default PartnerFormPage;