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
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchPartnerById, createPartner, updatePartner, clearError } from '../../store/slices/partnersSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Language as LanguageIcon, Phone as PhoneIcon } from '@mui/icons-material';

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

interface PartnerFormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  company_description: string;
  website: string;
  tax_number: string;
  legal_address: string;
  logo_url: string;
  first_name: string;
  last_name: string;
}

const PartnerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedPartner, loading, error } = useSelector((state: RootState) => state.partners);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchPartnerById(Number(id)));
    }
  }, [isEditMode, id, dispatch]);

  const initialValues: PartnerFormData = {
    company_name: selectedPartner?.company_name || '',
    contact_person: selectedPartner?.contact_person || '',
    email: selectedPartner?.user?.email || '',
    phone: selectedPartner?.user?.phone || '',
    company_description: selectedPartner?.company_description || '',
    website: selectedPartner?.website || '',
    tax_number: selectedPartner?.tax_number || '',
    legal_address: selectedPartner?.legal_address || '',
    logo_url: selectedPartner?.logo_url || '',
    first_name: selectedPartner?.user?.first_name || '',
    last_name: selectedPartner?.user?.last_name || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Сбрасываем ошибки перед отправкой
        setApiErrors({});
        setGeneralError(null);
        
        // Подготовка данных для API
        const userData = {
          email: values.email,
          phone: values.phone,
          first_name: values.first_name,
          last_name: values.last_name,
        };
        
        const partnerData = {
          company_name: values.company_name,
          contact_person: values.contact_person,
          company_description: values.company_description || undefined,
          website: values.website || undefined,
          tax_number: values.tax_number || undefined,
          legal_address: values.legal_address || undefined,
          logo_url: values.logo_url || undefined,
        };
        
        const apiData = {
          ...partnerData,
          user: userData
        };
        
        if (isEditMode && id) {
          await dispatch(updatePartner({ id: Number(id), data: apiData })).unwrap();
          setSuccessMessage('Партнер успешно обновлен');
        } else {
          // Создание нового партнера
          await dispatch(createPartner(apiData)).unwrap();
          setSuccessMessage('Партнер успешно создан. Пароль был сгенерирован автоматически и отправлен на указанный email.');
          setTimeout(() => {
            navigate('/partners');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Ошибка при сохранении:', error);
        
        // Если есть детализация ошибок по полям
        if (error.errors && typeof error.errors === 'object') {
          setApiErrors(error.errors);
          
          // Устанавливаем ошибки в формик
          const formikErrors: any = {};
          
          // Обработка ошибок пользователя
          if (error.errors.user) {
            error.errors.user.forEach((message: string) => {
              if (message.toLowerCase().includes('email')) formikErrors.email = message;
              if (message.toLowerCase().includes('phone')) formikErrors.phone = message;
              if (message.toLowerCase().includes('first name')) formikErrors.first_name = message;
              if (message.toLowerCase().includes('last name')) formikErrors.last_name = message;
            });
          }
          
          // Обработка ошибок партнера
          if (error.errors.partner) {
            error.errors.partner.forEach((message: string) => {
              if (message.toLowerCase().includes('company name')) formikErrors.company_name = message;
              if (message.toLowerCase().includes('contact person')) formikErrors.contact_person = message;
              if (message.toLowerCase().includes('tax number')) formikErrors.tax_number = message;
              if (message.toLowerCase().includes('website')) formikErrors.website = message;
              if (message.toLowerCase().includes('logo')) formikErrors.logo_url = message;
              if (message.toLowerCase().includes('address')) formikErrors.legal_address = message;
              if (message.toLowerCase().includes('description')) formikErrors.company_description = message;
            });
          }
          
          formik.setErrors(formikErrors);
        } else if (error.message) {
          // Общая ошибка
          setGeneralError(error.message || 'Произошла ошибка при сохранении партнера');
        }
      }
    },
  });

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const handleBack = () => {
    navigate('/partners');
  };

  // Отображение подробных ошибок API
  const renderApiErrors = () => {
    if (Object.keys(apiErrors).length === 0 && !generalError) return null;
    
    return (
      <Alert severity="error" sx={{ mb: 2 }} onClose={() => { setApiErrors({}); setGeneralError(null); }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {generalError || (isEditMode ? 'Не удалось обновить партнера' : 'Не удалось создать партнера')}
        </Typography>
        {Object.keys(apiErrors).length > 0 && (
          <List dense disablePadding>
            {Object.entries(apiErrors).map(([category, errors]) => (
              errors.map((error, index) => (
                <ListItem key={`${category}-${index}`} disablePadding>
                  <ListItemText primary={`• ${error}`} />
                </ListItem>
              ))
            ))}
          </List>
        )}
      </Alert>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование партнера' : 'Создание партнера'}
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
      
      {renderApiErrors()}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Основная информация */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="company_name"
                  name="company_name"
                  label="Название компании"
                  value={formik.values.company_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                  helperText={formik.touched.company_name && formik.errors.company_name}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="contact_person"
                  name="contact_person"
                  label="Контактное лицо"
                  value={formik.values.contact_person}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                  helperText={formik.touched.contact_person && formik.errors.contact_person}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
                  helperText={
                    (formik.touched.email && formik.errors.email) || 
                    (!isEditMode && "На этот email будет отправлен пароль для доступа к системе")
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Телефон"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="+380XXXXXXXXX"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="Имя"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Фамилия"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                  required
                />
              </Grid>

              {/* Разделитель и дополнительная информация */}
              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Дополнительная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="website"
                  name="website"
                  label="Веб-сайт"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website || "Укажите полный URL, включая https://"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="https://example.com"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="tax_number"
                  name="tax_number"
                  label="ИНН (не обязательно)"
                  value={formik.values.tax_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tax_number && Boolean(formik.errors.tax_number)}
                  helperText={formik.touched.tax_number && formik.errors.tax_number}
                  placeholder="12345678"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="logo_url"
                  name="logo_url"
                  label="URL логотипа"
                  value={formik.values.logo_url}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.logo_url && Boolean(formik.errors.logo_url)}
                  helperText={formik.touched.logo_url && formik.errors.logo_url || "Укажите прямую ссылку на изображение"}
                  placeholder="https://example.com/logo.png"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="legal_address"
                  name="legal_address"
                  label="Юридический адрес"
                  value={formik.values.legal_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.legal_address && Boolean(formik.errors.legal_address)}
                  helperText={formik.touched.legal_address && formik.errors.legal_address}
                />
              </Grid>
              
              {/* Описание компании (перемещено вниз) */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  id="company_description"
                  name="company_description"
                  label="Описание компании"
                  multiline
                  rows={6}
                  value={formik.values.company_description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company_description && Boolean(formik.errors.company_description)}
                  helperText={formik.touched.company_description && formik.errors.company_description}
                  placeholder="Подробное описание деятельности компании, специализация, предоставляемые услуги и т.д."
                />
              </Grid>

              {/* Кнопки формы */}
              <Grid size={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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

export default PartnerFormPage; 