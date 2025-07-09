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
import { useTranslation } from 'react-i18next';

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
  } | null;
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
  const { t } = useTranslation('components');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginClient, { isLoading }] = useLoginMutation();

  // Если user null, не показываем диалог
  if (!user) {
    return null;
  }

  const handleLogin = async () => {
    if (!password.trim()) {
      setError(t('existingUserDialog.validation.passwordRequired'));
      return;
    }

    try {
      // Используем email или phone для входа
      const loginData = user.email 
        ? { login: user.email, password }
        : { login: user.phone, password };

      const result = await loginClient(loginData).unwrap();
      onLoginSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || t('existingUserDialog.validation.wrongPassword'));
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
            {t('existingUserDialog.title')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{t('existingUserDialog.foundAccount')}</strong>
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <PersonIcon fontSize="small" />
            <Typography variant="body2">
              {user.first_name} {user.last_name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            📧 {user.email || t('existingUserDialog.notSpecified')} • 📱 {user.phone}
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {t('existingUserDialog.quickBookingQuestion')}
        </Typography>

        <TextField
          label={t('existingUserDialog.fields.password')}
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
          {t('existingUserDialog.buttons.continueAsGuest')}
        </Button>
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={isLoading || !password.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? t('existingUserDialog.buttons.loggingIn') : t('existingUserDialog.buttons.login')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExistingUserDialog; 