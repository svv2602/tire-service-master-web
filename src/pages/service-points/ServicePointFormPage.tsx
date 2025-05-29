import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServiceCategoriesQuery,
  useGetServicesQuery,
  useGetScheduleQuery,
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
} from '../../api';
import {
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useGetServicePointsQuery,
} from '../../api/servicePoints.api';
import { useGetPartnersQuery } from '../../api/partners.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import type { 
  ServicePoint, 
  ServiceCategory, 
  ServicePointService, 
  ServicePointPhoto,
  Partner,
  Region,
  City,
  ServicePointFormData,
  WorkingHoursSchedule,
  WorkingHours,
  ApiResponse,
  CityFilter,
  ServicePointCreateRequest,
  ServicePointUpdateRequest
} from '../../types/models';
import type { Service } from '../../types/service';

// Определяем типы для расписания
interface ScheduleItem {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

interface WorkingHoursItem {
  start: string;
  end: string;
  is_working_day: boolean;
}

// Добавляем константы для дней недели
const DAYS_OF_WEEK = [
  { id: 1, name: 'Понедельник', key: 'monday' },
  { id: 2, name: 'Вторник', key: 'tuesday' },
  { id: 3, name: 'Среда', key: 'wednesday' },
  { id: 4, name: 'Четверг', key: 'thursday' },
  { id: 5, name: 'Пятница', key: 'friday' },
  { id: 6, name: 'Суббота', key: 'saturday' },
  { id: 0, name: 'Воскресенье', key: 'sunday' },
] as const;

// Создаем начальное расписание
const defaultSchedule: ScheduleItem[] = DAYS_OF_WEEK.map(day => ({
  day_of_week: day.id,
  start_time: '09:00',
  end_time: '18:00',
  is_working_day: day.id < 6 // По умолчанию рабочие дни с понедельника по пятницу
}));

// Создаем начальные рабочие часы
const defaultWorkingHours: WorkingHoursItem[] = DAYS_OF_WEEK.map(day => ({
  start: '09:00',
  end: '18:00',
  is_working_day: day.id < 6
}));

// Схема валидации
const validationSchema = yup.object({
  name: yup.string().required('Название точки обязательно'),
  partner_id: yup.number()
    .required('Партнер обязателен')
    .min(1, 'Выберите партнера'),
  description: yup.string(),
  address: yup.string().required('Адрес обязателен'),
  phone: yup.string().required('Основной телефон обязателен'),
  contact_phone: yup.string().required('Контактный телефон обязателен'),
  email: yup.string().email('Введите корректный email').required('Email обязателен'),
  city_id: yup.number().required('Город обязателен'),
  region_id: yup.number().required('Регион обязателен'),
  is_active: yup.boolean(),
  post_count: yup.number()
    .required('Количество постов обязательно')
    .min(1, 'Количество постов должно быть не менее 1'),
  default_slot_duration: yup.number()
    .required('Длительность слота обязательна')
    .min(5, 'Длительность слота должна быть не менее 5 минут'),
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
  schedule: yup.array().of(
    yup.object({
      day_of_week: yup.number().required('День недели обязателен'),
      start_time: yup.string().required('Время начала работы обязательно'),
      end_time: yup.string().required('Время окончания работы обязательно'),
      is_working_day: yup.boolean().required('Укажите, является ли день рабочим'),
    })
  ),
  working_hours: yup.object({
    monday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    tuesday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    wednesday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    thursday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    friday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    saturday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
    sunday: yup.object().shape({
      start: yup.string().required(),
      end: yup.string().required(),
      is_working_day: yup.boolean().required(),
    }),
  }),
  services: yup.array().of(
    yup.object({
      service_id: yup.number()
        .required('Услуга обязательна')
        .min(1, 'Выберите услугу'),
      price: yup.number()
        .min(0, 'Цена не может быть отрицательной')
        .required('Цена обязательна'),
      duration: yup.number()
        .min(5, 'Длительность должна быть не менее 5 минут')
        .required('Длительность обязательна'),
      is_available: yup.boolean()
        .required('Укажите доступность услуги'),
    })
  ),
  photos: yup.array().of(
    yup.object({
      url: yup.string().required('URL фотографии обязателен'),
      description: yup.string(),
      is_main: yup.boolean(),
      sort_order: yup.number().nullable(),
    })
  ),
});

// Статусы точек обслуживания (в будущем можно загружать с сервера)
const mockServicePointStatuses = [
  { id: 1, name: 'Активна', color: '#4caf50' },
  { id: 2, name: 'Приостановлена', color: '#ff9800' },
  { id: 3, name: 'Заблокирована', color: '#f44336' },
];

const getDayName = (dayOfWeek: number): string => {
  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];
  return days[dayOfWeek % 7];
};

