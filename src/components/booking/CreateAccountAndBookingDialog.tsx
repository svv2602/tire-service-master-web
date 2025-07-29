import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

import { useRegisterClientMutation } from '../../api/clientAuth.api';
import { useCreateClientBookingMutation, ClientBookingRequest } from '../../api/clientBookings.api';
import { useCheckUserExistsQuery } from '../../api/users.api';
import { useCreateMyClientCarMutation } from '../../api/clients.api';
import { useGetCarBrandsQuery } from '../../api/carBrands.api';
import { useGetCarModelsByBrandIdQuery } from '../../api/carModels.api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { BookingFormData } from '../../types/booking';
import { UserRole } from '../../types';
import { ClientCarFormData } from '../../types/client';
import { extractPhoneDigits, generatePasswordFromPhone } from '../../utils/phoneUtils';
import { getButtonStyles } from '../../styles/components';
import ExistingUserDialog from './ExistingUserDialog';

interface CreateAccountAndBookingDialogProps {
  open: boolean;
  onClose: () => void;
  bookingData: BookingFormData;
  onSuccess: (bookingId: number) => void;
  onContinueAsGuest?: () => void;
}

const CreateAccountAndBookingDialog: React.FC<CreateAccountAndBookingDialogProps> = ({
  open,
  onClose,
  bookingData,
  onSuccess,
  onContinueAsGuest,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const buttonStyles = getButtonStyles(theme);
  
  const [step, setStep] = useState<'checking' | 'creating' | 'booking' | 'success'>('checking');
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false);
  
  const [registerClient] = useRegisterClientMutation();
  const [createClientBooking] = useCreateClientBookingMutation();
  const [createMyClientCar] = useCreateMyClientCarMutation();
  
  // Получаем список брендов для поиска
  const { data: carBrandsData } = useGetCarBrandsQuery({});
  
  // Проверяем существование пользователя при открытии диалога
  const { data: userExistsData, isLoading: isCheckingUser } = useCheckUserExistsQuery(
    { 
      phone: extractPhoneDigits(bookingData.service_recipient.phone),
      email: bookingData.service_recipient.email
    },
    { skip: !open }
  );

  // Обработка результата проверки существования пользователя
  React.useEffect(() => {
    if (open && userExistsData && !isCheckingUser) {
      if (userExistsData.exists && userExistsData.user) {
        console.log('🔍 Найден существующий пользователь:', userExistsData.user);
        setExistingUser(userExistsData.user);
        setShowExistingUserDialog(true);
      } else {
        console.log('✅ Пользователь не найден, можно создавать новый аккаунт');
        setStep('creating');
        handleCreateAccount();
      }
    }
  }, [open, userExistsData, isCheckingUser]);

  // Сброс состояния при закрытии диалога
  React.useEffect(() => {
    if (!open) {
      setStep('checking');
      setError('');
      setExistingUser(null);
      setShowExistingUserDialog(false);
    }
  }, [open]);

  const handleCreateAccount = async () => {
    try {
      setError('');
      setStep('creating');
      
      const normalizedPhone = extractPhoneDigits(bookingData.service_recipient.phone);
      const password = generatePasswordFromPhone(normalizedPhone);
      
      const userData = {
        user: {
          first_name: bookingData.service_recipient.first_name,
          last_name: bookingData.service_recipient.last_name,
          phone: normalizedPhone,
          email: bookingData.service_recipient.email, // Добавляем email из данных бронирования
          password: password,
          password_confirmation: password,
        },
      };
      
      console.log('🚀 Создание аккаунта клиента:', userData);
      const registerResult = await registerClient(userData).unwrap();
      console.log('✅ Аккаунт создан:', registerResult);
      
      // Сохраняем токены в Redux
      console.log('🔐 Используем токены из регистрации:', registerResult.tokens);
      dispatch(setCredentials({
        accessToken: registerResult.tokens.access,
        user: {
          id: registerResult.user.id,
          email: registerResult.user.email || '',
          first_name: registerResult.user.first_name,
          last_name: registerResult.user.last_name,
          phone: registerResult.user.phone,
          role: UserRole.CLIENT,
          role_id: 1, // Добавляем role_id для совместимости
          is_active: true,
          email_verified: false,
          phone_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client_id: registerResult.client.id,
        },
      }));
      
      // Создаем автомобиль клиента (если указан)
      await handleCreateClientCar();
      
      // Создаем бронирование
      await handleCreateBooking(registerResult.client.id);
      
    } catch (err: any) {
      console.error('❌ Ошибка создания аккаунта:', err);
      setError(err?.data?.error || err?.data?.details?.join(', ') || t('bookingModals.createAccountAndBooking.errors.accountCreation'));
      setStep('creating');
    }
  };

  const handleCreateClientCar = async () => {
    try {
      // Создаем автомобиль только если указаны минимально необходимые данные
      if (bookingData.license_plate) {
        console.log('🚗 Создание автомобиля клиента...');
        
        // Ищем бренд по названию
        let brandId = 1; // Дефолтный бренд
        if (bookingData.car_brand && carBrandsData?.data) {
          const foundBrand = carBrandsData.data.find(brand => 
            brand.name.toLowerCase() === bookingData.car_brand.toLowerCase()
          );
          if (foundBrand) {
            console.log('🔍 Найден бренд:', foundBrand);
            brandId = foundBrand.id;
          } else {
            console.log('⚠️ Бренд не найден:', bookingData.car_brand);
          }
        }
        
        // Подготавливаем данные для создания автомобиля
        const carData: ClientCarFormData = {
          brand_id: brandId,
          model_id: 1, // Дефолтная модель (первая в базе)
          year: new Date().getFullYear(), // Текущий год по умолчанию
          license_plate: bookingData.license_plate,
          car_type_id: bookingData.car_type_id || 1, // Дефолтный тип автомобиля
          is_primary: true, // Первый автомобиль делаем основным
        };
        
        console.log('🚗 Данные автомобиля для создания:', carData);
        
        // Создаем автомобиль через API
        const carResult = await createMyClientCar(carData).unwrap();
        console.log('✅ Автомобиль успешно создан:', carResult);
      } else {
        console.log('ℹ️ Номер автомобиля не указан, пропускаем создание автомобиля');
      }
    } catch (err: any) {
      console.error('⚠️ Ошибка создания автомобиля (не критичная):', err);
      // Логируем подробности ошибки для отладки
      if (err?.data) {
        console.error('⚠️ Детали ошибки API:', err.data);
      }
      // Не прерываем процесс, если автомобиль не создался
    }
  };

  const handleCreateGuestBooking = async () => {
    try {
      setStep('booking');
      
      // Формируем данные для гостевого бронирования (без client_id)
      const bookingRequestData: ClientBookingRequest = {
        booking: {
          service_point_id: bookingData.service_point_id!,
          service_category_id: bookingData.service_category_id,
          booking_date: bookingData.booking_date,
          start_time: bookingData.start_time,
          notes: bookingData.notes || '',
          // Поля автомобиля
          license_plate: bookingData.license_plate,
          car_brand: bookingData.car_brand,
          car_model: bookingData.car_model,
          car_type_id: bookingData.car_type_id || undefined,
          // Поля получателя услуги
          service_recipient_first_name: bookingData.service_recipient.first_name,
          service_recipient_last_name: bookingData.service_recipient.last_name,
          service_recipient_phone: bookingData.service_recipient.phone,
          service_recipient_email: bookingData.service_recipient.email,
        },
        services: [], // Услуги больше не выбираются - передаем пустой массив
        // НЕ передаем client_id для гостевого бронирования
      };
      
      console.log('🚀 Создание гостевого бронирования:', bookingRequestData);
      const bookingResult = await createClientBooking(bookingRequestData).unwrap();
      console.log('✅ Гостевое бронирование создано:', bookingResult);
      
      setStep('success');
      setTimeout(() => {
        onSuccess(bookingResult.id);
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Ошибка создания гостевого бронирования:', err);
      setError(err?.data?.error || err?.data?.details?.join(', ') || t('bookingModals.createAccountAndBooking.errors.bookingCreation'));
      setStep('booking');
    }
  };

  const handleCreateBooking = async (clientId: number) => {
    try {
      setStep('booking');
      
      // Формируем данные для бронирования согласно ClientBookingRequest
      const bookingRequestData: ClientBookingRequest = {
        booking: {
          service_point_id: bookingData.service_point_id!,
          service_category_id: bookingData.service_category_id,
          booking_date: bookingData.booking_date,
          start_time: bookingData.start_time,
          notes: bookingData.notes || '',
          // Поля автомобиля
          license_plate: bookingData.license_plate,
          car_brand: bookingData.car_brand,
          car_model: bookingData.car_model,
          car_type_id: bookingData.car_type_id || undefined,
          // Поля получателя услуги
          service_recipient_first_name: bookingData.service_recipient.first_name,
          service_recipient_last_name: bookingData.service_recipient.last_name,
          service_recipient_phone: bookingData.service_recipient.phone,
          service_recipient_email: bookingData.service_recipient.email,
        },
        services: [], // Услуги больше не выбираются - передаем пустой массив
      };
      
      const bookingResult = await createClientBooking(bookingRequestData).unwrap();
      
      setStep('success');
      setTimeout(() => {
        onSuccess(bookingResult.id);
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Ошибка создания бронирования:', err);
      
      // Безопасная обработка ошибок
      try {
        if (err && typeof err === 'object') {
          // Пытаемся извлечь основные свойства ошибки
          const errorInfo = {
            message: err.message,
            status: err.status,
            data: err.data,
            name: err.name
          };
          if (err.data) {
            // Обработка ошибок API
          }
        } else {
          // Обработка простых ошибок
        }
      } catch (logError) {
        console.error('❌ Ошибка при логировании:', logError);
        console.error('❌ Исходная ошибка (строка):', String(err));
      }
      
      setError(`${t('bookingModals.createAccountAndBooking.errors.bookingCreation')}: ${err?.data?.error || err?.message || t('bookingModals.createAccountAndBooking.errors.unknown')}`);
      setStep('creating');
    }
  };

  const handleExistingUserLogin = (userData: any) => {
    console.log('✅ Пользователь вошел в систему:', userData);
    setShowExistingUserDialog(false);
    
    // Сохраняем данные пользователя в Redux
    dispatch(setCredentials({
      accessToken: userData.tokens?.access || userData.access_token,
      user: userData.user,
    }));
    
    // Создаем бронирование для авторизованного пользователя
    handleCreateBooking(userData.user.client_id);
  };

  const handleContinueAsGuest = () => {
    console.log('👤 Продолжаем как гость - передаем управление родительскому компоненту');
    setShowExistingUserDialog(false);
    onClose();
    // Вызываем callback для создания гостевого бронирования
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 'checking':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography>{t('bookingModals.createAccountAndBooking.steps.checking')}</Typography>
          </Box>
        );
      
      case 'creating':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography>{t('bookingModals.createAccountAndBooking.steps.creating')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('bookingModals.createAccountAndBooking.steps.creatingSubtitle')}
            </Typography>
          </Box>
        );
      
      case 'booking':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography>{t('bookingModals.createAccountAndBooking.steps.booking')}</Typography>
          </Box>
        );
      
      case 'success':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
            <Typography variant="h6">{t('bookingModals.createAccountAndBooking.steps.success')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('bookingModals.createAccountAndBooking.steps.successSubtitle')}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open && !showExistingUserDialog} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">
              {t('bookingModals.createAccountAndBooking.title')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ 
            minHeight: 120, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {getStepContent()}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={step === 'creating' || step === 'booking'}
            sx={getButtonStyles(theme, 'secondary')}
          >
            {t('bookingModals.createAccountAndBooking.cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог для существующего пользователя */}
      <ExistingUserDialog
        open={showExistingUserDialog}
        onClose={() => setShowExistingUserDialog(false)}
        user={existingUser}
        onLoginSuccess={handleExistingUserLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
};

export default CreateAccountAndBookingDialog; 