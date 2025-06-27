import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { Button, TextField } from '../ui';
import { useLoginMutation } from '../../api/auth.api';

interface ExistingUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    client_id?: number;
  };
  onLoginSuccess: (userData: any) => void;
  onContinueAsGuest: () => void;
}

const ExistingUserDialog: React.FC<ExistingUserDialogProps> = ({
  open,
  onClose,
  user,
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginClient, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    try {
      // Используем email или phone для входа
      const loginData = user.email 
        ? { auth: { login: user.email, password } }
        : { auth: { login: user.phone, password } };

      const result = await loginClient(loginData).unwrap();
      onLoginSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || 'Неверный пароль');
    }
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <AccountCircleIcon color="primary" />
          <Typography variant="h6">
            Обнаружен существующий аккаунт
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Мы нашли ваш аккаунт:</strong>
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <PersonIcon fontSize="small" />
            <Typography variant="body2">
              {user.first_name} {user.last_name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            📧 {user.email} • 📱 {user.phone}
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Хотите войти в аккаунт для быстрого оформления бронирования?
        </Typography>

        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          fullWidth
          sx={{ mb: 2 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleContinueAsGuest}
          disabled={isLoading}
        >
          Продолжить как гость
        </Button>
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={isLoading || !password.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Вход...' : 'Войти и забронировать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExistingUserDialog; 