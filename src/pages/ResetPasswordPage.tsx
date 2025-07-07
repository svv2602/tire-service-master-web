import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Lock,
  Check,
  Error
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyResetTokenQuery, useResetPasswordMutation } from '../api/password.api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Получаем токен из URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);
  
  // Проверяем токен
  const { 
    data: tokenData, 
    isLoading: isVerifying, 
    isError: isTokenError,
    error: tokenError 
  } = useVerifyResetTokenQuery(token, {
    skip: !token // Пропускаем запрос, если токен не задан
  });
  
  // Мутация для сброса пароля
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError(t('auth.errors.password_required'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('auth.errors.password_min_length'));
      return;
    }
    
    if (password !== passwordConfirmation) {
      setError(t('auth.errors.passwords_not_match'));
      return;
    }

    try {
      await resetPassword({
        token,
        password,
        password_confirmation: passwordConfirmation
      }).unwrap();
      
      setSuccess(true);
      
      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('❌ Ошибка сброса пароля:', err);
      setError(err.data?.error || t('auth.errors.reset_password_error'));
    }
  };

  if (isVerifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            {t('auth.verifyingToken')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Check color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('auth.passwordChanged')}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {t('auth.passwordChangedMessage')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            {t('auth.goToLogin')}
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!token || isTokenError || !tokenData?.valid) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Error color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('auth.invalidToken')}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {!token ? t('auth.tokenNotFoundInUrl') : 
             tokenError ? (tokenError as any)?.data?.error || t('auth.tokenVerificationError') : 
             t('auth.tokenInvalidOrExpired')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.requestNewCode')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {t('auth.newPassword')}
        </Typography>
        
        {tokenData?.user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('auth.resetPasswordFor')}: {tokenData.user.email || tokenData.user.phone}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label={t('auth.newPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isResetting}
            sx={{ mb: 2 }}
            helperText={t('auth.passwordMinLength')}
          />

          <TextField
            fullWidth
            label={t('auth.confirmPassword')}
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isResetting}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isResetting}
            startIcon={isResetting ? <CircularProgress size={20} /> : <Lock />}
            sx={{ mb: 2 }}
          >
            {isResetting ? t('auth.changingPassword') : t('auth.changePassword')}
          </Button>

          <Box textAlign="center">
            <Button
              variant="text"
              onClick={() => navigate('/login')}
            >
              {t('auth.backToLogin')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage; 