import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { login } from '../../store/slices/authSlice';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Некорректный формат email';
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      console.log('Отправка данных для входа:', { email, password: '***' });
      const actionResult = await dispatch(login({ email, password })).unwrap();
      console.log('Результат входа:', actionResult);
      
      if (actionResult && actionResult.auth_token) {
        console.log('Успешный вход, перенаправление на /dashboard');
        // После успешного входа загружаем данные пользователя
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      // Ошибка уже обрабатывается в slice
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', height: '100vh', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <LockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Вход в систему
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Введите email и пароль, чтобы войти в систему Твоя Шина
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading}
            autoFocus
          />

          <TextField
            fullWidth
            label="Пароль"
            variant="outlined"
            margin="normal"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Тестовые данные для входа в систему:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Email: admin@example.com, Пароль: password
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;