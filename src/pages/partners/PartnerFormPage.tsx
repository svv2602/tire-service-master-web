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
  Tooltip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  useGetPartnerByIdQuery, 
  useCreatePartnerMutation, 
  useUpdatePartnerMutation,
  useGetRegionsQuery,
  useGetCitiesQuery,
  useGetServicePointsByPartnerIdQuery,
} from '../../api';
import { getRoleId } from '../../utils/roles.utils';
import { PartnerFormData, ServicePoint } from '../../types/models';
import { SelectChangeEvent } from '@mui/material';
// Импорт централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles, SIZES, getTablePageStyles } from '../../styles';
// Импорт UI компонентов
import { Tabs, TabPanel, Table, type Column, Pagination } from '../../components/ui';

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
  company_description: string | undefined;
  contact_person: string | undefined;
  logo_url: string | undefined;
  website: string | undefined;
  tax_number: string | undefined;
  legal_address: string | undefined;
  region_id: string | undefined;
  city_id: string | undefined;
  is_active: boolean;
  user: FormUserData | null;
}

// Типы для formik.touched и formik.errors
interface FormikTouched {
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
  user?: {
    first_name?: boolean;
    last_name?: boolean;
    email?: boolean;
    phone?: boolean;
    password?: boolean;
  };
}

