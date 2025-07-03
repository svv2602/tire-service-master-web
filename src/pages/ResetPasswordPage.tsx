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
import config from '../config';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; phone?: string } | null>(null);

  const API_URL = `${config.API_URL}${config.API_PREFIX}`;

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    } else {
      setError('Токен восстановления не найден в URL');
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_URL}/password/verify_token/${tokenToVerify}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setTokenValid(true);
        setUserInfo(data.user);
      } else {
        setError(data.error || 'Недействительный токен');
      }
    } catch (err: any) {
      setError('Ошибка проверки токена');
    } finally {
      setVerifying(false);
    }
  };

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

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: passwordConfirmation
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        console.log('✅ Пароль успешно изменён');
        
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          window.location.href = 'http://localhost:3008/login';
        }, 3000);
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

  if (verifying) {
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
            onClick={() => window.location.href = 'http://localhost:3008/login'}
          >
            Перейти к входу
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Error color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Недействительный токен
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Токен восстановления недействителен или истёк. Попробуйте запросить восстановление пароля заново.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = 'http://localhost:3008/forgot-password'}
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
        
        {userInfo && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Восстановление пароля для: {userInfo.email || userInfo.phone}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            helperText="Минимум 6 символов"
          />

          <TextField
            fullWidth
            label="Подтверждение пароля"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={loading}
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Изменение пароля...' : 'Изменить пароль'}
          </Button>

          <Box textAlign="center">
            <Button
              variant="text"
              onClick={() => window.location.href = 'http://localhost:3008/login'}
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