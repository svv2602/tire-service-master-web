import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
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
import { useForgotPasswordMutation } from '../../api/password.api';
import { extractPhoneDigits } from '../../utils/phoneUtils';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [login, setLogin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

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

  // Запрос на восстановление пароля
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateLogin()) {
      return;
    }

    try {
      // Нормализация номера телефона
      let normalizedLogin = login.trim();
      
      if (loginType === 'phone') {
        normalizedLogin = extractPhoneDigits(login);
      }
      
      const result = await forgotPassword({
        login: normalizedLogin
      }).unwrap();

      setSuccess(result.message || 'Инструкции по восстановлению пароля отправлены на указанный адрес');
      setActiveStep(1);
    } catch (err: any) {
      console.error('❌ Ошибка запроса восстановления:', err);
      setError(err.data?.error || 'Ошибка отправки запроса восстановления');
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
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Введите email или телефон</StepLabel>
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

              {/* Ошибки */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  onClick={onBack}
                  disabled={isLoading}
                  startIcon={<ArrowBack />}
                >
                  Назад
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <Lock />}
                >
                  {isLoading ? 'Отправка...' : 'Восстановить пароль'}
                </Button>
              </Box>
            </Box>
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>Проверьте почту или телефон</StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {success || 'Инструкции по восстановлению пароля отправлены'}
              </Alert>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                Мы отправили инструкции по восстановлению пароля на указанный {loginType === 'email' ? 'email' : 'телефон'}.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Проверьте свою почту{loginType === 'email' ? '' : ' или телефон'} и следуйте инструкциям в письме.
                Если письмо не пришло, проверьте папку "Спам" или попробуйте запросить восстановление еще раз.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={() => setActiveStep(0)}
                  startIcon={<ArrowBack />}
                >
                  Назад
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.href = '/login'}
                  startIcon={<Check />}
                >
                  Вернуться к входу
                </Button>
              </Box>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
};

export default ForgotPasswordForm; 