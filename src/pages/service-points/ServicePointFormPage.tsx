import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchServicePointById, createServicePoint, updateServicePoint, clearError } from '../../store/slices/servicePointsSlice';
import { fetchPartners } from '../../store/slices/partnersSlice';
import { fetchRegions } from '../../store/slices/regionsSlice';
import { fetchCities } from '../../store/slices/citiesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

// Схема валидации
const validationSchema = yup.object({
  name: yup.string().required('Название точки обязательно'),
  partner_id: yup.number().required('Партнер обязателен'),
  address: yup.string().required('Адрес обязателен'),
  city_id: yup.number().required('Город обязателен'),
  region_id: yup.number().required('Регион обязателен'),
  contact_phone: yup.string().required('Контактный телефон обязателен'),
  description: yup.string(),
  status_id: yup.number().required('Статус обязателен'),
  post_count: yup.number().min(1, 'Количество постов должно быть не менее 1'),
  default_slot_duration: yup.number().min(5, 'Длительность по умолчанию должна быть не менее 5 минут'),
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
});

interface ServicePointFormData {
  name: string;
  partner_id: number;
  description: string;
  city_id: number;
  region_id: number;
  address: string;
  contact_phone: string;
  status_id: number;
  post_count: number;
  default_slot_duration: number;
  latitude?: number | null;
  longitude?: number | null;
}

// Статусы точек обслуживания (в будущем можно загружать с сервера)
const mockServicePointStatuses = [
  { id: 1, name: 'Активна', color: '#4caf50' },
  { id: 2, name: 'Приостановлена', color: '#ff9800' },
  { id: 3, name: 'Заблокирована', color: '#f44336' },
];

const ServicePointFormPage: React.FC = () => {
  const { partnerId, id } = useParams<{ partnerId: string; id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedServicePoint, loading, error } = useSelector((state: RootState) => state.servicePoints);
  const { partners } = useSelector((state: RootState) => state.partners);
  const { regions } = useSelector((state: RootState) => state.regions);
  const { cities } = useSelector((state: RootState) => state.cities);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [servicePointStatuses] = useState(mockServicePointStatuses);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchPartners({}));
    // Загружаем список всех регионов для выпадающего списка
    dispatch(fetchRegions({}));
    
    if (isEditMode && id) {
      dispatch(fetchServicePointById(Number(id)))
        .unwrap()
        .then((servicePoint) => {
          // После получения данных о точке обслуживания, определяем её регион через город
          if (servicePoint.city_id) {
            // Сначала загружаем все города чтобы найти регион для города точки обслуживания
            dispatch(fetchCities({ region_id: null }))
              .unwrap()
              .then((citiesData) => {
                const city = citiesData.cities.find((c: any) => c.id === servicePoint.city_id);
                if (city && city.region_id) {
                  // Когда нашли регион города, устанавливаем его как выбранный
                  setSelectedRegionId(city.region_id);
                  // И загружаем города, относящиеся к этому региону
                  dispatch(fetchCities({ region_id: city.region_id }));
                }
              });
          }
        });
    } else {
      // В режиме создания загружаем все города
      dispatch(fetchCities({ region_id: null }));
    }
  }, [isEditMode, id, dispatch]);

  // Фильтрация городов при изменении выбранного региона
  useEffect(() => {
    if (selectedRegionId) {
      // Если выбран регион, фильтруем города только этого региона
      setFilteredCities(cities.filter((city: any) => city.region_id === selectedRegionId));
    } else {
      // Если регион не выбран, показываем все города
      setFilteredCities(cities);
    }
  }, [cities, selectedRegionId]);

  const initialValues: ServicePointFormData = {
    name: selectedServicePoint?.name || '',
    partner_id: selectedServicePoint?.partner_id || (partnerId ? Number(partnerId) : 0),
    description: selectedServicePoint?.description || '',
    city_id: selectedServicePoint?.city_id || 0,
    region_id: selectedRegionId || 0,
    address: selectedServicePoint?.address || '',
    contact_phone: selectedServicePoint?.contact_phone || '',
    status_id: selectedServicePoint?.status_id || 1,
    post_count: selectedServicePoint?.post_count || 1,
    default_slot_duration: selectedServicePoint?.default_slot_duration || 30,
    latitude: selectedServicePoint?.latitude || null,
    longitude: selectedServicePoint?.longitude || null,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEditMode && id && partnerId) {
          await dispatch(updateServicePoint({
            partnerId: Number(partnerId),
            id: Number(id),
            data: values
          })).unwrap();
          setSuccessMessage('Точка обслуживания успешно обновлена');
        } else {
          const targetPartnerId = values.partner_id;
          await dispatch(createServicePoint({
            partnerId: targetPartnerId,
            data: values
          })).unwrap();
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

  // Обработчик изменения выбранного региона
  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const regionId = Number(event.target.value);
    // Устанавливаем выбранный регион в состояние
    setSelectedRegionId(regionId);
    // Обновляем значение в форме
    formik.setFieldValue('region_id', regionId);
    // Сбрасываем выбранный город, так как он может не принадлежать выбранному региону
    formik.setFieldValue('city_id', 0);
    // Загружаем города для выбранного региона
    dispatch(fetchCities({ region_id: regionId }));
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const handleBack = () => {
    navigate('/service-points');
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
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
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}>
                  <InputLabel id="partner-id-label">Партнер</InputLabel>
                  <Select
                    labelId="partner-id-label"
                    id="partner_id"
                    name="partner_id"
                    value={formik.values.partner_id.toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      formik.setFieldValue('partner_id', Number(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Партнер"
                    disabled={isEditMode} // Нельзя изменить партнера в режиме редактирования
                  >
                    <MenuItem value="0" disabled>Выберите партнера</MenuItem>
                    {partners.map(partner => (
                      <MenuItem key={partner.id} value={partner.id.toString()}>
                        {partner.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
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

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Контактная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
                  <InputLabel id="region-id-label">Регион</InputLabel>
                  <Select
                    labelId="region-id-label"
                    id="region_id"
                    name="region_id"
                    value={formik.values.region_id.toString()}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={formik.touched.city_id && Boolean(formik.errors.city_id)}>
                  <InputLabel id="city-id-label">Город</InputLabel>
                  <Select
                    labelId="city-id-label"
                    id="city_id"
                    name="city_id"
                    value={formik.values.city_id.toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      formik.setFieldValue('city_id', Number(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                    label="Город"
                    disabled={!formik.values.region_id}
                  >
                    <MenuItem value="0" disabled>Выберите город</MenuItem>
                    {filteredCities.map((city: any) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Параметры обслуживания
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth error={formik.touched.status_id && Boolean(formik.errors.status_id)}>
                  <InputLabel id="status-id-label">Статус</InputLabel>
                  <Select
                    labelId="status-id-label"
                    id="status_id"
                    name="status_id"
                    value={formik.values.status_id.toString()}
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

              <Grid size={{ xs: 12, md: 4 }}>
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
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  id="default_slot_duration"
                  name="default_slot_duration"
                  label="Длительность слота (мин)"
                  type="number"
                  value={formik.values.default_slot_duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.default_slot_duration && Boolean(formik.errors.default_slot_duration)}
                  helperText={formik.touched.default_slot_duration && formik.errors.default_slot_duration}
                />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={handleBack}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicePointFormPage; 