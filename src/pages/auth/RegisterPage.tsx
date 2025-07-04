import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  Typography, 
  Alert, 
  useTheme, 
  AppBar, 
  Toolbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment
} from '@mui/material';
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

const getValidationSchema = (registrationType: 'email' | 'phone') => {
  const baseSchema = {
    first_name: Yup.string()
      .min(2, 'Имя должно быть не менее 2 символов')
      .required('Имя обязательно'),
    last_name: Yup.string()
      .min(2, 'Фамилия должна быть не менее 2 символов')
      .required('Фамилия обязательна'),
    password: Yup.string()
      .min(6, 'Пароль должен быть не менее 6 символов')
      .required('Пароль обязателен'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
      .required('Подтверждение пароля обязательно'),
  };

  if (registrationType === 'email') {
    return Yup.object({
      ...baseSchema,
      email: Yup.string()
        .email('Неверный формат email')
        .required('Email обязателен'),
      phone: Yup.string(), // Необязательно при регистрации по email
    });
  } else {
    return Yup.object({
      ...baseSchema,
      phone: phoneValidation.required('Телефон обязателен'),
      email: Yup.string()
        .email('Неверный формат email'), // Необязательно при регистрации по телефону
    });
  }
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
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
    validationSchema: getValidationSchema(registrationType),
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
        console.error('Ошибка при регистрации:', err);
      }
    },
  });

  // Обработка смены типа регистрации
  const handleRegistrationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as 'email' | 'phone';
    setRegistrationType(newType);
    
    // Очищаем ошибки при смене типа
    if (newType === 'email') {
      formik.setFieldError('phone', undefined);
    } else {
      formik.setFieldError('email', undefined);
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
            Назад
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
            Регистрация
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: spacing.md }}>
              {(error as any)?.data?.error || 'Ошибка при регистрации'}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            {/* Выбор типа регистрации */}
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend">
                <Typography variant="subtitle2" color="textSecondary">
                  Способ регистрации
                </Typography>
              </FormLabel>
              <RadioGroup
                row
                value={registrationType}
                onChange={handleRegistrationTypeChange}
                sx={{ justifyContent: 'center', mt: 1 }}
              >
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" />
                      <span>Email</span>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="phone"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" />
                      <span>Телефон</span>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              id="first_name"
              name="first_name"
              label="Имя"
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
              label="Фамилия"
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
                label="Email"
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

            {/* Дополнительное поле (необязательное) */}
            {registrationType === 'email' ? (
              <PhoneField
                fullWidth
                label="Телефон (необязательно)"
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue('phone', value)}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={{ marginBottom: spacing.md }}
              />
            ) : (
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email (необязательно)"
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
            )}

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Пароль"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ marginBottom: spacing.md }}
            />

            <TextField
              fullWidth
              id="password_confirmation"
              name="password_confirmation"
              label="Подтверждение пароля"
              type="password"
              value={formik.values.password_confirmation}
              onChange={formik.handleChange}
              error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
              helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
              sx={{ marginBottom: spacing.lg }}
            />

            <Box sx={authStyles.authActions}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={authStyles.authSubmit}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={handleSkipRegistration}
                sx={authStyles.skipButton}
              >
                Продолжить без регистрации
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default RegisterPage; 