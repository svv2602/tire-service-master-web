import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Container
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
      setError('Необходимо указать пароль');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (password !== passwordConfirmation) {
      setError('Пароли не совпадают');
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
      setError(err.data?.error || 'Ошибка сброса пароля');
    }
  };

  if (isVerifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Проверка токена восстановления...
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
            Пароль изменён!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Ваш пароль успешно изменён. Вы будете перенаправлены на страницу входа.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Перейти к входу
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
            Недействительный токен
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {!token ? 'Токен восстановления не найден в URL.' : 
             tokenError ? (tokenError as any)?.data?.error || 'Ошибка проверки токена.' : 
             'Токен восстановления недействителен или истёк. Попробуйте запросить восстановление пароля заново.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/forgot-password')}
          >
            Запросить новый код
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Новый пароль
        </Typography>
        
        {tokenData?.user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Восстановление пароля для: {tokenData.user.email || tokenData.user.phone}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isResetting}
            sx={{ mb: 2 }}
            helperText="Минимум 6 символов"
          />

          <TextField
            fullWidth
            label="Подтверждение пароля"
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
            {isResetting ? 'Изменение пароля...' : 'Изменить пароль'}
          </Button>

          <Box textAlign="center">
            <Button
              variant="text"
              onClick={() => navigate('/login')}
            >
              Назад к входу
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage; 