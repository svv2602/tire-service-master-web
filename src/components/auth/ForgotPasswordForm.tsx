import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Email,
  Phone,
  Lock,
  ArrowBack,
  Check
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [login, setLogin] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const API_URL = `${config.API_URL}${config.API_PREFIX}`;

  // Валидация формы
  const validateLogin = () => {
    if (!login.trim()) {
      setError('Необходимо указать логин');
      return false;
    }
    
    if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(login)) {
        setError('Некорректный формат email');
        return false;
      }
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
      if (!phoneRegex.test(login.replace(/[\s\-\(\)]/g, ''))) {
        setError('Некорректный формат телефона');
        return false;
      }
    }
    
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setError('Необходимо указать пароль');
      return false;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (password !== passwordConfirmation) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  // Отправка запроса на восстановление
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateLogin()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login.trim()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        setActiveStep(1);
        console.log('✅ Запрос на восстановление отправлен');
      } else {
        setError(data.error || 'Ошибка отправки запроса');
      }
    } catch (err: any) {
      console.error('❌ Ошибка запроса восстановления:', err);
      setError('Ошибка отправки запроса');
    } finally {
      setLoading(false);
    }
  };

  // Сброс пароля
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!token.trim()) {
      setError('Необходимо указать код восстановления');
      return;
    }
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          password: password.trim(),
          password_confirmation: passwordConfirmation.trim()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        setActiveStep(2);
        console.log('✅ Пароль успешно изменён');
      } else {
        setError(data.error || 'Ошибка сброса пароля');
      }
    } catch (err: any) {
      console.error('❌ Ошибка сброса пароля:', err);
      setError('Ошибка сброса пароля');
    } finally {
      setLoading(false);
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

  const steps = [
    'Укажите email или телефон',
    'Введите код восстановления',
    'Пароль изменён'
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Box>
        {/* Заголовок */}
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Восстановление пароля
        </Typography>
        
        {/* Кнопка назад */}
        {onBack && (
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            Назад к входу
          </Button>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
          {/* Шаг 1: Запрос восстановления */}
          <Step>
            <StepLabel>Укажите email или телефон</StepLabel>
            <StepContent>
              <Box component="form" onSubmit={handleForgotPassword} noValidate>
                {/* Выбор типа логина */}
                <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                  <FormLabel component="legend">
                    <Typography variant="subtitle2" color="textSecondary">
                      Способ восстановления
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
                          <span>SMS</span>
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
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {getLoginIcon()}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Кнопка отправки */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Email />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Отправка...' : 'Отправить код'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Шаг 2: Сброс пароля */}
          <Step>
            <StepLabel>Введите код и новый пароль</StepLabel>
            <StepContent>
              <Box component="form" onSubmit={handleResetPassword} noValidate>
                {/* Поле токена */}
                <TextField
                  fullWidth
                  label="Код восстановления"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Введите код из email или SMS"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Поле нового пароля */}
                <TextField
                  fullWidth
                  label="Новый пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />

                {/* Подтверждение пароля */}
                <TextField
                  fullWidth
                  label="Подтверждение пароля"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />

                {/* Кнопка сброса */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Изменение...' : 'Изменить пароль'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Шаг 3: Успех */}
          <Step>
            <StepLabel>Готово!</StepLabel>
            <StepContent>
              <Box textAlign="center">
                <Check color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Пароль успешно изменён
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Теперь вы можете войти в систему с новым паролем
                </Typography>
                                 <Button
                   variant="contained"
                   onClick={() => window.location.href = 'http://localhost:3008/login'}
                 >
                   Перейти к входу
                 </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {/* Ошибки */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Успех */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default ForgotPasswordForm; 