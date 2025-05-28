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
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServiceCategoriesQuery,
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
  ServicePointFormData, 
  ServicePoint, 
  ServiceCategory, 
  WorkingHours, 
  ServicePointService, 
  ServicePointPhoto,
  Partner,
  Region,
  City
} from '../../types/models';

// Схема валидации
const validationSchema = yup.object({
  name: yup.string().required('Название точки обязательно'),
  partner_id: yup.string().required('Партнер обязателен'),
  address: yup.string().required('Адрес обязателен'),
  city_id: yup.number().required('Город обязателен'),
  region_id: yup.number().required('Регион обязателен'),
  contact_phone: yup.string().required('Контактный телефон обязателен'),
  description: yup.string(),
  is_active: yup.boolean(),
  post_count: yup.number().min(1, 'Количество постов должно быть не менее 1'),
  default_slot_duration: yup.number().min(5, 'Длительность по умолчанию должна быть не менее 5 минут'),
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
  services: yup.array().of(
    yup.object({
      service_id: yup.number().required('Услуга обязательна'),
      price: yup.number().min(0, 'Цена не может быть отрицательной').required('Цена обязательна'),
      duration: yup.number().min(5, 'Длительность должна быть не менее 5 минут').required('Длительность обязательна'),
      is_available: yup.boolean().required('Укажите доступность услуги'),
    })
  ),
  photos: yup.array().of(
    yup.object({
      url: yup.string().required('URL фотографии обязателен'),
      description: yup.string(),
      is_main: yup.boolean(),
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

const ServicePointFormPage: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [servicePointStatuses] = useState(mockServicePointStatuses);

  // RTK Query хуки
  const { data: partnersData, isLoading: partnersLoading } = useGetPartnersQuery({});
  const { data: regionsData, isLoading: regionsLoading } = useGetRegionsQuery({});
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(
    selectedRegionId ? { region_id: Number(selectedRegionId) } : { region_id: undefined },
    { skip: !selectedRegionId }
  );
  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(id ?? '', { skip: !id });
  const [createServicePoint, { isLoading: isCreating }] = useCreateServicePointMutation();
  const [updateServicePoint, { isLoading: isUpdating }] = useUpdateServicePointMutation();
  const { data: servicePointsData } = useGetServicePointsQuery({});

  const { data: servicesData } = useGetServiceCategoriesQuery();
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
  const partners = partnersData?.data || [];
  const regions = regionsData?.data || [];
  const cities = citiesData?.data || [];
  const scheduleData = scheduleQueryResult.data;
  const servicePointServicesData = servicePointServicesQueryResult.data;
  const photosData = photosQueryResult.data;

  const loading = partnersLoading || regionsLoading || citiesLoading || servicePointLoading || isCreating || isUpdating;
  const error = null; // Ошибки теперь обрабатываются в каждом хуке отдельно

  const initialValues: ServicePointFormData = useMemo(() => ({
    name: servicePoint?.name || '',
    city_id: servicePoint?.city_id || 0,
    region_id: selectedRegionId || 0,
    address: servicePoint?.address || '',
    is_active: servicePoint?.is_active ?? true,
    latitude: servicePoint?.latitude || null,
    longitude: servicePoint?.longitude || null,
    status_id: servicePoint?.status_id || 1,
    schedule: [
      { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_working_day: true },
      { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_working_day: true },
      { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_working_day: true },
      { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_working_day: true },
      { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_working_day: true },
      { day_of_week: 6, start_time: '10:00', end_time: '17:00', is_working_day: true },
      { day_of_week: 7, start_time: '10:00', end_time: '16:00', is_working_day: false },
    ],
    services: servicePointServicesData || [],
    photos: photosData?.map((photo, index) => ({
      id: Number(photo.id),
      service_point_id: 0, // Будет установлено при сохранении
      url: photo.url,
      description: photo.description || '',
      is_main: index === 0, // Первое фото по умолчанию главное
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) || [],
  }), [servicePoint, selectedRegionId, servicePointServicesData, photosData]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Преобразуем данные формы в правильный формат для API
        const submitData = {
          ...values,
          partner_id: values.partner_id ? Number(values.partner_id) : undefined,
          region_id: values.region_id || undefined,
          city_id: values.city_id || undefined,
        };

        if (isEditMode && id) {
          await updateServicePoint({
            id,
            servicePoint: submitData
          }).unwrap();
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          await createServicePoint(submitData).unwrap();
          setSuccessMessage('Точка обслуживания успешно создана');
          setTimeout(() => {
            navigate('/service-points');
          }, 1500);
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  // Эффект для установки региона при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city_id && cities.length > 0) {
      const city = cities.find((c: City) => c.id.toString() === servicePoint.city_id.toString());
      if (city?.region_id && Number(city.region_id) !== selectedRegionId) {
        setSelectedRegionId(Number(city.region_id));
      }
    }
  }, [servicePoint?.city_id, cities.length, selectedRegionId]);

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

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Контактная информация
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
                  <InputLabel id="region-id-label">Регион</InputLabel>
                  <Select
                    labelId="region-id-label"
                    id="region_id"
                    name="region_id"
                    value={(formik.values.region_id || 0).toString()}
                    onChange={handleRegionChange}
                    onBlur={formik.handleBlur}
                    label="Регион"
                  >
                    <MenuItem value="0" disabled>Выберите регион</MenuItem>
                    {regions.map(region => (
                      <MenuItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formik.touched.city_id && Boolean(formik.errors.city_id)}>
                  <InputLabel id="city-id-label">Город</InputLabel>
                  <Select
                    labelId="city-id-label"
                    id="city_id"
                    name="city_id"
                    value={(formik.values.city_id || 0).toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      formik.setFieldValue('city_id', Number(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Город"
                    disabled={!formik.values.region_id}
                  >
                    <MenuItem value="0" disabled>Выберите город</MenuItem>
                    {cities.map((city: City) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
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
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Параметры обслуживания
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={formik.touched.status_id && Boolean(formik.errors.status_id)}>
                  <InputLabel id="status-id-label">Статус</InputLabel>
                  <Select
                    labelId="status-id-label"
                    id="status_id"
                    name="status_id"
                    value={(formik.values.status_id || 1).toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      formik.setFieldValue('status_id', Number(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Статус"
                  >
                    {servicePointStatuses.map(status => (
                      <MenuItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  График работы
                </Typography>
              </Grid>

              {(formik.values.schedule || []).map((scheduleItem: WorkingHours, index: number) => (
                <Grid item xs={12} md={6} key={scheduleItem.day_of_week}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {getDayName(scheduleItem.day_of_week)}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={scheduleItem.is_working_day}
                                onChange={(e) => {
                                  formik.setFieldValue(`schedule.${index}.is_working_day`, e.target.checked);
                                }}
                                name={`schedule.${index}.is_working_day`}
                              />
                            }
                            label="Рабочий день"
                          />
                        </FormControl>
                      </Grid>

                      {scheduleItem.is_working_day && (
                        <>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Начало работы"
                              value={scheduleItem.start_time}
                              onChange={(e) => {
                                formik.setFieldValue(`schedule.${index}.start_time`, e.target.value);
                              }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Конец работы"
                              value={scheduleItem.end_time}
                              onChange={(e) => {
                                formik.setFieldValue(`schedule.${index}.end_time`, e.target.value);
                              }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Услуги и цены
                </Typography>
              </Grid>

              {(formik.values.services || []).map((service: ServicePointService, index: number) => (
                <Grid item xs={12} md={6} key={service.service_id}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Услуга</InputLabel>
                          <Select
                            value={service.service_id}
                            onChange={(e) => {
                              formik.setFieldValue(`services.${index}.service_id`, e.target.value);
                            }}
                            label="Услуга"
                          >
                            {(servicesData || []).map((serviceItem) => (
                              <MenuItem key={serviceItem.id} value={serviceItem.id}>
                                {serviceItem.name}
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

              {(formik.values.photos || []).map((photo: ServicePointPhoto, index: number) => (
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
    </Box>
  );
};

export default ServicePointFormPage; 