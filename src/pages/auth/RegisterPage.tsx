import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Alert, RadioGroup, Radio, Divider } from '../../components/ui';
import { useTheme, Toolbar, FormControl, FormLabel, FormControlLabel, InputAdornment } from '@mui/material';
import { AppBar } from '@mui/material'; // TODO: Проверить доступность в UI библиотеке;
import { Button, TextField, PhoneField } from '../../components/ui';
import { useRegisterClientMutation } from '../../api/clientAuth.api';
import { typography, spacing } from '../../styles/theme/tokens';
import { phoneValidation } from '../../utils/validation';
import { getAuthStyles } from '../../styles';
import { 
  ArrowBack as ArrowBackIcon,
  Email,
  Phone
} from '@mui/icons-material';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const getValidationSchema = (registrationType: 'email' | 'phone', t: any) => {
  const baseSchema = {
    first_name: Yup.string()
      .min(2, t('forms.auth.validation.first_name_min_length'))
      .required(t('forms.auth.validation.first_name_required')),
    last_name: Yup.string()
      .min(2, t('forms.auth.validation.last_name_min_length'))
      .required(t('forms.auth.validation.last_name_required')),
    password: Yup.string()
      .min(6, t('forms.auth.validation.password_too_short'))
      .required(t('forms.auth.validation.password_required')),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], t('forms.auth.validation.passwords_must_match'))
      .required(t('forms.auth.validation.confirm_password_required')),
  };

  if (registrationType === 'email') {
    return Yup.object({
      ...baseSchema,
      email: Yup.string()
        .email(t('forms.auth.validation.invalid_email_format'))
        .required(t('forms.auth.validation.email_required')),
      phone: Yup.string(), // Необязательно при регистрации по email
    });
  } else {
    return Yup.object({
      ...baseSchema,
      phone: phoneValidation.required(t('forms.auth.validation.phone_required')),
      email: Yup.string()
        .email(t('forms.auth.validation.invalid_email_format')), // Необязательно при регистрации по телефону
    });
  }
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const [registerClient, { isLoading, error }] = useRegisterClientMutation();
  const authStyles = getAuthStyles(theme);
  const [registrationType, setRegistrationType] = useState<'email' | 'phone'>('email');

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: getValidationSchema(registrationType, t),
    enableReinitialize: true, // Пересоздавать валидацию при изменении типа
    onSubmit: async (values) => {
      try {
        // Подготавливаем данные в зависимости от типа регистрации
        const userData: any = {
          first_name: values.first_name,
          last_name: values.last_name,
          password: values.password,
          password_confirmation: values.password_confirmation,
        };

        if (registrationType === 'email') {
          userData.email = values.email;
          if (values.phone) {
            userData.phone = values.phone;
          }
        } else {
          userData.phone = values.phone;
          if (values.email) {
            userData.email = values.email;
          }
        }

        await registerClient({
          user: userData,
        }).unwrap();
        navigate('/client');
      } catch (err) {
        console.error(t('forms.auth.registerError'), err);
      }
    },
  });

  // Обработка смены типа регистрации
  const handleRegistrationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as 'email' | 'phone';
    setRegistrationType(newType);
    
    // Очищаем ошибки и значения неиспользуемых полей при смене типа
    if (newType === 'email') {
      formik.setFieldError('phone', undefined);
      formik.setFieldValue('phone', '');
    } else {
      formik.setFieldError('email', undefined);
      formik.setFieldValue('email', '');
    }
  };

  const handleSkipRegistration = () => {
    navigate('/client');
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            variant="text"
            color="inherit"
          >
            {t('forms.auth.back')}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', // Вычитаем высоту AppBar
        padding: spacing.md,
        backgroundColor: theme.palette.background.default,
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: spacing.md,
          padding: spacing.xl,
          boxShadow: theme.shadows[3],
        }}>
          <Typography 
            variant="h4" 
            sx={{
              textAlign: 'center',
              marginBottom: spacing.xl,
              color: theme.palette.primary.main,
              fontWeight: typography.fontWeights.bold,
              fontSize: typography.fontSize['2xl'],
            }}
          >
            {t('forms.auth.register')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: spacing.md }}>
              {(error as any)?.data?.error || t('forms.auth.registerError')}
            </Alert>
          )}

          {/* Google OAuth кнопка */}
          <GoogleLoginButton 
            onSuccess={() => navigate('/client')}
            onError={(error) => console.error('Google OAuth error:', error)}
            disabled={isLoading}
            variant="outlined"
            fullWidth
          />

          {/* Разделитель */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
              {t('auth.google.or')}
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <form onSubmit={formik.handleSubmit}>
            {/* Выбор типа регистрации */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: 'fit-content' }}>
                {t('forms.auth.registrationMethod')}
              </Typography>
              
              <RadioGroup
                row
                value={registrationType}
                onChange={handleRegistrationTypeChange}
                sx={{ flex: 1, justifyContent: 'flex-end' }}
              >
                <FormControlLabel
                  value="email"
                  control={<Radio size="small" />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" />
                      <span>{t('forms.auth.email')}</span>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="phone"
                  control={<Radio size="small" />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" />
                      <span>{t('forms.auth.phone')}</span>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>

            <TextField
              fullWidth
              id="first_name"
              name="first_name"
              label={t('forms.auth.firstName')}
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              sx={{ marginBottom: spacing.md }}
            />

            <TextField
              fullWidth
              id="last_name"
              name="last_name"
              label={t('forms.auth.lastName')}
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              sx={{ marginBottom: spacing.md }}
            />

            {/* Основное поле (email или телефон) */}
            {registrationType === 'email' ? (
              <TextField
                fullWidth
                id="email"
                name="email"
                label={t('forms.auth.email')}
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                placeholder="example@email.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ marginBottom: spacing.md }}
              />
            ) : (
              <PhoneField
                fullWidth
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue('phone', value)}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={{ marginBottom: spacing.md }}
              />
            )}



            {/* Поля пароля на одной строке */}
            <Box sx={{ display: 'flex', gap: 2, marginBottom: spacing.lg }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label={t('forms.auth.password')}
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />

              <TextField
                fullWidth
                id="password_confirmation"
                name="password_confirmation"
                label={t('forms.auth.confirmPassword')}
                type="password"
                value={formik.values.password_confirmation}
                onChange={formik.handleChange}
                error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
                helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleSkipRegistration}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {t('forms.auth.cancel')}
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {isLoading ? t('forms.auth.registering') : t('forms.auth.registerButton')}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default RegisterPage; 