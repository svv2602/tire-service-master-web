import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Login as LoginIcon,
  PersonAdd,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../api/auth.api';
import { UserRole } from '../../types/user-role';
import { extractPhoneDigits } from '../../utils/phoneUtils';
import { useTranslation } from '../../hooks/useTranslation';

interface UniversalLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  showRegisterLink?: boolean;
  title?: string;
  showSkipButton?: boolean;
  onSkip?: () => void;
}

const UniversalLoginForm: React.FC<UniversalLoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  showRegisterLink = true,
  title,
  showSkipButton = false,
  onSkip
}) => {
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();

  // Валидация формы
  const validateForm = () => {
    if (!login.trim()) {
      setError(t('auth.errors.login_required') || 'Необходимо указать логин');
      return false;
    }
    
    if (!password.trim()) {
      setError(t('auth.errors.password_required') || 'Необходимо указать пароль');
      return false;
    }
    
    if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(login)) {
        setError(t('auth.errors.invalid_email') || 'Некорректный формат email');
        return false;
      }
    } else {
      // Валидация украинского телефона - принимаем отформатированный номер
      const cleanPhone = login.replace(/[\s\-\(\)]/g, '');
      const digitsOnly = cleanPhone.replace(/[^\d+]/g, '');
      
      // Проверяем что начинается с +38 и содержит 12 цифр всего (+38 + 10 цифр)
      if (!digitsOnly.startsWith('+38') || digitsOnly.length !== 13) {
        setError(t('auth.errors.invalid_phone') || 'Некорректный формат телефона. Используйте формат: +38 (0ХХ) ХХХ-ХХ-ХХ');
        return false;
      }
    }
    
    return true;
  };

  // Получение переведенного сообщения об ошибке
  const getErrorMessage = (err: any): string => {
    // Сначала пытаемся получить конкретную ошибку из API
    if (err.data?.error) {
      // Проверяем, есть ли перевод для этой ошибки
      const errorKey = err.data.error.toLowerCase().replace(/\s+/g, '_');
      const translatedError = t(`auth.errors.${errorKey}`);
      if (translatedError && translatedError !== `auth.errors.${errorKey}`) {
        return translatedError;
      }
      return err.data.error;
    }
    
    // Если есть сообщение об ошибке
    if (err.data?.message) {
      return err.data.message;
    }
    
    // Стандартные ошибки HTTP
    if (err.status === 401) {
      return t('auth.errors.invalid_credentials') || 'Неверные данные для входа';
    }
    
    if (err.status === 404) {
      return t('auth.errors.user_not_found') || 'Пользователь не найден';
    }
    
    if (err.status >= 500) {
      return t('auth.errors.server_error') || 'Ошибка сервера';
    }
    
    // Ошибки сети
    if (!err.status) {
      return t('auth.errors.network_error') || 'Ошибка сети';
    }
    
    // Общая ошибка входа
    return t('auth.loginError') || 'Ошибка входа в систему';
  };

  // Обработка входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    // 🔍 ПОДРОБНОЕ ЛОГИРОВАНИЕ
    console.log('🔐 UniversalLoginForm handleLogin:', {
      loginType,
      login: login.trim(),
      passwordLength: password.trim().length,
      formValid: validateForm(),
      timestamp: new Date().toISOString()
    });

    try {
      // 📱 НОРМАЛИЗАЦИЯ НОМЕРА ТЕЛЕФОНА
      let normalizedLogin = login.trim();
      
      if (loginType === 'phone') {
        // Используем функцию extractPhoneDigits для надежной нормализации
        normalizedLogin = extractPhoneDigits(login);
        
        console.log('📱 Нормализация телефона:', {
          original: login.trim(),
          normalized: normalizedLogin
        });
      }
      
      const loginData = {
        login: normalizedLogin,
        password: password.trim()
      };
      
      console.log('🚀 Отправляем запрос на вход:', {
        loginData,
        mutationFunction: 'loginMutation',
        timestamp: new Date().toISOString()
      });

      const result = await loginMutation(loginData).unwrap();

      console.log('✅ Получен результат входа:', {
        hasUser: !!result.user,
        userEmail: result.user?.email,
        userRole: result.user?.role,
        hasAccessToken: !!result.access_token,
        timestamp: new Date().toISOString()
      });

      // Сохраняем данные пользователя в Redux
      dispatch(setCredentials({
        user: {
          ...result.user,
          role: result.user.role as UserRole,
          role_id: 1, // Временно, пока не обновим типы
          email_verified: result.user.email_verified || false,
          phone_verified: result.user.phone_verified || false,
          created_at: result.user.created_at || new Date().toISOString(),
          updated_at: result.user.updated_at || new Date().toISOString()
        },
        accessToken: result.access_token || null
      }));

      console.log('✅ Успешный вход:', result);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Перенаправляем в зависимости от роли
        switch (result.user.role) {
          case 'client':
            navigate('/client/profile');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'partner':
            navigate('/partner/dashboard');
            break;
          case 'manager':
            navigate('/manager/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('❌ Ошибка входа:', {
        error: err,
        status: err.status,
        data: err.data,
        message: err.message,
        timestamp: new Date().toISOString()
      });
      setError(getErrorMessage(err));
    }
  };

  // Обработка смены типа логина
  const handleLoginTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginType(event.target.value as 'email' | 'phone');
    setLogin('');
    setError('');
  };

  // Получение плейсхолдера для поля логина
  const getLoginPlaceholder = () => {
    return loginType === 'email' 
      ? 'example@email.com' 
      : '+38 (067) 123-45-67';
  };

  // Получение иконки для поля логина
  const getLoginIcon = () => {
    return loginType === 'email' ? <Email /> : <Phone />;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box component="form" onSubmit={handleLogin} noValidate>
        {/* Заголовок */}
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {title || t('auth.login')}
        </Typography>
        
        {/* Выбор типа логина */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">
            <Typography variant="subtitle2" color="textSecondary">
              Способ входа
            </Typography>
          </FormLabel>
          <RadioGroup
            row
            value={loginType}
            onChange={handleLoginTypeChange}
            sx={{ justifyContent: 'center', mt: 1 }}
          >
            <FormControlLabel
              value="email"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" />
                  <span>{t('auth.email')}</span>
                </Box>
              }
            />
            <FormControlLabel
              value="phone"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" />
                  <span>{t('auth.phone')}</span>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Поле логина */}
        {loginType === 'email' ? (
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={getLoginPlaceholder()}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {getLoginIcon()}
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        ) : (
          <TextField
            fullWidth
            label={t('auth.phone')}
            type="tel"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={getLoginPlaceholder()}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {getLoginIcon()}
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}

        {/* Поле пароля */}
        <TextField
          fullWidth
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Ошибки */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Кнопка входа */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
          sx={{ mb: 2 }}
        >
          {isLoading ? t('auth.loggingIn') || 'Вход...' : t('auth.loginButton')}
        </Button>

        {/* Забыли пароль */}
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => window.location.href = '/forgot-password'}
            sx={{ textDecoration: 'none' }}
          >
            {t('auth.forgotPassword')}
          </Link>
        </Box>

        {/* Разделитель */}
        <Divider sx={{ my: 2 }}>или</Divider>

        {/* Ссылка на регистрацию */}
        {showRegisterLink && (
          <Box textAlign="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {t('auth.dontHaveAccount')}
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonAdd />}
              onClick={onSwitchToRegister}
            >
              {t('auth.registerButton')}
            </Button>
          </Box>
        )}

        {/* Кнопка пропуска */}
        {showSkipButton && (
          <Box textAlign="center">
            <Button
              variant="text"
              onClick={onSkip}
              startIcon={<CloseIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Продолжить без входа
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UniversalLoginForm; 