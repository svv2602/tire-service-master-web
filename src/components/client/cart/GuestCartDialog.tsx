import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  ShoppingCart as ShoppingCartIcon, 
  Login as LoginIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../../api/auth.api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../store/slices/authSlice';
import { getButtonStyles } from '../../../styles/components';

interface GuestCartDialogProps {
  open: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onLoginSuccess: () => void;
}

export const GuestCartDialog: React.FC<GuestCartDialogProps> = ({
  open,
  onClose,
  onContinueAsGuest,
  onLoginSuccess,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const handleLoginSubmit = async () => {
    if (!loginData.email || !loginData.password) {
      setLoginError('Заполните все поля');
      return;
    }

    try {
      setLoginError('');
      const result = await login({
        login: loginData.email,
        password: loginData.password,
      }).unwrap();

      // Сохраняем данные пользователя в store
      dispatch(setCredentials({
        user: {
          ...result.user,
          role_id: 0, // Временное значение, так как API не возвращает role_id
          phone: result.user.phone || '',
          email_verified: result.user.email_verified || false,
          phone_verified: result.user.phone_verified || false,
          created_at: result.user.created_at || '',
          updated_at: result.user.updated_at || '',
        },
        accessToken: result.access_token,
      }));

      console.log('✅ Успешная авторизация:', result.user);
      onLoginSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Ошибка авторизации:', error);
      setLoginError(
        error?.data?.error || 
        'Неверный email или пароль'
      );
    }
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onClose();
  };

  const handleGoToRegister = () => {
    onClose();
    navigate('/auth/register');
  };

  const resetDialog = () => {
    setShowLoginForm(false);
    setLoginData({ email: '', password: '' });
    setLoginError('');
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6" component="span">
            Добавление в корзину
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {!showLoginForm ? (
          // Выбор варианта действий
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                <Typography variant="body1">
                  Выберите способ продолжения покупок
                </Typography>
              </Box>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Вход в существующий аккаунт */}
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => setShowLoginForm(true)}
                sx={{
                  ...primaryButtonStyles,
                  py: 1.5,
                  justifyContent: 'flex-start',
                }}
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="button" sx={{ fontWeight: 'bold', display: 'block' }}>
                    Войти в аккаунт
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    Если у вас уже есть аккаунт
                  </Typography>
                </Box>
              </Button>

              {/* Регистрация нового аккаунта */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleGoToRegister}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.primary.main + '10',
                  }
                }}
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="button" sx={{ fontWeight: 'bold', display: 'block' }}>
                    Создать аккаунт
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    Для сохранения истории заказов
                  </Typography>
                </Box>
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  или
                </Typography>
              </Divider>

              {/* Продолжить как гость */}
              <Button
                variant="text"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleContinueAsGuest}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="button" sx={{ fontWeight: 'bold', display: 'block' }}>
                    Продолжить как гость
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    Без регистрации и сохранения данных
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        ) : (
          // Форма входа
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Вход в аккаунт
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                variant="outlined"
                disabled={isLoggingIn}
              />

              <TextField
                label="Пароль"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                fullWidth
                variant="outlined"
                disabled={isLoggingIn}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {!showLoginForm ? (
          <Button onClick={handleClose} disabled={isLoggingIn}>
            Отмена
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button 
              onClick={() => setShowLoginForm(false)} 
              disabled={isLoggingIn}
              sx={{ flex: 1 }}
            >
              Назад
            </Button>
            <Button
              variant="contained"
              onClick={handleLoginSubmit}
              disabled={isLoggingIn || !loginData.email || !loginData.password}
              sx={{ ...primaryButtonStyles, flex: 2 }}
            >
              {isLoggingIn ? (
                <CircularProgress size={20} />
              ) : (
                'Войти'
              )}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};