interface FormikErrors {
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
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
}

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
    .transform((value) => (value === '' ? null : value))
    .test('tax-number-format', 'Налоговый номер должен содержать от 8 до 15 цифр и дефисов', function(value) {
      if (!value) return true; // Если поле пустое или null, то валидация проходит
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
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Централизованная система стилей
  const theme = useTheme();
  const cardStyles = getCardStyles(theme, 'primary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const tablePageStyles = getTablePageStyles(theme);

  // RTK Query хуки
  const { data: partner, isLoading: partnerLoading } = useGetPartnerByIdQuery(id ? parseInt(id) : 0, {
    skip: !id,
  });
  const { data: regionsData } = useGetRegionsQuery({});
  
  // Устанавливаем выбранный регион при загрузке данных партнера
  useEffect(() => {
    if (partner && isEdit && partner.region_id && !selectedRegionId) {
      console.log('Устанавливаем selectedRegionId:', partner.region_id);
      setSelectedRegionId(partner.region_id);
    }
  }, [partner, isEdit, selectedRegionId]);
  
  // Обновляем логику запроса городов
  const regionIdForCities = useMemo(() => {
    // При редактировании используем selectedRegionId, если он установлен, иначе region_id партнера
    if (isEdit && partner) {
      return selectedRegionId || partner.region_id;
    }
    // При создании используем только selectedRegionId
    return selectedRegionId;
  }, [partner, isEdit, selectedRegionId]);
  
  console.log('regionIdForCities:', regionIdForCities, 'selectedRegionId:', selectedRegionId, 'partner.region_id:', partner?.region_id);
  
  const { data: citiesData, isLoading: citiesLoading, isFetching: citiesFetching } = useGetCitiesQuery(
    { 
      region_id: regionIdForCities || undefined,
      page: 1,
      per_page: 100
    }, 
    { 
      skip: !regionIdForCities,
      // Принудительно обновляем при изменении regionIdForCities
      refetchOnMountOrArgChange: true
    }
  );
  
  const [createPartner, { isLoading: createLoading }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: updateLoading }] = useUpdatePartnerMutation();

  // Загрузка сервисных точек партнера (только в режиме редактирования)
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsByPartnerIdQuery(
    { 
      partner_id: id ? parseInt(id) : 0,
      page: 1,
      per_page: 25
    }, 
    { skip: !isEdit || !id }
  );

  // Состояние для управления ошибками API и сообщениями успеха
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для отображения ошибок валидации
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const requiredFields = {
      company_name: 'Название компании',
      contact_person: 'Контактное лицо',
      legal_address: 'Юридический адрес',
      region_id: 'Регион',
      city_id: 'Город',
      ...((!isEdit) && {
        'user.email': 'Email пользователя',
        'user.phone': 'Телефон пользователя',
        'user.first_name': 'Имя пользователя',
        'user.last_name': 'Фамилия пользователя'
      })
    };

    const errors: string[] = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (parent === 'user') {
          const userValue = formik.values.user;
          if (!userValue || !userValue[child as keyof FormUserData] || 
              (typeof userValue[child as keyof FormUserData] === 'string' && 
               userValue[child as keyof FormUserData] === '')) {
            errors.push(label);
          }
        }
      } else {
        const value = formik.values[field as keyof FormValues];
        if (!value || 
            (typeof value === 'string' && value.trim() === '') ||
            (field === 'region_id' && !formik.values.region_id) ||
            (field === 'city_id' && !formik.values.city_id)) {
          errors.push(label);
        }
      }
    });
    return errors;
  };

  // Функция для обработки клика по заблокированной кнопке
  const handleDisabledButtonClick = () => {
    if (!formik.isValid) {
      // Помечаем все поля как затронутые для показа ошибок
      const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
        acc[field] = true;
        if (field === 'user' && formik.values.user) {
          acc.user = Object.keys(formik.values.user).reduce((userAcc, userField) => {
            userAcc[userField] = true;
            return userAcc;
          }, {} as Record<string, boolean>);
        }
        return acc;
      }, {} as Record<string, any>);
      formik.setTouched(touchedFields);
      setShowValidationErrors(true);
    }
  };

  // Функция для форматирования данных перед отправкой
  const formatPartnerData = (values: FormValues): PartnerFormData => {
    const formattedData: PartnerFormData = {
      company_name: values.company_name,
      company_description: values.company_description || undefined,
      contact_person: values.contact_person || undefined,
      logo_url: values.logo_url || undefined,
      website: values.website || undefined,
      tax_number: values.tax_number || undefined,
      legal_address: values.legal_address,
      region_id: values.region_id ? parseInt(values.region_id) : undefined,
      city_id: values.city_id ? parseInt(values.city_id) : undefined,
      is_active: values.is_active,
    };

    // Добавляем данные пользователя только при создании
    if (!isEdit && values.user) {
      formattedData.user_attributes = {
        email: values.user.email,
        phone: values.user.phone,
        first_name: values.user.first_name,
        last_name: values.user.last_name,
        password: values.user.password || undefined,
        role_id: getRoleId('partner'),
      };
    }

    return formattedData;
  };

  // Обработчик отправки формы
  const handleSubmit = async (values: FormValues, { setTouched }: any) => {
    try {
      setApiError(null);
      setSuccessMessage(null);
      setShowValidationErrors(false);
      
      // Проверяем валидность формы
      if (!formik.isValid) {
        // Помечаем все поля как затронутые для показа ошибок
        const touchedFields = Object.keys(formik.values).reduce((acc, field) => {
          acc[field] = true;
          if (field === 'user' && formik.values.user) {
            acc.user = Object.keys(formik.values.user).reduce((userAcc, userField) => {
              userAcc[userField] = true;
              return userAcc;
            }, {} as Record<string, boolean>);
          }
          return acc;
        }, {} as Record<string, any>);
        setTouched(touchedFields);
        setShowValidationErrors(true);
        return;
      }
      
      const formattedData = formatPartnerData(values);
      console.log('Отправляемые данные:', formattedData);
      
      if (isEdit && id) {
        await updatePartner({ id: parseInt(id), partner: formattedData }).unwrap();
        setSuccessMessage('Партнер успешно обновлен');
      } else {
        await createPartner({ partner: formattedData }).unwrap();
        setSuccessMessage('Партнер успешно создан');
      }
      
      // Возвращаемся на список после успешного сохранения
      navigate('/partners');
    } catch (error: any) {
      console.error('Ошибка при сохранении партнера:', error);
      
      // Извлекаем сообщение об ошибке
      let errorMessage = 'Произошла ошибка при сохранении';
      
      if (error.data?.errors) {
        // Формируем читаемое сообщение из всех ошибок
        const errorMessages = [];
        for (const [key, messages] of Object.entries(error.data.errors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${key}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errorMessages.push(`${key}: ${messages}`);
          }
        }
        errorMessage = errorMessages.join('\n');
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      setApiError(errorMessage);
    }
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
    onSubmit: handleSubmit,
  });

  // Определяем вкладки для режима редактирования
  const tabs = useMemo(() => {
    const baseTabs = [
      { label: 'Основная информация', value: 0 },
    ];

    // Добавляем вкладку сервисных точек только в режиме редактирования
    if (isEdit) {
      baseTabs.push({ label: 'Сервисные точки', value: 1 });
    }

    return baseTabs;
  }, [isEdit]);

  // Определяем колонки для таблицы сервисных точек
  const servicePointColumns: Column[] = useMemo(() => [
    {
      id: 'name',
      label: 'Название',
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{row.name}</Typography>
        </Box>
      ),
      minWidth: 150,
    },
    {
      id: 'address',
      label: 'Адрес',
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{row.address}</Typography>
        </Box>
      ),
      minWidth: 200,
    },
    {
      id: 'city',
      label: 'Город',
      format: (value, row: ServicePoint) => {
        // Проверяем, что city существует и имеет свойство name
        return typeof row.city === 'object' && row.city ? row.city.name : '-';
      },
      minWidth: 120,
    },
    {
      id: 'is_active',
      label: 'Статус',
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {row.is_active ? (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'success.main',
                fontWeight: 'bold'
              }}
            >
              Активна
            </Typography>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'error.main',
                fontWeight: 'bold'
              }}
            >
              Неактивна
            </Typography>
          )}
        </Box>
      ),
      align: 'center',
      minWidth: 100,
    },
    {
      id: 'actions',
      label: 'Действия',
      format: (value, row: ServicePoint) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Редактировать">
            <Button
              size="small"
              onClick={() => handleEditServicePoint(row.id)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Удалить">
            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteServicePoint(row)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      ),
      align: 'center',
      minWidth: 120,
    },
  ], []);

  // Обработчики для сервисных точек
  const handleEditServicePoint = (servicePointId: number) => {
    if (id) {
      navigate(`/partners/${id}/service-points/${servicePointId}/edit`);
    }
  };

  const handleDeleteServicePoint = (servicePoint: any) => {
    // Здесь будет логика удаления или открытия диалога подтверждения
    console.log('Удаление сервисной точки:', servicePoint);
  };

  const handleAddServicePoint = () => {
    if (id) {
      navigate(`/partners/${id}/service-points/new`);
    }
  };

  // Обработчик изменения региона
  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const newRegionId = event.target.value;
    
    console.log('Изменение региона:', newRegionId);
    
    // Обновляем значения формы
    formik.setFieldValue('region_id', newRegionId);
    formik.setFieldValue('city_id', ''); // Сбрасываем выбранный город
    
    // Обновляем selectedRegionId - это автоматически вызовет обновление городов
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

  // Обработчик изменения вкладки
  const handleTabChange = (newValue: string | number) => {
    setActiveTab(newValue as number);
  };

  if (partnerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const isLoading = createLoading || updateLoading;

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
      
      {/* Вкладки (только в режиме редактирования) */}
      {isEdit && (
        <Box sx={{ mb: SIZES.spacing.md }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            tabs={tabs}
            variant="standard"
          />
        </Box>
      )}
          
      <form onSubmit={formik.handleSubmit}>
        {/* Вкладка основной информации */}
        <TabPanel value={activeTab} index={0}>
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
                  error={(formik.touched.company_name || showValidationErrors) && Boolean(formik.errors.company_name)}
                  helperText={(formik.touched.company_name || showValidationErrors) && formik.errors.company_name}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="contact_person"
                  label="Контактное лицо"
                  value={formik.values.contact_person}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={(formik.touched.contact_person || showValidationErrors) && Boolean(formik.errors.contact_person)}
                  helperText={(formik.touched.contact_person || showValidationErrors) && formik.errors.contact_person}
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
                  error={(formik.touched.legal_address || showValidationErrors) && Boolean(formik.errors.legal_address)}
                  helperText={(formik.touched.legal_address || showValidationErrors) && formik.errors.legal_address}
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
                  <InputLabel id="region-select-label">Регион</InputLabel>
                  <Select
                    labelId="region-select-label"
                    id="region_id"
                    name="region_id"
                    value={formik.values.region_id || ''}
                    label="Регион"
                    onChange={handleRegionChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="" disabled>
                      <em>Выберите регион</em>
                    </MenuItem>
                    {regionsData?.data?.map((region) => (
                      <MenuItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.region_id && formik.errors.region_id && (
                    <Typography variant="caption" color="error">
                      {formik.errors.region_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  required 
                  disabled={!formik.values.region_id}
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                >
                  <InputLabel id="city-select-label">Город</InputLabel>
                  <Select
                    labelId="city-select-label"
                    id="city_id"
                    name="city_id"
                    value={formik.values.city_id || ''}
                    label="Город"
                    onChange={handleCityChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="" disabled>
                      <em>Выберите город</em>
                    </MenuItem>
                    {citiesData?.data?.map((city) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.city_id && formik.errors.city_id && (
                    <Typography variant="caption" color="error">
                      {formik.errors.city_id}
                    </Typography>
                  )}
                  {citiesLoading && (
                    <Typography variant="caption" color="text.secondary">
                      Загрузка городов...
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ ml: 2, mt: 1 }}>
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
                </Box>
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
                      error={(formik.touched.user as FormikTouched['user'])?.first_name && Boolean((formik.errors.user as FormikErrors['user'])?.first_name)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.first_name && (formik.errors.user as FormikErrors['user'])?.first_name}
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
                      error={(formik.touched.user as FormikTouched['user'])?.last_name && Boolean((formik.errors.user as FormikErrors['user'])?.last_name)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.last_name && (formik.errors.user as FormikErrors['user'])?.last_name}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      name="user.email"
                      label="Email"
                      type="email"
                      value={formik.values.user?.email || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.email && Boolean((formik.errors.user as FormikErrors['user'])?.email)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.email && (formik.errors.user as FormikErrors['user'])?.email}
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      name="user.phone"
                      label="Телефон"
                      value={formik.values.user?.phone || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.phone && Boolean((formik.errors.user as FormikErrors['user'])?.phone)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.phone && (formik.errors.user as FormikErrors['user'])?.phone}
                      placeholder="+79001234567"
                      sx={textFieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="user.password"
                      label="Пароль"
                      type="password"
                      value={formik.values.user?.password || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched.user as FormikTouched['user'])?.password && Boolean((formik.errors.user as FormikErrors['user'])?.password)}
                      helperText={(formik.touched.user as FormikTouched['user'])?.password && (formik.errors.user as FormikErrors['user'])?.password}
                      sx={textFieldStyles}
                    />
                  </Grid>
                </>
              )}

              {/* Отображение ошибок и кнопки действий */}
              <Grid item xs={12}>
                <Divider sx={{ my: SIZES.spacing.md }} />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: SIZES.spacing.md
                }}>
                  {/* Отображение ошибок */}
                  <Box>
                    {apiError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {apiError}
                      </Alert>
                    )}
                    {successMessage && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                      </Alert>
                    )}
                    {showValidationErrors && !formik.isValid && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Пожалуйста, исправьте ошибки в форме.
                      </Alert>
                    )}
                  </Box>

                  {/* Кнопки действий */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/partners')}
                      sx={secondaryButtonStyles}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={createLoading || updateLoading}
                      startIcon={
                        (createLoading || updateLoading) ? 
                          <CircularProgress size={20} color="inherit" /> : 
                          <SaveIcon />
                      }
                      onClick={!formik.isValid ? handleDisabledButtonClick : undefined}
                      sx={primaryButtonStyles}
                    >
                      {(createLoading || updateLoading) ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Вкладка сервисных точек (только в режиме редактирования) */}
        {isEdit && (
          <TabPanel value={activeTab} index={1}>
            <Paper sx={cardStyles}>
              {/* Заголовок и кнопка добавления */}
              <Box sx={tablePageStyles.pageHeader}>
                <Typography variant="h5">
                  Сервисные точки партнера
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddServicePoint}
                >
                  Добавить сервисную точку
                </Button>
              </Box>

              {/* Отображение состояний загрузки и ошибок */}
              {servicePointsLoading ? (
                <Box sx={tablePageStyles.loadingContainer}>
                  <CircularProgress />
                </Box>
              ) : servicePointsData?.data?.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    У этого партнера пока нет сервисных точек
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Статистика */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Всего сервисных точек: <strong>{servicePointsData?.pagination?.total_count || 0}</strong>
                    </Typography>
                    {servicePointsData?.data && servicePointsData.data.length > 0 && (
                      <>
                        <Typography variant="body2" color="success.main">
                          Активных: <strong>{servicePointsData.data.filter(sp => sp.is_active).length}</strong>
                        </Typography>
                        {servicePointsData.data.filter(sp => !sp.is_active).length > 0 && (
                          <Typography variant="body2" color="error.main">
                            Неактивных: <strong>{servicePointsData.data.filter(sp => !sp.is_active).length}</strong>
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  {/* Таблица сервисных точек */}
                  <Box sx={tablePageStyles.tableContainer}>
                    <Table 
                      columns={servicePointColumns}
                      rows={servicePointsData?.data || []}
                    />
                  </Box>

                  {/* Пагинация */}
                  {servicePointsData?.pagination && Math.ceil(servicePointsData.pagination.total_count / 25) > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 3
                    }}>
                      <Pagination
                        count={Math.ceil(servicePointsData.pagination.total_count / 25)}
                        page={1}
                        onChange={(newPage) => console.log('Переход на страницу:', newPage)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </TabPanel>
        )}
      </form>
    </Box>
  );
};

export default PartnerFormPage;