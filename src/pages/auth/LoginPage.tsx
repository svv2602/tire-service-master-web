import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { login } from '../../store/slices/authSlice';
import { useTheme } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '../../components/ui';
import { Card } from '@mui/material';
import {
  getAuthStyles,
  getContainerStyles
} from '../../styles';
import CloseIcon from '@mui/icons-material/Close';
import ClientLayout from '../../components/client/ClientLayout';
import { UserRole } from '../../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const requestIdRef = useRef(0);
  const lastSubmitTimeRef = useRef(0);
  const isNavigatingRef = useRef(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading: reduxLoading, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const theme = useTheme();
  const authStyles = getAuthStyles(theme);
  const containerStyles = getContainerStyles(theme);
  
  // Отключаем форму, если пользователь уже аутентифицирован  
  useEffect(() => {
    if (isAuthenticated && !isNavigatingRef.current) {
      console.log('User is authenticated, navigating based on role');
      isNavigatingRef.current = true;
      
      // Определяем путь по умолчанию в зависимости от роли пользователя
      let defaultPath = '/client';
      if (user) {
        // Если роль админ, партнер, менеджер или оператор - идем в админку
        const isAdminRole = user.role === UserRole.ADMIN || 
                           user.role === UserRole.PARTNER || 
                           user.role === UserRole.MANAGER || 
                           user.role === UserRole.OPERATOR;
        
        if (isAdminRole) {
          defaultPath = '/admin/dashboard';
          console.log('Admin/Partner/Manager/Operator user, redirecting to admin dashboard');
        } else {
          console.log('Client user, redirecting to client area');
        }
      }
      
      const returnPath = sessionStorage.getItem('returnPath') || defaultPath;
      sessionStorage.removeItem('returnPath');
      
      console.log('Navigating to:', returnPath, 'User role:', user?.role);
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  // Объединяем состояния загрузки
  const loading = localLoading || reduxLoading || isSubmitting;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Некорректный формат email';
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
    } else if (password.length < 4) {
      errors.password = 'Пароль должен быть не менее 4 символов';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current;
    
    // Защита от слишком быстрых повторных нажатий (менее 1 секунды)
    if (timeSinceLastSubmit < 1000) {
      console.log('Submit blocked - too fast repeated clicks (', timeSinceLastSubmit, 'ms since last)');
      return;
    }
    
    // Строгая защита от множественных отправок с использованием ref
    if (loading || isSubmitting || isSubmittingRef.current) {
      console.log('Login already in progress, ignoring submit. States:', {
        loading,
        isSubmitting,
        isSubmittingRef: isSubmittingRef.current
      });
      return;
    }
    
    lastSubmitTimeRef.current = now;
    requestIdRef.current = requestIdRef.current + 1;
    const currentRequestId = requestIdRef.current;
    console.log(`[Request ${currentRequestId}] Form submit triggered`);
    
    // Устанавливаем флаги блокировки немедленно
    isSubmittingRef.current = true;
    setError('');
    setIsSubmitting(true);
    setLocalLoading(true);

    if (!validateForm()) {
      console.log(`[Request ${currentRequestId}] Validation failed`);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setLocalLoading(false);
      return;
    }

    try {
      console.log(`[Request ${currentRequestId}] Attempting login with:`, { email, password: '***' });
      const actionResult = await dispatch(login({ email, password })).unwrap();
      console.log(`[Request ${currentRequestId}] Login result:`, actionResult);
      
      // Навигация теперь происходит в useEffect при изменении isAuthenticated
      console.log(`[Request ${currentRequestId}] Login successful, waiting for state update`);
      
    } catch (error: any) {
      console.error(`[Request ${currentRequestId}] Login error:`, error);
      setError(error.message || 'Ошибка при входе в систему');
    } finally {
      console.log(`[Request ${currentRequestId}] Cleaning up`);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setLocalLoading(false);
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button click detected. Current states:', {
      loading,
      isSubmitting,
      isSubmittingRef: isSubmittingRef.current
    });
    
    // Предотвращаем множественные клики на кнопке
    if (loading || isSubmitting || isSubmittingRef.current) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Button click blocked - login in progress');
      return false;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSkipLogin = () => {
    // Переходим на главную страницу
    navigate('/client');
  };

  return (
    <ClientLayout>
      <Container 
        maxWidth="sm" 
        sx={containerStyles.centerContent}
      >
        <Card sx={authStyles.authCard}>
        <Box sx={authStyles.authHeader}>
          <LockIcon 
            color="primary" 
            sx={authStyles.authIcon} 
          />
          <Typography variant="h4" component="h1">
            Вход в систему
          </Typography>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
          >
            Введите email и пароль, чтобы войти в систему Твоя Шина
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={authStyles.alert}
          >
            {error}
          </Alert>
        )}

        {formErrors.submit && (
          <Alert 
            severity="error" 
            sx={authStyles.alert}
          >
            {formErrors.submit}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading}
            autoFocus
            sx={authStyles.authField}
            inputProps={{
              'data-testid': 'email-input',
            }}
          />

          <TextField
            fullWidth
            label="Пароль"
            variant="outlined"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
            sx={authStyles.authField}
            inputProps={{
              'data-testid': 'password-input',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            color="primary"
            disabled={loading}
            onClick={handleButtonClick}
            sx={authStyles.authSubmit}
          >
            {loading ? (
              <CircularProgress 
                size={24} 
                color="inherit" 
                data-testid="loading-spinner"
              />
            ) : (
              'Войти'
            )}
          </Button>

          <Box sx={authStyles.authActions}>
            <Box component={RouterLink} to="/auth/register" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="outlined"
                fullWidth
                color="primary"
                disabled={loading}
              >
                Зарегистрироваться
              </Button>
            </Box>

            <Button
              variant="text"
              fullWidth
              color="primary"
              onClick={handleSkipLogin}
              disabled={loading}
              sx={authStyles.skipButton}
              startIcon={<CloseIcon />}
            >
              Продолжить без входа
            </Button>
          </Box>
        </form>


      </Card>
    </Container>
    </ClientLayout>
  );
};

export default LoginPage;