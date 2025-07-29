import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';

// Импорты компонентов
import { TextField } from '../../components/ui/TextField/TextField';
import { Select } from '../../components/ui/Select/Select';
import { PhoneField } from '../../components/ui/PhoneField/PhoneField';
import { getThemeColors } from '../../styles/theme';

// Импорты API и типов
import { useCreatePartnerApplicationMutation } from '../../api/partnerApplications.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import { PartnerApplicationFormData } from '../../types/PartnerApplication';

// Шаги формы
const steps = [
  'Основная информация',
  'Контактные данные',
  'Адрес и локация',
  'Дополнительная информация'
];

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
    .matches(/^\+?[1-9]\d{1,14}$/, 'Некорректный формат телефона'),
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
  
  const [activeStep, setActiveStep] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
        const result = await createApplication(values).unwrap();
        setSubmitSuccess(true);
        console.log('Заявка успешно отправлена:', result);
        
        // Показываем успешное сообщение и перенаправляем через 3 секунды
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Ошибка при отправке заявки:', error);
      }
    },
  });

  // API хуки
  const [createApplication, { isLoading: isSubmitting }] = useCreatePartnerApplicationMutation();
  const { data: regionsData } = useGetRegionsQuery({});
  const { data: citiesData } = useGetCitiesQuery({ 
    region_id: formik.values.region_id || undefined
  });

  // Обработчики шагов
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    const stepFields = getStepFields(activeStep);
    return stepFields.every(field => {
      const error = formik.errors[field as keyof PartnerApplicationFormData];
      const touched = formik.touched[field as keyof PartnerApplicationFormData];
      return !error || !touched;
    });
  };

  // Получение полей для текущего шага
  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0: return ['company_name', 'business_description'];
      case 1: return ['contact_person', 'email', 'phone'];
      case 2: return ['region_id', 'city_record_id', 'city', 'address'];
      case 3: return ['website', 'additional_info', 'expected_service_points'];
      default: return [];
    }
  };

  // Проверка заполненности текущего шага
  const isStepCompleted = (step: number): boolean => {
    const stepFields = getStepFields(step);
    return stepFields.every(field => {
      const value = formik.values[field as keyof PartnerApplicationFormData];
      if (field === 'region_id' || field === 'city_record_id') {
        return value && value > 0;
      }
      if (field === 'website' || field === 'additional_info' || field === 'address') {
        return true; // Опциональные поля
      }
      return value && value.toString().trim() !== '';
    });
  };

  // Рендер содержимого шага
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
                multiline
                rows={4}
                name="business_description"
                label="Описание бизнеса *"
                value={formik.values.business_description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.business_description && Boolean(formik.errors.business_description)}
                helperText={formik.touched.business_description && formik.errors.business_description}
                placeholder="Опишите ваш бизнес, услуги, опыт работы..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
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
            <Grid item xs={12} md={6}>
              <PhoneField
                fullWidth
                name="phone"
                label="Телефон *"
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue('phone', value)}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                name="region_id"
                label="Регион"
                value={formik.values.region_id}
                onChange={(e) => {
                  formik.setFieldValue('region_id', e.target.value);
                  formik.setFieldValue('city_record_id', 0); // Сброс города при смене региона
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                helperText={formik.touched.region_id && formik.errors.region_id}
              >
                <option value={0}>Выберите регион</option>
                {regionsData?.data?.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                name="city_record_id"
                label="Город из списка"
                value={formik.values.city_record_id}
                onChange={(e) => {
                  const cityId = Number(e.target.value);
                  formik.setFieldValue('city_record_id', cityId);
                  
                  // Автозаполнение поля city
                  if (cityId > 0) {
                    const selectedCity = citiesData?.data?.find(c => c.id === cityId);
                    if (selectedCity) {
                      formik.setFieldValue('city', selectedCity.name);
                    }
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.city_record_id && Boolean(formik.errors.city_record_id)}
                helperText={formik.touched.city_record_id && formik.errors.city_record_id}
                disabled={!formik.values.region_id}
              >
                <option value={0}>Выберите город</option>
                {citiesData?.data?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="city"
                label="Город *"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city || 'Укажите город, если его нет в списке выше'}
                placeholder="Название города"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="expected_service_points"
                label="Ожидаемое количество точек *"
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
                multiline
                rows={4}
                name="additional_info"
                label="Дополнительная информация"
                value={formik.values.additional_info}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.additional_info && Boolean(formik.errors.additional_info)}
                helperText={formik.touched.additional_info && formik.errors.additional_info}
                placeholder="Любая дополнительная информация о вашем бизнесе..."
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: colors.success, mb: 2 }}>
            🎉 Заявка успешно отправлена!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Спасибо за ваш интерес к сотрудничеству! Мы рассмотрим вашу заявку в ближайшее время и свяжемся с вами.
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Перенаправление на главную страницу через несколько секунд...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Заголовок */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Заявка на партнерство
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Присоединяйтесь к нашей сети сервисных центров
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={isStepCompleted(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Форма */}
        <form onSubmit={formik.handleSubmit}>
          {/* Содержимое шага */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Кнопки навигации */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Назад
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !formik.isValid}
                  startIcon={isSubmitting && <CircularProgress size={20} />}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={!isStepCompleted(activeStep)}
                >
                  Далее
                </Button>
              )}
            </Box>
          </Box>
        </form>

        {/* Информация о обработке данных */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Отправляя заявку, вы соглашаетесь на обработку персональных данных в соответствии с нашей политикой конфиденциальности.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default BusinessApplicationPage; 