import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, getCurrentUser } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Введіть коректний email')
    .required('Email обов\'язковий для заповнення'),
  password: yup
    .string()
    .required('Пароль обов\'язковий для заповнення'),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);
  const [directLoginError, setDirectLoginError] = useState<string | null>(null);
  const [directLoading, setDirectLoading] = useState(false);
  
  // Flag to track if we're logging in manually (vs redirecting due to isAuthenticated)
  const [isManualLogin, setIsManualLogin] = useState(false);

  // Only check authentication status if not in the middle of a manual login
  useEffect(() => {
    // If we're not doing a manual login and the user is authenticated
    if (!isManualLogin && isAuthenticated) {
      // Add a delay before redirecting to prevent flash of login screen
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate, isManualLogin]);

  // Direct API call for login
  const directLogin = async (email: string, password: string) => {
    setDirectLoading(true);
    setDirectLoginError(null);
    setIsManualLogin(true); // Set flag to prevent automatic redirect
    
    try {
      console.log('Attempting to login with credentials:', { email, password: '***' });
      
      // Используем authApi вместо прямого вызова axios
      const response = await authApi.login(email, password);
      
      console.log('Login response:', response.data);
      
      // Store token in localStorage
      localStorage.setItem('tvoya_shina_token', response.data.auth_token);
      console.log('Token saved to localStorage');
      
      // Dispatch login action to update Redux state
      await dispatch(login(response.data));
      console.log('Redux state updated');
      
      // Получить пользователя и обновить Redux
      await dispatch(getCurrentUser());
      console.log('User loaded into Redux');
      
      // Only navigate after everything is complete
      console.log('Attempting to navigate to dashboard...');
      navigate('/dashboard', { replace: true });
      
      // Reset manual login flag after successful login and navigation
      setIsManualLogin(false);
    } catch (err: any) {
      console.error('Login error details:', err);
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setDirectLoginError('API сервер недоступен. Убедитесь, что сервер запущен на порту 8000.');
      } else if (err.response?.status === 401) {
        setDirectLoginError('Неверный email или пароль');
      } else {
        setDirectLoginError(err.response?.data?.message || 'Произошла ошибка при входе');
      }
      
      // Reset manual login flag on error
      setIsManualLogin(false);
    } finally {
      setDirectLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // Use direct login instead of Redux
      directLogin(values.email, values.password);
    },
  });

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };

  const setTestCredentials = (email: string, password: string) => {
    formik.setFieldValue('email', email);
    formik.setFieldValue('password', password);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Вхід в систему
          </Typography>
          {(error || directLoginError) && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {directLoginError || error}
            </Alert>
          )}
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
              }
              label="Запам'ятати мене"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={directLoading || loading}
            >
              {(directLoading || loading) ? <CircularProgress size={24} /> : 'Увійти'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Тестові дані для входу
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => setTestCredentials('admin@example.com', 'admin123')}
              >
                Адмін
              </Button>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => setTestCredentials('admin@test.com', 'admin')}
              >
                Простий адмін
              </Button>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => setTestCredentials('test@test.com', 'test')}
              >
                Тест
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 3 }}>
              <Link href="#" variant="body2" onClick={() => navigate('/reset-password')}>
                Забули пароль?
              </Link>
              <Link href="#" variant="body2" onClick={() => navigate('/register')}>
                {"Немає облікового запису? Зареєструватись"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 