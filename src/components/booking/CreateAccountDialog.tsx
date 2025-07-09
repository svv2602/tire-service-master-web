import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useRegisterClientMutation, useLoginClientMutation } from '../../api/clientAuth.api';
import { useAssignBookingToClientMutation } from '../../api/clientBookings.api';
import { setCredentials } from '../../store/slices/authSlice';
import { BookingFormData } from '../../types/booking';
import { generatePasswordFromPhone } from '../../utils/phoneUtils';
import { UserRole } from '../../types';
import { useTranslation } from 'react-i18next';

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
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation('components');
  
  // Состояния формы
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // API мутации
  const [registerClient] = useRegisterClientMutation();
  const [loginClient] = useLoginClientMutation();
  const [assignBookingToClient] = useAssignBookingToClientMutation();

  // Автоматическая генерация пароля из номера телефона
  const generatedPassword = React.useMemo(() => {
    if (!bookingData.service_recipient.phone) return '';
    
    // 📱 НОРМАЛИЗАЦИЯ НОМЕРА ТЕЛЕФОНА (такая же как в UniversalLoginForm)
    const digitsOnly = bookingData.service_recipient.phone.replace(/[^\d]/g, '');
    
    // Если номер начинается с 38, убираем код страны для пароля
    if (digitsOnly.startsWith('38') && digitsOnly.length === 12) {
      return digitsOnly.substring(2); // 380501234567 -> 0501234567
    }
    
    // Если номер начинается с 0 и содержит 10 цифр, используем как есть
    if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
      return digitsOnly; // 0501234567 -> 0501234567
    }
    
    // Для любого другого формата возвращаем все цифры
    return digitsOnly;
  }, [bookingData.service_recipient.phone]);

  // Обработчик создания аккаунта
  const handleCreateAccount = async () => {
    if (!generatedPassword) {
      setError('Не удалось сгенерировать пароль из номера телефона');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Подготавливаем данные для регистрации
      // 📱 НОРМАЛИЗАЦИЯ НОМЕРА ТЕЛЕФОНА ДЛЯ РЕГИСТРАЦИИ
      const digitsOnly = bookingData.service_recipient.phone.replace(/[^\d]/g, '');
      let normalizedPhone = digitsOnly;
      
      // Если номер начинается с 0, добавляем 38 в начало для полного формата
      if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
        normalizedPhone = '38' + digitsOnly; // 0501234567 -> 380501234567
      }
      
      const registrationData = {
        user: {
          first_name: bookingData.service_recipient.first_name,
          last_name: bookingData.service_recipient.last_name,
          // Отправляем email только если он реально указан
          ...(bookingData.service_recipient.email && { email: bookingData.service_recipient.email }),
          phone: normalizedPhone,
          password: generatedPassword,
          password_confirmation: generatedPassword,
        },
      };

      console.log('🚀 Создание аккаунта клиента:', registrationData);

      // Регистрируем клиента
      const registerResponse = await registerClient(registrationData).unwrap();
      
      console.log('✅ Аккаунт создан:', registerResponse);

      // Автоматически входим в систему после регистрации
      try {
        // 📱 НОРМАЛИЗАЦИЯ НОМЕРА ТЕЛЕФОНА ДЛЯ ЛОГИНА (такая же как в UniversalLoginForm)
        const digitsOnly = bookingData.service_recipient.phone.replace(/[^\d]/g, '');
        let normalizedLogin = digitsOnly;
        
        // Если номер начинается с 0, добавляем 38 в начало
        if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
          normalizedLogin = '38' + digitsOnly; // 0501234567 -> 380501234567
        }
        
        const loginData = {
          login: normalizedLogin,
          password: generatedPassword,
        };

        console.log('🔐 Автоматический вход в систему:', {
          originalPhone: bookingData.service_recipient.phone,
          normalizedLogin,
          password: generatedPassword
        });
        const loginResponse = await loginClient(loginData).unwrap();
        console.log('✅ Вход выполнен:', loginResponse);
        
        // Сохраняем данные пользователя в Redux store
        dispatch(setCredentials({
          accessToken: loginResponse.tokens?.access || null,
          user: {
            ...loginResponse.user,
            role: UserRole.CLIENT,
            role_id: 1,
            email_verified: false,
            phone_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          }
        }));

        // Даем время для обновления состояния Redux
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (loginError: any) {
        console.error('❌ Ошибка входа в систему:', loginError);
        // Продолжаем даже если вход не удался
      }

      // Если есть созданное бронирование, проверяем, нужно ли его привязывать
      if (createdBooking && registerResponse.client) {
        // Если бронирование уже создано авторизованным пользователем, 
        // то оно уже привязано к правильному клиенту
        if (createdBooking.client_id) {
          console.log('✅ Бронирование уже привязано к клиенту:', {
            bookingId: createdBooking.id,
            clientId: createdBooking.client_id,
          });
        } else {
          // Только если бронирование было создано как гостевое, привязываем его
          try {
            console.log('📝 Привязка гостевого бронирования к клиенту:', {
              bookingId: createdBooking.id,
              clientId: registerResponse.client.id,
            });

            const assignResult = await assignBookingToClient({
              id: createdBooking.id.toString(),
              client_id: registerResponse.client.id,
            }).unwrap();

            console.log('✅ Бронирование успешно привязано:', assignResult);
          } catch (assignError: any) {
            console.log('ℹ️ Привязка бронирования не потребовалась или не удалась:', assignError);
            // Не блокируем создание аккаунта из-за ошибки привязки
          }
        }
      }

      // Даем дополнительное время для полного обновления состояния
      await new Promise(resolve => setTimeout(resolve, 200));

      // Передаем данные созданного пользователя родительскому компоненту
      onAccountCreated({
        ...registerResponse,
        isAuthenticated: true
      });
      
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
            {t('createAccountDialog.title')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{t('createAccountDialog.successMessage')}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {t('createAccountDialog.description')}
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('createAccountDialog.benefitsTitle')}
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              {t('createAccountDialog.benefits.manageBookings')}
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              {t('createAccountDialog.benefits.notifications')}
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              {t('createAccountDialog.benefits.quickRebooking')}
            </Typography>
            <Typography component="li" variant="body2">
              {t('createAccountDialog.benefits.saveCarData')}
            </Typography>
          </Box>
        </Box>

        {/* Данные для аккаунта с улучшенным фоном для темной темы */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
          borderRadius: 1,
          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
        }}>
          <Typography variant="body2" sx={{ 
            mb: 1, 
            fontWeight: 'medium',
            color: theme.palette.mode === 'dark' ? 'grey.200' : 'grey.700'
          }}>
            {t('createAccountDialog.accountData')}:
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 0.5,
            color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'
          }}>
            <strong>{t('createAccountDialog.fields.name')}:</strong> {bookingData.service_recipient.first_name} {bookingData.service_recipient.last_name}
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 0.5,
            color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'
          }}>
            <strong>{t('createAccountDialog.fields.phone')}:</strong> {bookingData.service_recipient.phone}
          </Typography>
          {bookingData.service_recipient.email && (
            <Typography variant="body2" sx={{ 
              mb: 0.5,
              color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'
            }}>
              <strong>{t('createAccountDialog.fields.email')}:</strong> {bookingData.service_recipient.email}
            </Typography>
          )}
          <Typography variant="body2" sx={{ 
            color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'
          }}>
            <strong>{t('createAccountDialog.fields.tempPassword')}:</strong> {generatedPassword}
          </Typography>
        </Box>

        {/* Информация о временном пароле */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{t('createAccountDialog.tempPasswordInfo', { password: generatedPassword })}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {t('createAccountDialog.passwordNote')}
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleContinueWithoutAccount}
          disabled={isCreating}
        >
          {t('createAccountDialog.buttons.continueWithout')}
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateAccount}
          disabled={isCreating}
          startIcon={isCreating ? <CircularProgress size={20} /> : <AccountCircleIcon />}
        >
          {isCreating ? t('createAccountDialog.buttons.creating') : t('createAccountDialog.buttons.createAccount')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 