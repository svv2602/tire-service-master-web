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
  useTheme,
  useMediaQuery
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../api/auth.api';
import { UserRole } from '../../types/user-role';
import { extractPhoneDigits } from '../../utils/phoneUtils';
import { useTranslation } from '../../hooks/useTranslation';
import { PhoneField } from '../ui/PhoneField/PhoneField';
import GoogleLoginButton from './GoogleLoginButton';
import { baseApi } from '../../api/baseApi';
import { clearAllCacheData } from '../../api/baseApi';
import { spacing } from '../../styles/theme/tokens';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

      // ✅ Очищаем кэш RTK Query при входе чтобы убрать данные предыдущего пользователя
      clearAllCacheData(dispatch);
      console.log('🧹 Кэш RTK Query очищен при входе через форму');

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
    <Box sx={{
      width: '100%',
      maxWidth: '500px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: spacing.md,
      padding: spacing.xl,
      boxShadow: theme.shadows[3],
    }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: 'fit-content' }}>
            {t('forms.auth.loginWith')}
          </Typography>
          
          <RadioGroup
            row
            value={loginType}
            onChange={handleLoginTypeChange}
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

        {/* Поля ввода */}
        <Box sx={{ mb: 3 }}>
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
                )
              }}
              sx={{ marginBottom: spacing.md }}
            />
          ) : (
            <PhoneField
              fullWidth
              label={t('forms.auth.phone')}
              value={login}
              onChange={(value) => setLogin(value)}
              placeholder={getLoginPlaceholder()}
              disabled={isLoading}
              sx={{ marginBottom: spacing.md }}
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
              )
            }}
            sx={{ marginBottom: spacing.md }}
          />
        </Box>

        {/* Ошибки */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ marginBottom: spacing.lg }}
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
          sx={{ 
            marginBottom: spacing.md,
            py: 1.5,
            borderRadius: 1.5,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              {t('forms.auth.loggingIn')}
            </Box>
          ) : (
            t('forms.auth.loginButton')
          )}
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

        {/* Кнопки регистрации и отмены */}
        {(showRegisterLink || showSkipButton) && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {showSkipButton && (
              <Button
                variant="outlined"
                onClick={onSkip}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: 'grey.400',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'grey.600',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                {t('forms.auth.cancel')}
              </Button>
            )}

            {showRegisterLink && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onSwitchToRegister}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 0, // Позволяет кнопке сжиматься
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile ? t('auth.registerButtonShort') : t('forms.auth.registerButton')}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UniversalLoginForm; 