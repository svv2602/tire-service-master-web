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
  Radio
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
import { PhoneField } from '../ui/PhoneField/PhoneField';
import GoogleLoginButton from './GoogleLoginButton';

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
      setError(t('forms.auth.errors.login_required'));
      return false;
    }
    
    if (!password.trim()) {
      setError(t('forms.auth.errors.password_required'));
      return false;
    }
    
    if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(login)) {
        setError(t('forms.auth.errors.invalid_email'));
        return false;
      }
    } else {
      // Валидация украинского телефона - принимаем отформатированный номер
      const cleanPhone = login.replace(/[\s\-\(\)]/g, '');
      const digitsOnly = cleanPhone.replace(/[^\d+]/g, '');
      
      // Проверяем что начинается с +38 и содержит 12 цифр всего (+38 + 10 цифр)
      if (!digitsOnly.startsWith('+38') || digitsOnly.length !== 13) {
        setError(t('forms.auth.errors.invalid_phone'));
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
      const translatedError = t(`forms.auth.errors.${errorKey}`);
      if (translatedError && translatedError !== `forms.auth.errors.${errorKey}`) {
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
      return t('forms.auth.errors.invalid_credentials');
    }
    
    if (err.status === 404) {
      return t('forms.auth.errors.user_not_found');
    }
    
    if (err.status >= 500) {
      return t('forms.auth.errors.server_error');
    }
    
    // Ошибки сети
    if (!err.status) {
      return t('forms.auth.errors.network_error');
    }
    
    // Общая ошибка входа
    return t('forms.auth.loginError');
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
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 420, 
        mx: 'auto',
        borderRadius: 2
      }}
    >
      <Box component="form" onSubmit={handleLogin} noValidate>
        {/* Заголовок */}
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          textAlign="center"
          sx={{ 
            mb: 3,
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}
        >
          {title || t('forms.auth.login')}
        </Typography>
        
        {/* Выбор типа логина */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel 
            component="legend"
            sx={{ 
              fontSize: '0.95rem',
              fontWeight: 500,
              mb: 1.5
            }}
          >
            {t('forms.auth.loginWith')}
          </FormLabel>
          <RadioGroup
            row
            value={loginType}
            onChange={handleLoginTypeChange}
            sx={{ 
              justifyContent: 'center',
              gap: 2,
              '& .MuiFormControlLabel-root': {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                m: 0,
                minWidth: '110px', // Фиксированная минимальная ширина для одинакового размера
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              },
              '& .MuiFormControlLabel-root:has(.Mui-checked)': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50'
              }
            }}
          >
            <FormControlLabel
              value="email"
              control={<Radio size="small" sx={{ display: 'none' }} />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color={loginType === 'email' ? 'primary' : 'inherit'} />
                  <Typography variant="body2">
                    {t('forms.auth.email')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="phone"
              control={<Radio size="small" sx={{ display: 'none' }} />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color={loginType === 'phone' ? 'primary' : 'inherit'} />
                  <Typography variant="body2">
                    {t('forms.auth.phone')}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Поля ввода */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Поле логина */}
          {loginType === 'email' ? (
            <TextField
              fullWidth
              label={t('forms.auth.email')}
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
                sx: { height: '48px' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  minHeight: '48px' // Фиксированная высота
                }
              }}
            />
          ) : (
            <PhoneField
              fullWidth
              label={t('forms.auth.phone')}
              value={login}
              onChange={(value) => setLogin(value)}
              placeholder={getLoginPlaceholder()}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  height: '48px', // Фиксированная высота такая же как у email
                  minHeight: '48px'
                }
              }}
            />
          )}

          {/* Поле пароля */}
          <TextField
            fullWidth
            label={t('forms.auth.password')}
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
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { height: '48px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                minHeight: '48px' // Фиксированная высота
              }
            }}
          />
        </Box>

        {/* Ошибки */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 1.5
            }}
          >
            {error}
          </Alert>
        )}

        {/* Кнопка входа */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          size="large"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          sx={{ 
            mb: 2,
            py: 1.5,
            borderRadius: 1.5,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {isLoading ? t('forms.auth.loggingIn') : t('forms.auth.loginButton')}
        </Button>

        {/* Разделитель */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
            {t('auth.google.or')}
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* Google OAuth кнопка */}
        <GoogleLoginButton 
          onSuccess={onSuccess}
          onError={(error) => setError(error)}
          disabled={isLoading}
          variant="outlined"
          fullWidth
        />

        {/* Забыли пароль */}
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => window.location.href = '/forgot-password?from=login'}
            sx={{ 
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {t('forms.auth.forgotPassword')}
          </Link>
        </Box>

        {/* Ссылка на регистрацию */}
        {showRegisterLink && (
          <Box textAlign="center" sx={{ mb: showSkipButton ? 2 : 0 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<PersonAdd />}
              onClick={onSwitchToRegister}
              sx={{ 
                py: 1.5,
                borderRadius: 1.5,
                fontSize: '0.95rem'
              }}
            >
              {t('forms.auth.registerButton')}
            </Button>
          </Box>
        )}

        {/* Кнопка отмены */}
        {showSkipButton && (
          <Box textAlign="center">
            <Button
              variant="outlined"
              fullWidth
              onClick={onSkip}
              startIcon={<CloseIcon />}
              sx={{ 
                py: 1.5,
                borderRadius: 1.5,
                fontSize: '0.95rem',
                borderColor: 'grey.400',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Отмена
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UniversalLoginForm; 