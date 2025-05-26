import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  Stack,
  List,
  ListItem,
  ListItemText,
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
import { fetchPartnerById, createPartner, updatePartner, clearError, clearSelectedPartner } from '../../store/slices/partnersSlice';
import { fetchRegions } from '../../store/slices/regionsSlice';
import { fetchCities } from '../../store/slices/citiesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Language as LanguageIcon, Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { PartnerFormData, Region, City } from '../../types/models';

// Расширенная схема валидации с более четкими правилами
const validationSchema = yup.object({
  company_name: yup.string()
    .required('Название компании обязательно')
    .min(2, 'Название должно быть не менее 2 символов')
    .max(100, 'Название должно быть не более 100 символов'),
  contact_person: yup.string()
    .required('Контактное лицо обязательно')
    .min(2, 'ФИО должно быть не менее 2 символов'),
  email: yup.string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  phone: yup.string()
    .required('Телефон обязателен')
    .matches(/^\+?[0-9\s\-\(\)]{10,15}$/, 'Введите корректный номер телефона в международном формате (от 10 до 15 символов)'),
  company_description: yup.string()
    .max(2000, 'Описание должно быть не более 2000 символов'),
  website: yup.string()
    .url('Введите корректный URL (например, https://example.com)')
    .nullable(),
  tax_number: yup.string()
    .matches(/^[0-9\-]{8,15}$/, 'Налоговый номер должен содержать от 8 до 15 цифр и дефисов')
    .nullable()
    .optional(),
  legal_address: yup.string()
    .max(200, 'Адрес должен быть не более 200 символов'),
  logo_url: yup.string()
    .url('Введите корректный URL логотипа')
    .nullable(),
  first_name: yup.string()
    .required('Имя обязательно')
    .min(2, 'Имя должно быть не менее 2 символов'),
  last_name: yup.string()
    .required('Фамилия обязательна')
    .min(2, 'Фамилия должна быть не менее 2 символов'),
});

const PartnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const { selectedPartner, loading, error } = useSelector((state: RootState) => state.partners);
  const { regions } = useSelector((state: RootState) => state.regions);
  const { cities } = useSelector((state: RootState) => state.cities);

  const [formData, setFormData] = useState<PartnerFormData>({
    company_name: '',
    region_id: '',
    city_id: '',
    contact_person: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    description: '',
    additional_info: ''
  });

  // Загружаем данные партнера при редактировании
  useEffect(() => {
    if (id) {
      dispatch(fetchPartnerById(Number(id)));
    }
    return () => {
      dispatch(clearSelectedPartner());
    };
  }, [dispatch, id]);

  // Загружаем регионы и города
  useEffect(() => {
    dispatch(fetchRegions({}));
  }, [dispatch]);

  useEffect(() => {
    const regionId = formData.region_id;
    if (regionId && (typeof regionId === 'number' || regionId !== '')) {
      const numericRegionId = Number(regionId);
      if (numericRegionId > 0) {
        dispatch(fetchCities({ region_id: numericRegionId }));
      }
    }
  }, [dispatch, formData.region_id]);

  // Заполняем форму данными партнера при редактировании
  useEffect(() => {
    if (selectedPartner) {
      setFormData({
        company_name: selectedPartner.company_name,
        region_id: selectedPartner.region_id || '',
        city_id: selectedPartner.city_id || '',
        contact_person: selectedPartner.contact_person || '',
        phone: selectedPartner.phone || '',
        email: selectedPartner.email || '',
        website: selectedPartner.website || '',
        address: selectedPartner.address || '',
        description: selectedPartner.description || '',
        additional_info: selectedPartner.additional_info || ''
      });
    }
  }, [selectedPartner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the data with proper type conversion
      const submitData = {
        ...formData,
        region_id: formData.region_id === '' ? undefined : Number(formData.region_id),
        city_id: formData.city_id === '' ? undefined : Number(formData.city_id)
      };
      
      if (id) {
        await dispatch(updatePartner({ id: Number(id), data: submitData })).unwrap();
      } else {
        await dispatch(createPartner(submitData)).unwrap();
      }
      navigate('/partners');
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Редактировать партнера' : 'Создать партнера'}
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Основная информация */}
          <Box>
            <Typography variant="h6" gutterBottom>Основная информация</Typography>
          </Box>
          
          <Box>
            <TextField
              required
              fullWidth
              name="company_name"
              label="Название компании"
              value={formData.company_name}
              onChange={handleChange}
              error={!formData.company_name}
              helperText={!formData.company_name && "Обязательное поле"}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <FormControl fullWidth>
              <InputLabel>Регион</InputLabel>
              <Select
                name="region_id"
                value={formData.region_id?.toString() || ''}
                onChange={handleChange}
                label="Регион"
              >
                <MenuItem value="">Не выбран</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region.id} value={region.id.toString()}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Город</InputLabel>
              <Select
                name="city_id"
                value={formData.city_id?.toString() || ''}
                onChange={handleChange}
                label="Город"
                disabled={!formData.region_id}
              >
                <MenuItem value="">Не выбран</MenuItem>
                {cities.map(city => (
                  <MenuItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Контактная информация */}
          <Box>
            <Typography variant="h6" gutterBottom>Контактная информация</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              name="contact_person"
              label="Контактное лицо"
              value={formData.contact_person}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              name="phone"
              label="Телефон"
              value={formData.phone}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="website"
              label="Веб-сайт"
              value={formData.website}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              name="address"
              label="Адрес"
              value={formData.address}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Дополнительная информация */}
          <Box>
            <Typography variant="h6" gutterBottom>Дополнительная информация</Typography>
          </Box>

          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              label="Описание"
              value={formData.description}
              onChange={handleChange}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="additional_info"
              label="Дополнительная информация"
              value={formData.additional_info}
              onChange={handleChange}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/partners')}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.company_name}
          >
            {id ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerFormPage;