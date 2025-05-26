import React, { useEffect, useState } from 'react';
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
  Grid,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { 
  useGetPartnerQuery, 
  useCreatePartnerMutation, 
  useUpdatePartnerMutation 
} from '../../api/partners';
import { useGetRegionsQuery } from '../../api/regions';
import { useGetCitiesQuery } from '../../api/cities';
import { PartnerFormData } from '../../types/models';

// Схема валидации для всех полей партнера
const validationSchema = yup.object({
  company_name: yup.string()
    .required('Название компании обязательно')
    .min(2, 'Название должно быть не менее 2 символов')
    .max(100, 'Название должно быть не более 100 символов'),
  
  company_description: yup.string()
    .max(2000, 'Описание должно быть не более 2000 символов'),
  
  contact_person: yup.string()
    .required('Контактное лицо обязательно')
    .min(2, 'ФИО должно быть не менее 2 символов'),
  
  website: yup.string()
    .url('Введите корректный URL (например, https://example.com)')
    .nullable(),
  
  tax_number: yup.string()
    .matches(/^[0-9\-]{8,15}$/, 'Налоговый номер должен содержать от 8 до 15 цифр и дефисов')
    .nullable(),
  
  legal_address: yup.string()
    .max(500, 'Адрес должен быть не более 500 символов'),
  
  logo_url: yup.string()
    .url('Введите корректный URL логотипа')
    .nullable(),
});

interface FormValues extends PartnerFormData {
  user?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    password?: string;
  };
}

const PartnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();

  // RTK Query хуки
  const { data: partner, isLoading: partnerLoading } = useGetPartnerQuery(Number(id), { skip: !id });
  const { data: regionsData } = useGetRegionsQuery();
  const { data: citiesData } = useGetCitiesQuery({ region_id: selectedRegionId }, { skip: !selectedRegionId });
  const [createPartner, { isLoading: createLoading }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: updateLoading }] = useUpdatePartnerMutation();

  const formik = useFormik<FormValues>({
    initialValues: {
      company_name: '',
      company_description: '',
      contact_person: '',
      logo_url: '',
      website: '',
      tax_number: '',
      legal_address: '',
      region_id: '',
      city_id: '',
      user: isEdit ? undefined : {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        password: '',
      },
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const submitData: PartnerFormData = {
          company_name: values.company_name,
          company_description: values.company_description || undefined,
          contact_person: values.contact_person || undefined,
          logo_url: values.logo_url || undefined,
          website: values.website || undefined,
          tax_number: values.tax_number || undefined,
          legal_address: values.legal_address || undefined,
          region_id: values.region_id === '' ? undefined : Number(values.region_id),
          city_id: values.city_id === '' ? undefined : Number(values.city_id),
        };

        // Добавляем данные пользователя только при создании
        if (!isEdit && values.user) {
          submitData.user = {
            email: values.user.email,
            phone: values.user.phone,
            first_name: values.user.first_name,
            last_name: values.user.last_name,
            password: values.user.password || undefined,
          };
        }

        if (isEdit) {
          await updatePartner({ id: Number(id), data: submitData }).unwrap();
        } else {
          await createPartner(submitData).unwrap();
        }
        
        navigate('/partners');
      } catch (error) {
        console.error('Ошибка при сохранении партнера:', error);
      }
    },
  });

  // Заполняем форму данными партнера при редактировании
  useEffect(() => {
    if (partner && isEdit) {
      formik.setValues({
        company_name: partner.company_name || '',
        company_description: partner.company_description || '',
        contact_person: partner.contact_person || '',
        logo_url: partner.logo_url || '',
        website: partner.website || '',
        tax_number: partner.tax_number || '',
        legal_address: partner.legal_address || '',
        region_id: partner.region_id || '',
        city_id: partner.city_id || '',
      });
      setSelectedRegionId(partner.region_id);
    }
  }, [partner, isEdit]);

  // Обновляем выбранный регион при изменении
  useEffect(() => {
    const regionId = formik.values.region_id;
    if (regionId && regionId !== '') {
      setSelectedRegionId(Number(regionId));
    } else {
      setSelectedRegionId(undefined);
      formik.setFieldValue('city_id', '');
    }
  }, [formik.values.region_id]);

  if (partnerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const isLoading = createLoading || updateLoading;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Заголовок и навигация */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/partners')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Редактировать партнера' : 'Создать партнера'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
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
              />
            </Grid>

            {/* Юридическая информация */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Юридическая информация
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="tax_number"
                label="Налоговый номер"
                placeholder="12345678"
                value={formik.values.tax_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tax_number && Boolean(formik.errors.tax_number)}
                helperText={formik.touched.tax_number && formik.errors.tax_number}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="legal_address"
                label="Юридический адрес"
                value={formik.values.legal_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.legal_address && Boolean(formik.errors.legal_address)}
                helperText={formik.touched.legal_address && formik.errors.legal_address}
              />
            </Grid>

            {/* Местоположение */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Местоположение
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Регион</InputLabel>
                <Select
                  name="region_id"
                  value={formik.values.region_id?.toString() || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                >
                  <MenuItem value="">Не выбран</MenuItem>
                  {regionsData?.regions?.map((region) => (
                    <MenuItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Город</InputLabel>
                <Select
                  name="city_id"
                  value={formik.values.city_id?.toString() || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city_id && Boolean(formik.errors.city_id)}
                  disabled={!formik.values.region_id}
                >
                  <MenuItem value="">Не выбран</MenuItem>
                  {citiesData?.cities?.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Данные пользователя (только при создании) */}
            {!isEdit && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Данные пользователя
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                    error={formik.touched.user?.first_name && Boolean(formik.errors.user?.first_name)}
                    helperText={formik.touched.user?.first_name && formik.errors.user?.first_name}
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
                    error={formik.touched.user?.last_name && Boolean(formik.errors.user?.last_name)}
                    helperText={formik.touched.user?.last_name && formik.errors.user?.last_name}
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
                    error={formik.touched.user?.email && Boolean(formik.errors.user?.email)}
                    helperText={formik.touched.user?.email && formik.errors.user?.email}
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
                    error={formik.touched.user?.phone && Boolean(formik.errors.user?.phone)}
                    helperText={formik.touched.user?.phone && formik.errors.user?.phone}
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
                    error={formik.touched.user?.password && Boolean(formik.errors.user?.password)}
                    helperText={formik.touched.user?.password && formik.errors.user?.password}
                  />
                </Grid>
              </>
            )}

            {/* Кнопки действий */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/partners')}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading || !formik.isValid}
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