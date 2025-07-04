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
  title = 'Вход в систему',
  showSkipButton = false,
  onSkip
}) => {
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
      setError('Необходимо указать логин');
      return false;
    }
    
    if (!password.trim()) {
      setError('Необходимо указать пароль');
      return false;
    }
    
    if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(login)) {
        setError('Некорректный формат email');
        return false;
      }
    } else {
      // Валидация украинского телефона - принимаем отформатированный номер
      const cleanPhone = login.replace(/[\s\-\(\)]/g, '');
      const digitsOnly = cleanPhone.replace(/[^\d+]/g, '');
      
      // Проверяем что начинается с +38 и содержит 12 цифр всего (+38 + 10 цифр)
      if (!digitsOnly.startsWith('+38') || digitsOnly.length !== 13) {
        setError('Некорректный формат телефона. Используйте формат: +38 (0ХХ) ХХХ-ХХ-ХХ');
        return false;
      }
    }
    
    return true;
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
      setError(err.data?.error || 'Ошибка входа в систему');
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
          {title}
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

        {/* Поле логина */}
        {loginType === 'email' ? (
          <TextField
            fullWidth
            label="Email"
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
            label="Номер телефона"
            value={login}
            onChange={(e) => {
              // Автоформатирование с визуальной маской
              let value = e.target.value;
              
              // Убираем все кроме цифр и +
              let digitsOnly = value.replace(/[^\d+]/g, '');
              
              // Обработка различных форматов ввода
              if (digitsOnly.startsWith('+')) {
                digitsOnly = digitsOnly.substring(1); // убираем +
              }
              
              // Автоматически добавляем 38 если начинается с 0
              if (digitsOnly.match(/^0/)) {
                digitsOnly = '38' + digitsOnly;
              }
              
              // Форматируем с маской +38 (0XX) XXX-XX-XX
              let formatted = '';
              if (digitsOnly.length >= 2 && digitsOnly.startsWith('38')) {
                formatted = '+38';
                const remaining = digitsOnly.substring(2);
                
                if (remaining.length > 0) {
                  formatted += ' (';
                  if (remaining.length <= 3) {
                    formatted += remaining;
                  } else {
                    formatted += remaining.substring(0, 3) + ')';
                    const rest = remaining.substring(3);
                    
                    if (rest.length > 0) {
                      formatted += ' ';
                      if (rest.length <= 3) {
                        formatted += rest;
                      } else {
                        formatted += rest.substring(0, 3);
                        if (rest.length > 3) {
                          formatted += '-';
                          if (rest.length <= 5) {
                            formatted += rest.substring(3);
                          } else {
                            formatted += rest.substring(3, 5);
                            if (rest.length > 5) {
                              formatted += '-' + rest.substring(5, 7);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } else if (digitsOnly.length > 0) {
                // Для других форматов оставляем как есть с +
                formatted = '+' + digitsOnly;
              } else {
                formatted = value; // Пустое значение
              }
              
              setLogin(formatted);
            }}
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
          label="Пароль"
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
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>

        {/* Забыли пароль */}
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/forgot-password')}
            sx={{ textDecoration: 'none' }}
          >
            Забыли пароль?
          </Link>
        </Box>

        {/* Разделитель */}
        {showRegisterLink && (
          <>
            <Divider sx={{ my: 2 }}>
              <Chip label="или" size="small" />
            </Divider>

            {/* Ссылка на регистрацию */}
            <Box textAlign="center" sx={{ mb: showSkipButton ? 2 : 0 }}>
              <Typography variant="body2" color="textSecondary">
                Нет аккаунта?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToRegister || (() => navigate('/auth/register'))}
                  sx={{ textDecoration: 'none' }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>
          </>
        )}

        {/* Кнопка "Продолжить без входа" */}
        {showSkipButton && (
          <Button
            variant="text"
            fullWidth
            color="primary"
            onClick={onSkip}
            startIcon={<CloseIcon />}
            sx={{ mt: showRegisterLink ? 0 : 2 }}
          >
            Продолжить без входа
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default UniversalLoginForm; 