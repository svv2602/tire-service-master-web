import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { PhoneField } from '../ui/PhoneField/PhoneField';

interface ForgotPasswordFormProps {
  onBack?: () => void;
  from?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
  from
}) => {
  const { t } = useTranslation();
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
      setError(t('forms.auth.errors.login_required'));
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

      setSuccess(result.message || t('forms.auth.success.password_reset_sent'));
      setActiveStep(1);
    } catch (err: any) {
      console.error(t('forms.auth.errors.reset_password_error'), err);
      setError(err.data?.error || t('forms.auth.errors.reset_password_error'));
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
          <StepLabel>{t('forms.auth.forgot_password.step1.label')}</StepLabel>
          <StepContent>
            <Box component="form" onSubmit={handleForgotPassword} noValidate>
              {/* Выбор типа логина */}
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel component="legend">
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('forms.auth.forgot_password.step1.recovery_method')}
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
                        <span>{t('forms.auth.forgot_password.step1.email')}</span>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="phone"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone fontSize="small" />
                        <span>{t('forms.auth.forgot_password.step1.phone')}</span>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Поле логина */}
              {loginType === 'email' ? (
                <TextField
                  fullWidth
                  label={t('forms.auth.forgot_password.step1.email_label')}
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
                <PhoneField
                  fullWidth
                  label={t('forms.auth.forgot_password.step1.phone_label')}
                  value={login}
                  onChange={(value) => setLogin(value)}
                  placeholder={getLoginPlaceholder()}
                  disabled={isLoading}
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
                  {t('forms.auth.forgot_password.step1.back')}
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <Lock />}
                >
                  {isLoading ? t('forms.auth.forgot_password.step1.sending') : t('forms.auth.forgot_password.step1.restore_password')}
                </Button>
              </Box>
            </Box>
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>{t('forms.auth.forgot_password.step2.label')}</StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {success || t('forms.auth.forgot_password.step2.instructions_sent')}
              </Alert>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('forms.auth.forgot_password.step2.instructions_message', { loginType })}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t(`forms.auth.forgot_password.step2.check_email_or_phone_${loginType}`)}
                {' '}
                {t('forms.auth.forgot_password.step2.follow_instructions')}
                {' '}
                {t('forms.auth.forgot_password.step2.if_not_received')}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={() => setActiveStep(0)}
                  startIcon={<ArrowBack />}
                >
                  {t('forms.auth.forgot_password.step2.back')}
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (from === 'booking') {
                      window.close();
                    } else {
                      window.location.href = '/login';
                    }
                  }}
                  startIcon={<Check />}
                >
                  {from === 'booking' ? t('forms.auth.forgot_password.step2.close_and_return') : t('forms.auth.forgot_password.step2.return_to_login')}
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