// Многошаговая форма бронирования с интеграцией системы доступности

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// Импорт компонентов UI
import Stepper from '../../components/ui/Stepper';
import { SuccessDialog } from '../../components/ui/Dialog';
import ExistingUserDialog from '../../components/booking/ExistingUserDialog';

// Импорт шагов формы
import {
  CityServicePointStep,
  DateTimeStep,
  ClientInfoStep,
  CarTypeStep,
  ServicesStep,
  ReviewStep,
  CategorySelectionStep,
} from './components';

// Импорт API хуков
import { 
  useCreateClientBookingMutation,
  useGetBookingByIdQuery,
} from '../../api/bookings.api';
import { useGetCurrentUserQuery } from '../../api/auth.api';

// Импорт стилей
import { getCardStyles } from '../../styles/components';
import { getThemeColors, getButtonStyles } from '../../styles';

import ClientLayout from '../../components/client/ClientLayout';

// ✅ Обновленные типы для поддержки гостевых бронирований
export interface BookingFormData {
  // Шаг 0: Выбор категории услуг
  service_category_id: number;
  
  // Шаг 1: Город и точка обслуживания
  city_id: number | null;
  service_point_id: number | null;
  
  // Шаг 2: Дата и время
  booking_date: string;
  start_time: string;
  duration_minutes?: number; // Длительность выбранного слота
  
  // Получатель услуги (обязательно)
  service_recipient: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  
  // Шаг 4: Тип автомобиля
  car_type_id: number | null;
  car_brand: string;
  car_model: string;
  license_plate: string;
  
  // Шаг 5: Услуги (опционально)
  services: Array<{
    service_id: number;
    quantity: number;
    price: number;
  }>;
  
  // Шаг 6: Комментарий (опционально)
  notes: string;
}

// Конфигурация шагов
const STEPS = [
  {
    id: 'category-selection',
    label: 'Выбор типа услуг',
    component: CategorySelectionStep,
  },
  {
    id: 'city-service-point',
    label: 'Выбор точки обслуживания',
    component: CityServicePointStep,
  },
  {
    id: 'date-time',
    label: 'Дата и время',
    component: DateTimeStep,
  },
  {
    id: 'client-info',
    label: 'Контактная информация',
    component: ClientInfoStep,
  },
  {
    id: 'car-type',
    label: 'Информация об автомобиле',
    component: CarTypeStep,
  },
  {
    id: 'services',
    label: 'Услуги',
    component: ServicesStep,
  },
  {
    id: 'review',
    label: 'Подтверждение',
    component: ReviewStep,
  },
];

// ✅ Обновленные начальные данные формы
const initialFormData: BookingFormData = {
  service_category_id: 0,
  city_id: null,
  service_point_id: null,
  booking_date: '',
  start_time: '',
  service_recipient: {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  },
  car_type_id: null,
  car_brand: '',
  car_model: '',
  license_plate: '',
  services: [],
  notes: '',
};

const NewBookingWithAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  // Получаем информацию об аутентификации
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Состояние формы
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Состояние модального окна успеха
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  
  // Состояние диалога существующего пользователя
  const [existingUserDialogOpen, setExistingUserDialogOpen] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);
  
  const { data: currentUser, isLoading: isLoadingCurrentUser, error: currentUserError } = useGetCurrentUserQuery(
    undefined, // Параметры не нужны
    { 
      skip: !isAuthenticated, // Пропускаем запрос если пользователь не авторизован
      refetchOnMountOrArgChange: true // Перезагружаем при монтировании компонента
    }
  );
  
  // ✅ Предзаполнение данных для авторизованных пользователей
  useEffect(() => {
    const userData = currentUser || user;
    
    if (isAuthenticated && userData && !isLoadingCurrentUser) {
      // Проверяем, не заполнены ли уже данные получателя услуги
      const shouldPrefill = !formData.service_recipient.first_name && !formData.service_recipient.phone;
      
      if (shouldPrefill) {
        setFormData(prev => ({
          ...prev,
          service_recipient: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || '',
            email: userData.email || '',
          }
        }));
      }
    }
  }, [isAuthenticated, user, currentUser, isLoadingCurrentUser, currentUserError]);
  
  // Мутация для создания бронирования
  const [createClientBooking] = useCreateClientBookingMutation();
  
  // Функции навигации по шагам
  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };
  
  const handleStepClick = (stepIndex: number) => {
    // Разрешаем переход только на предыдущие шаги или следующий шаг
    if (stepIndex <= activeStep + 1 && stepIndex >= 0) {
      setActiveStep(stepIndex);
    }
  };
  
  // ✅ Обновленная валидация для гостевых бронирований
  const isCurrentStepValid = useMemo((): boolean => {
    const step = STEPS[activeStep];
    
    switch (step.id) {
      case 'category-selection':
        return formData.service_category_id > 0;
      
      case 'city-service-point':
        return formData.city_id !== null && formData.service_point_id !== null;
      
      case 'date-time': {
        // Проверяем, что дата и время выбраны
        const hasDate = Boolean(formData.booking_date && formData.booking_date.trim());
        const hasTime = Boolean(formData.start_time && formData.start_time.trim());
        const isValid = hasDate && hasTime;
        
        return isValid;
      }
      
      case 'client-info':
        // Валидация данных получателя услуги (обязательно для всех)
        const recipientPhone = formData.service_recipient.phone.replace(/[^\d]/g, '');
        const isRecipientPhoneValid = recipientPhone.length >= 10 && recipientPhone.length <= 15;
        const isRecipientEmailValid = !formData.service_recipient.email || Boolean(formData.service_recipient.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
        
        return (
          formData.service_recipient.first_name.trim().length >= 2 &&
          formData.service_recipient.last_name.trim().length >= 2 &&
          isRecipientPhoneValid &&
          isRecipientEmailValid
        );
      
      case 'car-type':
        return formData.car_type_id !== null && formData.license_plate.trim().length > 0;
      
      case 'services':
        return true; // Услуги опциональны
      
      case 'review':
        return true; // Комментарий опционален
      
      default:
        return false;
    }
  }, [activeStep, formData]);
  
  // ✅ Обновленная отправка формы для гостевых бронирований
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Подготавливаем данные для отправки в формате, ожидаемом бэкендом
      const bookingData: any = {
        // Данные бронирования (обязательно)
        booking: {
          service_point_id: formData.service_point_id,
          service_category_id: formData.service_category_id,
          booking_date: formData.booking_date,
          start_time: formData.start_time,
          service_recipient_first_name: formData.service_recipient.first_name,
          service_recipient_last_name: formData.service_recipient.last_name,
          service_recipient_phone: formData.service_recipient.phone,
          service_recipient_email: formData.service_recipient.email,
          notes: formData.notes,
        },
        // Данные автомобиля
        car: {
          car_type_id: formData.car_type_id,
          car_brand: formData.car_brand,
          car_model: formData.car_model,
          license_plate: formData.license_plate,
        },
        // Услуги (если есть)
        services: formData.services,
        // Длительность
        duration_minutes: formData.duration_minutes || 30,
      };

      // Отладочная информация
      console.log('🚀 Отправляем данные гостевого бронирования:', JSON.stringify(bookingData, null, 2));
      console.log('🔐 Статус аутентификации:', { isAuthenticated, currentUser: !!currentUser });

      const response = await createClientBooking(bookingData).unwrap();

      // Сохраняем данные созданного бронирования и показываем модальное окно
      setCreatedBooking(response);
      setSuccessDialogOpen(true);

    } catch (error: any) {
      console.error('❌ Ошибка создания бронирования:', error);
      setSubmitError(
        error?.data?.error || 
        error?.data?.message || 
        error?.message || 
        'Произошла ошибка при создании бронирования'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчики модального окна успешного создания бронирования
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setCreatedBooking(null);
  };

  const handleGoToProfile = () => {
    handleSuccessDialogClose();
    if (currentUser) {
      navigate('/my-bookings');
    } else {
      navigate('/client/auth/login', {
        state: { 
          redirectTo: '/my-bookings',
          message: 'Войдите в систему, чтобы просмотреть ваши бронирования'
        }
      });
    }
  };

  const handleCreateAnother = () => {
    handleSuccessDialogClose();
    // Сбрасываем форму для нового бронирования
    setFormData(initialFormData);
    setActiveStep(0);
  };

  const handleGoHome = () => {
    handleSuccessDialogClose();
    navigate('/client');
  };

  // Обработчики диалога существующего пользователя (не используется для гостевых бронирований)
  const handleLoginSuccess = (userData: any) => {
    setExistingUserDialogOpen(false);
    setExistingUserData(null);
    
    // Автоматически создаем бронирование после успешного входа
    handleSubmit();
  };

  const handleContinueAsGuest = () => {
    setExistingUserDialogOpen(false);
    setExistingUserData(null);
    
    // Очищаем форму и возвращаемся на шаг контактной информации
    setFormData(prev => ({
      ...prev,
      service_recipient: {
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
      },
    }));
    
    // Переходим на шаг ввода контактной информации
    setActiveStep(3);
  };
  
  // Рендер текущего шага
  const renderCurrentStep = () => {
    const CurrentStepComponent = STEPS[activeStep].component;
    
    return (
      <CurrentStepComponent
        formData={formData}
        setFormData={setFormData}
        onNext={handleNext}
        onBack={handleBack}
        isValid={isCurrentStepValid}
      />
    );
  };
  
  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Заголовок */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Новое бронирование {!isAuthenticated && <Typography component="span" variant="body2" color="text.secondary">(гостевое)</Typography>}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/client')}
              variant="outlined"
              size="small"
              color="error"
            >
              Отмена
            </Button>
          </Box>
          
          {/* Stepper */}
          <Paper sx={{ ...getCardStyles(theme), mb: 3, p: 3 }}>
            <Stepper
              steps={STEPS.map(step => ({
                label: step.label,
                content: <div />
              }))}
              activeStep={activeStep}
              onStepChange={handleStepClick}
              orientation={isMobile ? 'vertical' : 'horizontal'}
            />
          </Paper>
          
          {/* Контент шага */}
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            {renderCurrentStep()}
            
            {/* Ошибка отправки */}
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
            
            {/* Кнопки навигации */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              {/* Кнопка "Назад" */}
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                size="large"
                sx={{ ...secondaryButtonStyles, minWidth: isMobile ? '100%' : 120 }}
              >
                Назад
              </Button>
              
              {/* Кнопка "Далее" или "Создать бронирование" */}
              {activeStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid || isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ minWidth: isMobile ? '100%' : 200 }}
                >
                  {isSubmitting ? 'Создание...' : 'Создать бронирование'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  endIcon={<ArrowForwardIcon />}
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ minWidth: isMobile ? '100%' : 120 }}
                >
                  Далее
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
      
      {/* Модальное окно успешного создания бронирования */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        title="Бронирование создано!"
        message={
          isAuthenticated 
            ? "Ваше бронирование успешно создано. Вы можете просмотреть его в личном кабинете или создать новое бронирование."
            : "Ваше гостевое бронирование успешно создано! Информация о бронировании отправлена на указанный номер телефона."
        }
        primaryButtonText={isAuthenticated ? 'Мои бронирования' : 'На главную'}
        secondaryButtonText="Создать еще одно"
        onPrimaryAction={isAuthenticated ? handleGoToProfile : handleGoHome}
        onSecondaryAction={handleCreateAnother}
      />
      
      {/* Диалог существующего пользователя (не используется для гостевых бронирований) */}
      {existingUserData && (
        <ExistingUserDialog
          open={existingUserDialogOpen}
          onClose={() => setExistingUserDialogOpen(false)}
          user={existingUserData}
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
    </ClientLayout>
  );
};

export default NewBookingWithAvailabilityPage;
