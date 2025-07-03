import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useRegisterClientMutation } from '../../api/clientAuth.api';
import { useLoginMutation } from '../../api/auth.api';
import { useAssignBookingToClientMutation } from '../../api/clientBookings.api';
import { BookingFormData } from '../../types/booking';

export interface CreateAccountDialogProps {
  /** Открыто ли диалоговое окно */
  open: boolean;
  /** Данные бронирования для создания аккаунта */
  bookingData: BookingFormData;
  /** Созданное бронирование */
  createdBooking?: any;
  /** Обработчик закрытия */
  onClose: () => void;
  /** Обработчик успешного создания аккаунта */
  onAccountCreated: (userData: any) => void;
  /** Обработчик продолжения без создания аккаунта */
  onContinueWithoutAccount: () => void;
}

/**
 * Компонент CreateAccountDialog - модальное окно для создания личного кабинета
 * после успешного гостевого бронирования
 */
export const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({
  open,
  bookingData,
  createdBooking,
  onClose,
  onAccountCreated,
  onContinueWithoutAccount,
}) => {
  // Состояния формы
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // API мутации
  const [registerClient] = useRegisterClientMutation();
  const [loginClient] = useLoginMutation();
  const [assignBookingToClient] = useAssignBookingToClientMutation();

  // Валидация формы
  const isFormValid = () => {
    return (
      password.trim().length >= 6 &&
      confirmPassword.trim().length >= 6 &&
      password === confirmPassword
    );
  };

  // Обработчик создания аккаунта
  const handleCreateAccount = async () => {
    if (!isFormValid()) {
      setError('Пароли должны совпадать и содержать не менее 6 символов');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Подготавливаем данные для регистрации
      const registrationData = {
        user: {
          first_name: bookingData.service_recipient.first_name,
          last_name: bookingData.service_recipient.last_name,
          email: bookingData.service_recipient.email || `${bookingData.service_recipient.phone}@temp.local`,
          phone: bookingData.service_recipient.phone,
          password: password,
          password_confirmation: confirmPassword,
        },
      };

      console.log('🚀 Создание аккаунта клиента:', registrationData);

      // Регистрируем клиента
      const registerResponse = await registerClient(registrationData).unwrap();
      
      console.log('✅ Аккаунт создан:', registerResponse);

      // Автоматически входим в систему после регистрации
      try {
        const loginData = {
          auth: {
            login: bookingData.service_recipient.phone,
            password: password,
          },
        };

        console.log('🔐 Автоматический вход в систему:', loginData);
        const loginResponse = await loginClient(loginData).unwrap();
        console.log('✅ Вход выполнен:', loginResponse);
      } catch (loginError: any) {
        console.error('❌ Ошибка входа в систему:', loginError);
        // Продолжаем даже если вход не удался
      }

      // Если есть созданное бронирование, привязываем его к новому клиенту
      if (createdBooking && registerResponse.client) {
        try {
          console.log('📝 Привязка бронирования к клиенту:', {
            bookingId: createdBooking.id,
            clientId: registerResponse.client.id,
          });

          const assignResult = await assignBookingToClient({
            id: createdBooking.id.toString(),
            client_id: registerResponse.client.id,
          }).unwrap();

          console.log('✅ Бронирование успешно привязано:', assignResult);
        } catch (assignError: any) {
          console.error('❌ Ошибка привязки бронирования:', assignError);
          // Не блокируем создание аккаунта из-за ошибки привязки
          // Пользователь все равно получит доступ к аккаунту
        }
      }

      // Передаем данные созданного пользователя родительскому компоненту
      onAccountCreated(registerResponse);
      
      // Закрываем диалог
      onClose();
      
    } catch (err: any) {
      console.error('❌ Ошибка создания аккаунта:', err);
      setError(
        err?.data?.details?.join(', ') ||
        err?.data?.error ||
        err?.message ||
        'Произошла ошибка при создании аккаунта'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Обработчик продолжения без аккаунта
  const handleContinueWithoutAccount = () => {
    onContinueWithoutAccount();
    onClose();
  };

  // Сброс формы при закрытии
  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setIsCreating(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isCreating}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6">
            Создать личный кабинет
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Ваше бронирование успешно создано!</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Создайте личный кабинет, чтобы управлять своими бронированиями и получать уведомления.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Создайте личный кабинет для:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Управления вашими бронированиями
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Получения уведомлений о записях
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Быстрого повторного бронирования
            </Typography>
            <Typography component="li" variant="body2">
              Сохранения данных автомобилей
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Данные для аккаунта:
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Имя:</strong> {bookingData.service_recipient.first_name} {bookingData.service_recipient.last_name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Телефон:</strong> {bookingData.service_recipient.phone}
          </Typography>
          {bookingData.service_recipient.email && (
            <Typography variant="body2">
              <strong>Email:</strong> {bookingData.service_recipient.email}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            error={!!error && password.length < 6}
            helperText={password.length > 0 && password.length < 6 ? 'Пароль должен содержать не менее 6 символов' : ''}
            fullWidth
            disabled={isCreating}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isCreating}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Подтверждение пароля"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            error={!!error && confirmPassword.length > 0 && password !== confirmPassword}
            helperText={
              confirmPassword.length > 0 && password !== confirmPassword 
                ? 'Пароли не совпадают' 
                : ''
            }
            fullWidth
            disabled={isCreating}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={isCreating}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleContinueWithoutAccount}
          disabled={isCreating}
        >
          Продолжить без аккаунта
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateAccount}
          disabled={!isFormValid() || isCreating}
          startIcon={isCreating ? <CircularProgress size={20} /> : <AccountCircleIcon />}
        >
          {isCreating ? 'Создание аккаунта...' : 'Создать аккаунт'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 