// Обновляем интерфейсы для параметров запросов
interface CitiesQueryParams {
  region_id?: number;
}

interface ServicePointQueryParams {
  service_point_id: string;
  date?: string;
}

interface ServicePointServicesQueryParams {
  service_point_id: string;
}

interface ServicePointPhotosQueryParams {
  service_point_id: string;
}

// Добавим типы для Formik
interface FormikTouched {
  schedule?: {
    start_time?: boolean;
    end_time?: boolean;
  }[];
}

interface FormikErrors {
  schedule?: {
    start_time?: string;
    end_time?: string;
  }[];
}

const ServicePointFormPage: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [servicePointStatuses] = useState(mockServicePointStatuses);

  // RTK Query хуки
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: selectedRegionId || 0 },
    { skip: !selectedRegionId }
  );
  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(id ?? '', { skip: !id });
  const [createServicePoint, { isLoading: isCreating }] = useCreateServicePointMutation();
  const [updateServicePoint, { isLoading: isUpdating }] = useUpdateServicePointMutation();
  const { data: servicePointsData } = useGetServicePointsQuery({});

  const { data: services } = useGetServicesQuery();
  const scheduleQueryResult = useGetScheduleQuery(
    { 
      service_point_id: id ?? '',
      date: new Date().toISOString().split('T')[0]
    },
    { skip: !isEditMode || !id }
  );
  const servicePointServicesQueryResult = useGetServicePointServicesQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  );
  const photosQueryResult = useGetServicePointPhotosQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  );

  // Извлекаем данные из результатов запросов
  const partnersData = partners?.data || [];
  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];
  const scheduleData = scheduleQueryResult.data;
  const servicePointServicesData = servicePointServicesQueryResult.data;
  const photosData = photosQueryResult.data;
  const servicesData = services?.data || [];

  const loading = partnersLoading || regionsLoading || citiesLoading || servicePointLoading || isCreating || isUpdating;
  const error = null; // Ошибки теперь обрабатываются в каждом хуке отдельно

  const initialValues: ServicePointFormData = useMemo(() => ({
    name: servicePoint?.name || '',
    partner_id: servicePoint?.partner_id || 0,
    city_id: servicePoint?.city_id || 0,
    region_id: selectedRegionId || 0,
    address: servicePoint?.address || '',
    phone: servicePoint?.phone || '',
    contact_phone: servicePoint?.contact_phone || '',
    email: servicePoint?.email || '',
    description: servicePoint?.description || '',
    is_active: servicePoint?.is_active ?? true,
    post_count: servicePoint?.post_count || 1,
    default_slot_duration: servicePoint?.default_slot_duration || 60,
    latitude: servicePoint?.latitude || null,
    longitude: servicePoint?.longitude || null,
    status_id: servicePoint?.status_id || 1,
    schedule: defaultSchedule,
    working_hours: (servicePoint?.working_hours || defaultWorkingHours) as WorkingHoursSchedule,
    services: (servicePoint?.services || []).map(service => ({
      service_id: service.service_id,
      price: service.price,
      duration: service.duration,
      is_available: service.is_available
    })),
    photos: (servicePoint?.photos || []).map(photo => ({
      url: photo.url,
      description: photo.description,
      is_main: photo.is_main,
      sort_order: photo.sort_order
    })),
  }), [servicePoint, selectedRegionId]);

  const formik = useFormik<ServicePointFormData>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log('Submitting form with values:', values);
        
        const submitData: ServicePointCreateRequest = {
          service_point: {
            name: values.name,
            partner_id: Number(values.partner_id),
            city_id: Number(values.city_id),
            region_id: Number(values.region_id),
            address: values.address,
            phone: values.phone,
            contact_phone: values.contact_phone,
            email: values.email,
            description: values.description,
            is_active: values.is_active,
            post_count: Number(values.post_count),
            default_slot_duration: Number(values.default_slot_duration),
            latitude: values.latitude,
            longitude: values.longitude,
            status_id: values.status_id || 1,
            working_hours: values.working_hours,
            services: values.services?.map(service => ({
              service_id: Number(service.service_id),
              price: Number(service.price),
              duration: Number(service.duration),
              is_available: service.is_available
            })),
            photos: values.photos?.map(photo => ({
              url: photo.url,
              description: photo.description || '',
              is_main: photo.is_main || false,
              sort_order: photo.sort_order || 0
            }))
          }
        };

        console.log('Prepared data for submission:', submitData);

        if (isEditMode) {
          const result = await updateServicePoint({ 
            id: id!, 
            servicePoint: submitData.service_point
          }).unwrap();
          console.log('Update response:', result);
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          const result = await createServicePoint(submitData.service_point).unwrap();
          console.log('Create response:', result);
          setSuccessMessage('Точка обслуживания успешно создана');
          setTimeout(() => {
            navigate('/service-points');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error submitting form:', error);
        setErrorMessage(error?.data?.message || 'Ошибка при сохранении точки обслуживания');
      }
    },
  });

  // Эффект для установки региона при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city_id && cities?.data && cities.data.length > 0) {
      const citiesData = cities.data;
      const city = citiesData.find((c: City) => c.id === servicePoint.city_id);
      if (city?.region_id && city.region_id !== selectedRegionId) {
        setSelectedRegionId(city.region_id);
      }
    }
  }, [servicePoint?.city_id, cities?.data, selectedRegionId]);

  // Мемоизированные обработчики
  const handleRegionChange = useCallback((event: SelectChangeEvent<string>) => {
    const regionId = Number(event.target.value);
    setSelectedRegionId(regionId);
    formik.setFieldValue('region_id', regionId);
    formik.setFieldValue('city_id', 0);
  }, [formik]);

  const handleCloseSnackbar = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/service-points');
  }, [navigate]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование точки обслуживания' : 'Создание точки обслуживания'}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад к списку
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Название точки"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}>
                  <InputLabel id="partner-id-label">Партнер</InputLabel>
                  <Select
                    labelId="partner-id-label"
                    id="partner_id"
                    name="partner_id"
                    value={(formik.values.partner_id || 0).toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      formik.setFieldValue('partner_id', Number(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Партнер"
                  >
                    <MenuItem value="0" disabled>Выберите партнера</MenuItem>
                    {partnersData.map((partner: Partner) => (
                      <MenuItem key={partner.id} value={partner.id.toString()}>
                        {partner.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.partner_id && formik.errors.partner_id && (
                    <FormHelperText>{formik.errors.partner_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Описание"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Контактная информация
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Основной телефон"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="contact_phone"
                  name="contact_phone"
                  label="Контактный телефон"
                  value={formik.values.contact_phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
                  helperText={formik.touched.contact_phone && formik.errors.contact_phone}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Параметры работы
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="post_count"
                  name="post_count"
                  label="Количество постов"
                  type="number"
                  value={formik.values.post_count}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.post_count && Boolean(formik.errors.post_count)}
                  helperText={formik.touched.post_count && formik.errors.post_count}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="default_slot_duration"
                  name="default_slot_duration"
                  label="Длительность слота (мин.)"
                  type="number"
                  value={formik.values.default_slot_duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.default_slot_duration && Boolean(formik.errors.default_slot_duration)}
                  helperText={formik.touched.default_slot_duration && formik.errors.default_slot_duration}
                  InputProps={{
                    inputProps: { min: 5 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                          <FormControlLabel
                            control={
                              <Switch
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                      name="is_active"
                    />
                  }
                  label="Точка активна"
                            />
                          </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Услуги и цены
                </Typography>
              </Grid>

              {(formik.values.services || []).map((service, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Услуга</InputLabel>
                          <Select
                            value={service.service_id?.toString() || ''}
                            onChange={(e) => {
                              const selectedService = servicesData.find(s => String(s.id) === e.target.value);
                              if (selectedService) {
                                formik.setFieldValue(`services.${index}`, {
                                  ...service,
                                  service_id: Number(e.target.value),
                                  duration: selectedService.default_duration || selectedService.duration || service.duration,
                                  price: selectedService.price || service.price || 0,
                                });
                              }
                            }}
                            label="Услуга"
                          >
                            {servicesData && servicesData.map((serviceItem: Service) => (
                              <MenuItem key={serviceItem.id} value={String(serviceItem.id)}>
                                {serviceItem.name} ({serviceItem.category_id})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Цена"
                          value={service.price}
                          onChange={(e) => {
                            formik.setFieldValue(`services.${index}.price`, Number(e.target.value));
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Длительность"
                          value={service.duration}
                          onChange={(e) => {
                            formik.setFieldValue(`services.${index}.duration`, Number(e.target.value));
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={service.is_available}
                                onChange={(e) => {
                                  formik.setFieldValue(`services.${index}.is_available`, e.target.checked);
                                }}
                                name={`services.${index}.is_available`}
                              />
                            }
                            label="Услуга доступна"
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          color="error"
                          onClick={() => {
                            const newServices = [...(formik.values.services || [])];
                            newServices.splice(index, 1);
                            formik.setFieldValue('services', newServices);
                          }}
                        >
                          Удалить услугу
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    formik.setFieldValue('services', [
                      ...(formik.values.services || []),
                      {
                        service_id: 0,
                        price: 0,
                        duration: 30,
                        is_available: true,
                      },
                    ]);
                  }}
                >
                  Добавить услугу
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Фотографии
                </Typography>
              </Grid>

              {(formik.values.photos || []).map((photo, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <img
                          src={photo.url}
                          alt={photo.description || 'Фото сервисной точки'}
                          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="URL фотографии"
                          value={photo.url}
                          onChange={(e) => {
                            formik.setFieldValue(`photos.${index}.url`, e.target.value);
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Описание"
                          value={photo.description || ''}
                          onChange={(e) => {
                            formik.setFieldValue(`photos.${index}.description`, e.target.value);
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={photo.is_main}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    (formik.values.photos || []).forEach((_, i) => {
                                      if (i !== index) {
                                        formik.setFieldValue(`photos.${i}.is_main`, false);
                                      }
                                    });
                                  }
                                  formik.setFieldValue(`photos.${index}.is_main`, e.target.checked);
                                }}
                                name={`photos.${index}.is_main`}
                              />
                            }
                            label="Главное фото"
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          color="error"
                          onClick={() => {
                            const newPhotos = [...(formik.values.photos || [])];
                            newPhotos.splice(index, 1);
                            formik.setFieldValue('photos', newPhotos);
                          }}
                        >
                          Удалить фото
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    formik.setFieldValue('photos', [
                      ...(formik.values.photos || []),
                      {
                        id: '',
                        service_point_id: 0,
                        url: '',
                        description: '',
                        is_main: (formik.values.photos || []).length === 0,
                        created_at: '',
                        updated_at: '',
                      },
                    ]);
                  }}
                >
                  Добавить фото
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  График работы
                </Typography>
              </Grid>

              {DAYS_OF_WEEK.map((day, index) => (
                <Grid item xs={12} md={6} key={day.id}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {day.name}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.schedule?.[index]?.is_working_day ?? false}
                              onChange={(e) => {
                                formik.setFieldValue(`schedule.${index}.is_working_day`, e.target.checked);
                                // Обновляем также working_hours
                                formik.setFieldValue(`working_hours.${day.key}.is_working_day`, e.target.checked);
                              }}
                              name={`schedule.${index}.is_working_day`}
                            />
                          }
                          label="Рабочий день"
                        />
                      </Grid>

                      {formik.values.schedule?.[index]?.is_working_day && (
                        <>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Начало работы"
                              value={formik.values.schedule?.[index]?.start_time ?? '09:00'}
                              onChange={(e) => {
                                formik.setFieldValue(`schedule.${index}.start_time`, e.target.value);
                                formik.setFieldValue(`working_hours.${day.key}.start`, e.target.value);
                              }}
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(
                                (formik.touched as FormikTouched).schedule?.[index]?.start_time && 
                                (formik.errors as FormikErrors).schedule?.[index]?.start_time
                              )}
                              helperText={
                                (formik.touched as FormikTouched).schedule?.[index]?.start_time && 
                                (formik.errors as FormikErrors).schedule?.[index]?.start_time
                              }
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Конец работы"
                              value={formik.values.schedule?.[index]?.end_time ?? '18:00'}
                              onChange={(e) => {
                                formik.setFieldValue(`schedule.${index}.end_time`, e.target.value);
                                formik.setFieldValue(`working_hours.${day.key}.end`, e.target.value);
                              }}
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(
                                (formik.touched as FormikTouched).schedule?.[index]?.end_time && 
                                (formik.errors as FormikErrors).schedule?.[index]?.end_time
                              )}
                              helperText={
                                (formik.touched as FormikTouched).schedule?.[index]?.end_time && 
                                (formik.errors as FormikErrors).schedule?.[index]?.end_time
                              }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={handleBack}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
      
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        message={errorMessage}
      />
    </Box>
  );
};

export default ServicePointFormPage; 