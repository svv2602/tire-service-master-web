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
  IconButton,
} from '@mui/material';
import { useFormik, FormikTouched, FormikErrors } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServiceCategoriesQuery,
  useGetServicesQuery,
  useGetScheduleQuery,
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
} from '../../api';
import {
  useGetServicePointsQuery,
  useGetServicePointBasicInfoQuery,
  useGetServicePointByIdQuery,
  useCreateServicePointMutation,
  useUpdateServicePointMutation,
  useGetServicePointStatusesQuery,
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
  ApiResponse,
  CityFilter,
  ServicePointCreateRequest,
  ServicePointUpdateRequest,
  Photo,
  ServicePointStatus,
} from '../../types/models';
import type { Service, ServicesResponse } from '../../types/service';
import { DAYS_OF_WEEK, getDayName } from '../../types/working-hours';
import type { DayOfWeek, WorkingHoursSchedule, WorkingHours } from '../../types/working-hours';

// Определяем типы для расписания
interface ScheduleItem {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

// Определяем типы для FormikTouched и FormikErrors
interface ServiceFormData {
  service_id: number;
  price: number;
  duration: number;
  is_available: boolean;
}

interface ServiceFormErrors {
  service_id?: string;
  price?: string;
  duration?: string;
  is_available?: string;
}

interface FormValues extends Omit<ServicePointFormData, 'services' | 'working_hours'> {
  working_hours: WorkingHoursSchedule;
  services: ServiceFormData[];
}

interface FormikTouchedFields extends FormikTouched<FormValues> {
  working_hours?: {
    [K in keyof WorkingHoursSchedule]?: {
      start?: boolean;
      end?: boolean;
      is_working_day?: boolean;
    };
  };
}

interface FormikErrorFields extends FormikErrors<FormValues> {
  working_hours?: {
    [K in keyof WorkingHoursSchedule]?: {
      start?: string;
      end?: string;
      is_working_day?: string;
    };
  };
}

// Добавляем интерфейс для загрузки файлов
interface PhotoUpload {
  file: File;
  description?: string;
  is_main: boolean;
  sort_order?: number;
  preview?: string;
}

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

// Статусы точек обслуживания (в будущем можно загружать с сервера)
const SERVICE_POINT_STATUSES = [
  { id: 1, name: 'Активна', color: '#4caf50' },
  { id: 2, name: 'Приостановлена', color: '#ff9800' },
  { id: 3, name: 'Заблокирована', color: '#f44336' },
] as const;

// Определяем начальное расписание в правильном формате
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id < 6
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Создаем схему валидации для рабочих часов
const workingHoursShape = DAYS_OF_WEEK.reduce<Record<keyof WorkingHoursSchedule, yup.ObjectSchema<any>>>((acc, day) => {
  acc[day.key] = yup.object().shape({
    start: yup.string().required('Время начала работы обязательно'),
    end: yup.string().required('Время окончания работы обязательно'),
    is_working_day: yup.boolean().required('Укажите, является ли день рабочим')
  }) as yup.ObjectSchema<WorkingHours>;
  return acc;
}, {} as Record<keyof WorkingHoursSchedule, yup.ObjectSchema<any>>);

const ServicePointFormPage: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // RTK Query хуки
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: selectedRegionId || 0 },
    { skip: !selectedRegionId }
  );
  const { data: basicInfo } = useGetServicePointBasicInfoQuery(id ?? '', {
    skip: !id
  });
  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(
    { 
      partner_id: basicInfo?.partner_id || Number(partnerId) || 0,
      id: id ?? ''
    },
    { 
      skip: !id || (!basicInfo?.partner_id && !partnerId),
      refetchOnMountOrArgChange: true
    }
  );
  const { data: statusesData, isLoading: statusesLoading } = useGetServicePointStatusesQuery();
  const statuses: ServicePointStatus[] = statusesData?.data || [];
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
  const { data: photosData } = useGetServicePointPhotosQuery(
    id ?? '',
    { skip: !isEditMode || !id }
  ) as { data: ServicePointPhoto[] | undefined };

  // Извлекаем данные из результатов запросов
  const partnersData = partners?.data || [];
  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];
  const scheduleData = scheduleQueryResult.data;
  const servicePointServicesData = servicePointServicesQueryResult.data;

  // Преобразуем данные сервисов в нужный формат
  const servicesData = React.useMemo(() => {
    if (!services) return [];
    return services.data || [];
  }, [services]);

  // Получаем ID статуса "active" из списка статусов
  const defaultStatusId = useMemo(() => {
    if (!statuses.length) return undefined;
    const activeStatus = statuses.find(status => status.name === 'active');
    return activeStatus ? activeStatus.id : statuses[0].id;
  }, [statuses]);

  const loading = partnersLoading || regionsLoading || citiesLoading || servicePointLoading || 
                 isCreating || isUpdating || statusesLoading;
  const error = null; // Ошибки теперь обрабатываются в каждом хуке отдельно

  const initialValues: FormValues = useMemo(() => ({
    name: servicePoint?.name || '',
    partner_id: servicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
    city_id: servicePoint?.city_id || 0,
    region_id: selectedRegionId || servicePoint?.city?.region_id || 0,
    address: servicePoint?.address || '',
    phone: servicePoint?.phone || '',
    contact_phone: servicePoint?.contact_phone || '',
    email: servicePoint?.email || '',
    description: servicePoint?.description || '',
    status_id: servicePoint?.status?.id ? Number(servicePoint.status.id) : (defaultStatusId || 0),
    post_count: servicePoint?.post_count || 1,
    default_slot_duration: servicePoint?.default_slot_duration || 60,
    latitude: servicePoint?.latitude || null,
    longitude: servicePoint?.longitude || null,
    working_hours: servicePoint?.working_hours || defaultWorkingHours,
    services: (servicePointServicesData || []).map(service => ({
      service_id: service.service_id,
      price: service.price,
      duration: service.duration,
      is_available: service.is_available
    })),
    photos: (photosData || []).map(photo => ({
      id: typeof photo.id === 'string' ? Number(photo.id) : photo.id,
      url: photo.url,
      description: photo.description || '',
      is_main: photo.is_main,
      sort_order: photo.sort_order,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
      service_point_id: typeof photo.service_point_id === 'string' ? 
        Number(photo.service_point_id) : 
        photo.service_point_id
    } as Photo))
  }), [servicePoint, selectedRegionId, partnerId, servicePointServicesData, photosData, defaultStatusId]);

  useEffect(() => {
    if (servicePoint) {
      console.log('Loaded service point:', servicePoint);
      console.log('Services:', servicePointServicesData);
      console.log('Photos:', photosData);
      console.log('Initial values:', initialValues);
    }
  }, [servicePoint, servicePointServicesData, photosData, initialValues]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      
      // Добавляем основные поля
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'photos' && key !== 'services' && key !== 'working_hours') {
          formData.append(`service_point[${key}]`, value?.toString() || '');
        }
      });

      // Добавляем рабочие часы
      formData.append('service_point[working_hours]', JSON.stringify(values.working_hours));

      // Добавляем услуги
      values.services.forEach((service, index) => {
        Object.entries(service).forEach(([key, value]) => {
          formData.append(`service_point[services_attributes][${index}][${key}]`, value?.toString() || '');
        });
      });

      // Добавляем фотографии
      values.photos.forEach((photo, index) => {
        if (photo.file) {
          formData.append(`service_point[photos_attributes][${index}][file]`, photo.file);
          formData.append(`service_point[photos_attributes][${index}][description]`, photo.description || '');
          formData.append(`service_point[photos_attributes][${index}][is_main]`, photo.is_main.toString());
          if (photo.sort_order !== undefined) {
            formData.append(`service_point[photos_attributes][${index}][sort_order]`, photo.sort_order.toString());
          }
        }
      });

        if (isEditMode && id) {
          await updateServicePoint({
            id,
          servicePoint: formData
          }).unwrap();
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
        await createServicePoint({
          partnerId: partnerId || values.partner_id.toString(),
          servicePoint: formData
        }).unwrap();
          setSuccessMessage('Точка обслуживания успешно создана');
      }

          setTimeout(() => {
        navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
      }, 1000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.data?.message || error?.message || 'Ошибка при сохранении точки обслуживания';
      setErrorMessage(errorMessage);
    }
  };

  const validationSchema = useMemo(() => yup.object({
    name: yup.string().required('Название точки обязательно'),
    partner_id: yup.number()
      .required('Партнер обязателен')
      .min(1, 'Выберите партнера'),
    description: yup.string(),
    address: yup.string().required('Адрес обязателен'),
    phone: yup.string().required('Основной телефон обязателен'),
    contact_phone: yup.string().required('Контактный телефон обязателен'),
    email: yup.string().email('Введите корректный email'),
    city_id: yup.number()
      .required('Город обязателен')
      .min(1, 'Пожалуйста, выберите город'),
    region_id: yup.number()
      .required('Регион обязателен')
      .min(1, 'Пожалуйста, выберите регион'),
    status_id: yup.number()
      .required('Статус обязателен')
      .test('status-exists', 'Выберите корректный статус', function(value) {
        if (!value) return false;
        return statuses.some((status: ServicePointStatus) => status.id === value);
      }),
    post_count: yup.number()
      .required('Количество постов обязательно')
      .min(1, 'Количество постов должно быть не менее 1'),
    default_slot_duration: yup.number()
      .required('Длительность слота обязательна')
      .min(5, 'Длительность слота должна быть не менее 5 минут'),
    latitude: yup.number().nullable()
      .test('coordinates', 'Если указана широта, должна быть указана и долгота', function(value) {
        const { longitude } = this.parent;
        if (value === null || value === undefined) return longitude === null || longitude === undefined;
        return longitude !== null && longitude !== undefined;
      })
      .test('latitude-range', 'Широта должна быть между -90 и 90', function(value) {
        if (value === null || value === undefined) return true;
        return value >= -90 && value <= 90;
      }),
    longitude: yup.number().nullable()
      .test('coordinates', 'Если указана долгота, должна быть указана и широта', function(value) {
        const { latitude } = this.parent;
        if (value === null || value === undefined) return latitude === null || latitude === undefined;
        return latitude !== null && latitude !== undefined;
      })
      .test('longitude-range', 'Долгота должна быть между -180 и 180', function(value) {
        if (value === null || value === undefined) return true;
        return value >= -180 && value <= 180;
      }),
    working_hours: yup.object().shape(workingHoursShape),
    services: yup.array().of(
      yup.object().shape({
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
    photos: yup.array()
      .max(10, 'Максимальное количество фотографий - 10')
      .of(
        yup.object().shape({
          file: yup.mixed(),
          description: yup.string(),
          is_main: yup.boolean(),
          sort_order: yup.number().nullable(),
        })
      ),
  }), [statuses]);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
    validate: (values) => {
      const errors: { [key: string]: string } = {};
      // Проверяем статус
      if (values.status_id && !statuses.some(status => status.id === values.status_id)) {
        errors.status_id = 'Выберите корректный статус';
      }
      return errors;
    }
  });

  // Эффект для установки региона при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city?.region_id && !selectedRegionId) {
      setSelectedRegionId(servicePoint.city.region_id);
      formik.setFieldValue('region_id', servicePoint.city.region_id);
    }
  }, [servicePoint, selectedRegionId]);

  // Обработчик изменения региона
  const handleRegionChange = useCallback((event: SelectChangeEvent<string>) => {
    const regionId = Number(event.target.value);
    setSelectedRegionId(regionId);
    formik.setFieldValue('region_id', regionId);
  }, [formik]);

  // Обработчик изменения города
  const handleCityChange = useCallback((event: SelectChangeEvent<string>) => {
    const cityId = Number(event.target.value);
    formik.setFieldValue('city_id', cityId);
  }, [formik]);

  const handleCloseSnackbar = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleBack = useCallback(() => {
    navigate(partnerId ? `/partners/${partnerId}/service-points` : '/service-points');
  }, [navigate, partnerId]);

  // Добавляем состояние для предпросмотра фотографий
  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([]);

  // Обработчик загрузки фотографий
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file): PhotoUpload => ({
      file,
      is_main: false,
      preview: URL.createObjectURL(file)
    }));

    if (photoUploads.length + newPhotos.length > 10) {
      // Показываем ошибку
      setSnackbarMessage('Максимальное количество фотографий - 10');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setPhotoUploads([...photoUploads, ...newPhotos]);
  };

  // Обработчик удаления фотографии
  const handlePhotoDelete = (index: number) => {
    const newPhotos = [...photoUploads];
    if (newPhotos[index].preview) {
      URL.revokeObjectURL(newPhotos[index].preview!);
    }
    newPhotos.splice(index, 1);
    setPhotoUploads(newPhotos);
  };

  // Обработчик установки главной фотографии
  const handleSetMainPhoto = (index: number) => {
    const newPhotos = photoUploads.map((photo, i) => ({
      ...photo,
      is_main: i === index
    }));
    setPhotoUploads(newPhotos);
  };

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
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submit event triggered');
            console.log('Form is valid:', formik.isValid);
            console.log('Form errors:', formik.errors);
            formik.handleSubmit(e);
          }}>
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
                  Адрес и местоположение
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                  required
                >
                  <InputLabel id="region-id-label">Регион</InputLabel>
                  <Select
                    labelId="region-id-label"
                    id="region_id"
                    name="region_id"
                    value={formik.values.region_id?.toString() || '0'}
                    onChange={handleRegionChange}
                    onBlur={formik.handleBlur}
                    label="Регион"
                  >
                    <MenuItem value="0" disabled>Выберите регион</MenuItem>
                    {regionsData.map((region: Region) => (
                      <MenuItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.region_id && formik.errors.region_id && (
                    <FormHelperText error>{formik.errors.region_id as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                  required
                >
                  <InputLabel id="city-id-label">Город</InputLabel>
                  <Select
                    labelId="city-id-label"
                    id="city_id"
                    name="city_id"
                    value={formik.values.city_id?.toString() || '0'}
                    onChange={handleCityChange}
                    onBlur={formik.handleBlur}
                    label="Город"
                    disabled={!formik.values.region_id}
                  >
                    <MenuItem value="0" disabled>Выберите город</MenuItem>
                    {citiesData.map((city: City) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.city_id && formik.errors.city_id && (
                    <FormHelperText error>{formik.errors.city_id as string}</FormHelperText>
                  )}
                  {!formik.values.region_id && (
                    <FormHelperText>Сначала выберите регион</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Адрес"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  placeholder="Введите полный адрес сервисной точки"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="latitude"
                  name="latitude"
                  label="Широта"
                  type="number"
                  value={formik.values.latitude || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                  helperText={formik.touched.latitude && formik.errors.latitude}
                  InputProps={{
                    inputProps: { 
                      step: "0.000001",
                      min: -90,
                      max: 90
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="longitude"
                  name="longitude"
                  label="Долгота"
                  type="number"
                  value={formik.values.longitude || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                  helperText={formik.touched.longitude && formik.errors.longitude}
                  InputProps={{
                    inputProps: { 
                      step: "0.000001",
                      min: -180,
                      max: 180
                    }
                  }}
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
                <FormControl fullWidth error={formik.touched.status_id && Boolean(formik.errors.status_id)}>
                  <InputLabel id="status-id-label">Статус</InputLabel>
                  <Select
                    labelId="status-id-label"
                    id="status_id"
                    name="status_id"
                    value={formik.values.status_id || ''}
                              onChange={(e) => {
                      formik.setFieldValue('status_id', Number(e.target.value));
                    }}
                    label="Статус"
                    disabled={statusesLoading}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.description || status.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {statusesLoading && (
                    <FormHelperText>
                      Загрузка статусов...
                    </FormHelperText>
                  )}
                  {formik.touched.status_id && formik.errors.status_id && (
                    <FormHelperText error>
                      {formik.errors.status_id as string}
                    </FormHelperText>
                  )}
                </FormControl>
                    </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Услуги и цены
                </Typography>
              </Grid>

              {formik.values.services?.map((service, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={Boolean(
                          formik.touched.services?.[index]?.service_id && 
                          typeof formik.errors.services?.[index] === 'object' &&
                          (formik.errors.services[index] as ServiceFormErrors)?.service_id
                        )}>
                          <InputLabel>Услуга</InputLabel>
                          <Select
                            value={service.service_id ? String(service.service_id) : '0'}
                            onChange={(e) => {
                              const selectedService = servicesData?.find((s: Service) => String(s.id) === e.target.value);
                              if (selectedService) {
                                formik.setFieldValue(`services.${index}`, {
                                  ...service,
                                  service_id: Number(e.target.value),
                                  duration: selectedService.duration || service.duration,
                                  price: selectedService.price || service.price,
                                });
                              }
                            }}
                            label="Услуга"
                          >
                            <MenuItem value="0" disabled>Выберите услугу</MenuItem>
                            {servicesData?.map((serviceItem: Service) => (
                              <MenuItem key={serviceItem.id} value={String(serviceItem.id)}>
                                {serviceItem.name} ({serviceItem.category?.name || 'Без категории'})
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.services?.[index]?.service_id && 
                           typeof formik.errors.services?.[index] === 'object' &&
                           (formik.errors.services[index] as ServiceFormErrors)?.service_id && (
                            <FormHelperText>
                              {(formik.errors.services[index] as ServiceFormErrors).service_id}
                            </FormHelperText>
                          )}
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
                            inputProps: { min: 0 }
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
                            inputProps: { min: 5 }
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
                        is_available: true
                      }
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

                      <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Фотографии
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  multiple
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddPhotoIcon />}
                    disabled={photoUploads.length >= 10}
                  >
                    Добавить фотографии
                  </Button>
                </label>
                {photoUploads.length >= 10 && (
                  <FormHelperText error>
                    Достигнуто максимальное количество фотографий (10)
                  </FormHelperText>
                )}
                      </Grid>

                      <Grid item xs={12}>
                <Grid container spacing={2}>
                  {photoUploads.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <img
                            src={photo.preview}
                            alt={`Фото ${index + 1}`}
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                        <TextField
                          fullWidth
                            margin="normal"
                          label="Описание"
                          value={photo.description || ''}
                          onChange={(e) => {
                              const newPhotos = [...photoUploads];
                              newPhotos[index].description = e.target.value;
                              setPhotoUploads(newPhotos);
                            }}
                          />
                        </CardContent>
                        <CardActions>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={photo.is_main}
                                onChange={() => handleSetMainPhoto(index)}
                              />
                            }
                            label="Главное фото"
                          />
                          <IconButton
                            color="error"
                            onClick={() => handlePhotoDelete(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                      </Grid>

                      <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  График работы
                </Typography>
              </Grid>

              {DAYS_OF_WEEK.map((day: DayOfWeek) => (
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
                              checked={formik.values.working_hours[day.key]?.is_working_day ?? false}
                                onChange={(e) => {
                                formik.setFieldValue(`working_hours.${day.key}`, {
                                  ...formik.values.working_hours[day.key],
                                  is_working_day: e.target.checked
                                } as WorkingHours);
                              }}
                              name={`working_hours.${day.key}.is_working_day`}
                            />
                          }
                          label="Рабочий день"
                        />
                      </Grid>

                      {formik.values.working_hours[day.key]?.is_working_day && (
                        <>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Начало работы"
                              value={formik.values.working_hours[day.key]?.start ?? '09:00'}
                              onChange={(e) => {
                                formik.setFieldValue(`working_hours.${day.key}`, {
                                  ...formik.values.working_hours[day.key],
                                  start: e.target.value
                                } as WorkingHours);
                              }}
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(
                                formik.touched.working_hours?.[day.key]?.start && 
                                formik.errors.working_hours?.[day.key]?.start
                              )}
                              helperText={
                                formik.touched.working_hours?.[day.key]?.start && 
                                formik.errors.working_hours?.[day.key]?.start
                              }
                            />
                      </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Конец работы"
                              value={formik.values.working_hours[day.key]?.end ?? '18:00'}
                              onChange={(e) => {
                                formik.setFieldValue(`working_hours.${day.key}`, {
                                  ...formik.values.working_hours[day.key],
                                  end: e.target.value
                                } as WorkingHours);
                              }}
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(
                                formik.touched.working_hours?.[day.key]?.end && 
                                formik.errors.working_hours?.[day.key]?.end
                              )}
                              helperText={
                                formik.touched.working_hours?.[day.key]?.end && 
                                formik.errors.working_hours?.[day.key]?.end
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
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </Box>
              </Grid>

              {Object.keys(formik.errors).length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Пожалуйста, исправьте следующие ошибки:</Typography>
                    <ul>
                      {Object.entries(formik.errors).map(([field, error]) => {
                        // Проверяем, является ли ошибка объектом
                        if (typeof error === 'object' && error !== null) {
                          return Object.entries(error as Record<string, unknown>).map(([subField, subError]) => (
                            <li key={`${field}.${subField}`}>
                              {typeof subError === 'string' ? subError : JSON.stringify(subError)}
                            </li>
                          ));
                        }
                        return (
                          <li key={field}>
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                          </li>
                        );
                      })}
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicePointFormPage; 