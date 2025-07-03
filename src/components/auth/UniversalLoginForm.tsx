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
  PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../api/auth.api';
import { UserRole } from '../../types/user-role';

interface UniversalLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  showRegisterLink?: boolean;
  title?: string;
}

export const UniversalLoginForm: React.FC<UniversalLoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  showRegisterLink = true,
  title = 'Вход в систему'
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
      // Простая валидация телефона
      const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
      if (!phoneRegex.test(login.replace(/[\s\-\(\)]/g, ''))) {
        setError('Некорректный формат телефона');
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

         try {
       const result = await loginMutation({
         auth: {
           login: login.trim(),
           password: password.trim()
         }
       }).unwrap();

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
         accessToken: result.tokens?.access || null
       }));

      console.log('✅ Успешный вход:', result);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Перенаправляем в зависимости от роли
        switch (result.user.role) {
          case 'client':
            navigate('/client/dashboard');
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
      console.error('❌ Ошибка входа:', err);
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
      : '+7 (999) 123-45-67';
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
        <TextField
          fullWidth
          label={loginType === 'email' ? 'Email' : 'Номер телефона'}
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
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Нет аккаунта?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToRegister || (() => navigate('/register'))}
                  sx={{ textDecoration: 'none' }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default UniversalLoginForm; 