import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';

// Импорты компонентов
import { TextField } from '../../components/ui/TextField/TextField';
import { Select } from '../../components/ui/Select/Select';
import { PhoneField } from '../../components/ui/PhoneField/PhoneField';
import { getThemeColors } from '../../styles/theme';
import ClientLayout from '../../components/client/ClientLayout';
import { usePageTitleFocus } from '../../hooks/useNavigationFocus';

// Импорты API и типов
import { useCreatePartnerApplicationMutation } from '../../api/partnerApplications.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import { PartnerApplicationFormData } from '../../types/PartnerApplication';

// Секции формы для группировки полей
const formSections = {
  basic: 'Основная информация',
  contact: 'Контактные данные', 
  location: 'Адрес и локация',
  additional: 'Дополнительная информация'
};

// Схема валидации
const validationSchema = Yup.object({
  company_name: Yup.string()
    .required('Название компании обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  business_description: Yup.string()
    .required('Описание бизнеса обязательно')
    .min(10, 'Минимум 10 символов')
    .max(1000, 'Максимум 1000 символов'),
  contact_person: Yup.string()
    .required('Контактное лицо обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: Yup.string()
    .required('Email обязателен')
    .email('Некорректный формат email'),
  phone: Yup.string()
    .required('Телефон обязателен')
    .test('phone-format', 'Некорректный формат телефона', function(value) {
      if (!value) return false;
      
      // Убираем все символы кроме цифр
      const digitsOnly = value.replace(/\D/g, '');
      
      // Проверяем украинские номера: должно быть 12 цифр, начинающихся с 380
      if (digitsOnly.startsWith('380') && digitsOnly.length === 12) {
        return true;
      }
      
      // Проверяем номера без кода страны: должно быть 10 цифр, начинающихся с 0
      if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
        return true;
      }
      
      // Проверяем номера с кодом +38: должно быть 10 цифр после 38
      if (digitsOnly.startsWith('38') && digitsOnly.length === 12) {
        return true;
      }
      
      return false;
    }),
  city: Yup.string()
    .required('Город обязателен')
    .min(2, 'Минимум 2 символа')
    .max(50, 'Максимум 50 символов'),
  address: Yup.string()
    .max(255, 'Максимум 255 символов'),
  website: Yup.string()
    .url('Некорректный формат URL'),
  additional_info: Yup.string()
    .max(1000, 'Максимум 1000 символов'),
  expected_service_points: Yup.number()
    .required('Количество точек обязательно')
    .min(1, 'Минимум 1 точка')
    .max(99, 'Максимум 99 точек'),
  region_id: Yup.number()
    .min(1, 'Выберите регион'),
  city_record_id: Yup.number()
    .min(1, 'Выберите город'),
});

const BusinessApplicationPage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Хук для автофокуса на заголовке при переходах
  const titleRef = usePageTitleFocus();

  // Формик для управления формой
  const formik = useFormik<PartnerApplicationFormData>({
    initialValues: {
      company_name: '',
      business_description: '',
      contact_person: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      region_id: 0,
      city_record_id: 0,
      website: '',
      additional_info: '',
      expected_service_points: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createApplication(values).unwrap();
        setSubmitSuccess(true);
        
        // Перенаправляем через 3 секунды
        setTimeout(() => {
          navigate('/client');
        }, 3000);
      } catch (error) {
        // Ошибка будет обработана через состояние isLoading
      }
    },
  });

  // API хуки
  const [createApplication, { isLoading: isSubmitting }] = useCreatePartnerApplicationMutation();
  const { data: regionsData } = useGetRegionsQuery({});
  const { data: citiesData } = useGetCitiesQuery({ 
    region_id: formik.values.region_id || undefined
  });

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formik.handleSubmit(e);
  };





  // Рендер компактной формы
  const renderCompactForm = () => {
    const spacing = isMobile ? 2 : 3;
    const textFieldSize = isMobile ? 'small' : 'medium';
    const multilineRows = isMobile ? 2 : 3;
    
    return (
      <Grid container spacing={spacing}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            name="company_name"
            label="Название компании *"
            value={formik.values.company_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.company_name && Boolean(formik.errors.company_name)}
            helperText={formik.touched.company_name && formik.errors.company_name}
            placeholder="ООО Шиномонтаж Плюс"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            multiline
            rows={multilineRows}
            name="business_description"
            label="Описание бизнеса *"
            value={formik.values.business_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.business_description && Boolean(formik.errors.business_description)}
            helperText={formik.touched.business_description && formik.errors.business_description}
            placeholder={isMobile ? 'Опишите ваш бизнес...' : 'Опишите ваш бизнес, услуги, опыт работы...'}
          />
        </Grid>

        {/* Контактные данные */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            name="contact_person"
            label="Контактное лицо *"
            value={formik.values.contact_person}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
            helperText={formik.touched.contact_person && formik.errors.contact_person}
            placeholder="Иван Петренко"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size={textFieldSize}
            type="email"
            name="email"
            label="Email *"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            placeholder="example@company.com"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <PhoneField
            fullWidth
            size={textFieldSize}
            name="phone"
            label="Телефон *"
            value={formik.values.phone}
            onChange={(value) => formik.setFieldValue('phone', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>

        {/* Локация */}
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            size={textFieldSize}
            name="region_id"
            label="Регион *"
            value={formik.values.region_id}
            onChange={(value) => {
              formik.setFieldValue('region_id', Number(value));
              formik.setFieldValue('city_record_id', 0);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.region_id && Boolean(formik.errors.region_id)}
            helperText={formik.touched.region_id && formik.errors.region_id ? formik.errors.region_id : undefined}
          >
            <MenuItem value={0}>Выберите регион</MenuItem>
            {regionsData?.data?.map((region) => (
              <MenuItem key={region.id} value={region.id}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            size={textFieldSize}
            name="city_record_id"
            label="Город из списка"
            value={formik.values.city_record_id}
            onChange={(value) => {
              const cityId = Number(value);
              formik.setFieldValue('city_record_id', cityId);
              
              if (cityId > 0) {
                const selectedCity = citiesData?.data?.find(c => c.id === cityId);
                if (selectedCity) {
                  formik.setFieldValue('city', selectedCity.name);
                }
              }
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.city_record_id && Boolean(formik.errors.city_record_id)}
            helperText={formik.touched.city_record_id && formik.errors.city_record_id ? formik.errors.city_record_id : undefined}
            disabled={!formik.values.region_id}
          >
            <MenuItem value={0}>Выберите город</MenuItem>
            {citiesData?.data?.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            name="city"
            label="Город *"
            value={formik.values.city}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.city && Boolean(formik.errors.city)}
            helperText={formik.touched.city && formik.errors.city || (isMobile ? 'Укажите город' : 'Укажите город, если его нет в списке выше')}
            placeholder="Название города"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            name="address"
            label="Адрес"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            placeholder="ул. Примерная, 123"
          />
        </Grid>

        {/* Дополнительная информация */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size={textFieldSize}
            name="website"
            label="Веб-сайт"
            value={formik.values.website}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.website && Boolean(formik.errors.website)}
            helperText={formik.touched.website && formik.errors.website}
            placeholder="https://example.com"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size={textFieldSize}
            type="number"
            name="expected_service_points"
            label={isMobile ? 'Кол-во точек *' : 'Ожидаемое количество точек *'}
            value={formik.values.expected_service_points}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.expected_service_points && Boolean(formik.errors.expected_service_points)}
            helperText={formik.touched.expected_service_points && formik.errors.expected_service_points}
            inputProps={{ min: 1, max: 99 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={textFieldSize}
            multiline
            rows={multilineRows}
            name="additional_info"
            label="Дополнительная информация"
            value={formik.values.additional_info}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.additional_info && Boolean(formik.errors.additional_info)}
            helperText={formik.touched.additional_info && formik.errors.additional_info}
            placeholder={isMobile ? 'Дополнительная информация...' : 'Любая дополнительная информация о вашем бизнесе...'}
          />
        </Grid>
      </Grid>
    );
  };

  if (submitSuccess) {
    return (
      <Container 
        maxWidth={false}
        sx={{ 
          maxWidth: isMobile ? '100%' : '500px',
          py: isMobile ? 2 : 3,
          px: isMobile ? 1 : 2
        }}
      >
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          boxShadow: isMobile ? 1 : 3
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ color: colors.success, mb: isMobile ? 1 : 2 }}
          >
            🎉 Заявка отправлена!
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ mb: isMobile ? 1 : 2 }}
          >
            Мы свяжемся с вами в ближайшее время.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <ClientLayout>
      <Container 
        maxWidth={false}
        sx={{ 
          maxWidth: isMobile ? '100%' : '600px',
          py: isMobile ? 1 : 3,
          px: isMobile ? 1 : 2
        }}
      >
        <Paper sx={{ 
          p: isMobile ? 1.5 : 3,
          boxShadow: isMobile ? 1 : 3
        }}>
          {/* Заголовок */}
          <Box sx={{ mb: isMobile ? 2 : 3, textAlign: 'center' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              ref={titleRef}
              tabIndex={-1}
              component="h1"
              sx={{
                fontWeight: 600, 
                mb: isMobile ? 0.5 : 1,
                outline: 'none',
                '&:focus': {
                  outline: `2px solid ${colors.primary}`,
                  outlineOffset: '4px',
                  borderRadius: '4px'
                }
              }}
            >
              Заявка на партнерство
            </Typography>
          </Box>

          {/* Компактная форма */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              {renderCompactForm()}
            </Box>

            {/* Кнопка отправки */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mt: isMobile ? 2 : 3
            }}>
              <Button
                type="submit"
                variant="contained"
                size={isMobile ? 'medium' : 'large'}
                disabled={isSubmitting || !formik.isValid}
                startIcon={isSubmitting && <CircularProgress size={20} />}
                fullWidth={isMobile}
                sx={{
                  minWidth: isMobile ? 'auto' : 200,
                  py: isMobile ? 1.5 : 2
                }}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </ClientLayout>
  );
};

export default BusinessApplicationPage; 