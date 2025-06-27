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

// Типы для данных формы
export interface BookingFormData {
  // Шаг 0: Выбор категории услуг
  service_category_id: number;
  
  // Шаг 1: Город и точка обслуживания
  city_id: number | null;
  service_point_id: number | null;
  
  // Шаг 2: Дата и время
  booking_date: string;
  start_time: string;
  
  // Шаг 3: Информация о клиенте
  client: {
    first_name: string;
    last_name?: string;
    phone: string;
    email: string;
  };
  
  // Получатель услуги (может отличаться от заказчика)
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
    label: 'Выбор города и точки обслуживания',
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

// Начальные данные формы
const initialFormData: BookingFormData = {
  service_category_id: 0,
  city_id: null,
  service_point_id: null,
  booking_date: '',
  start_time: '',
  client: {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  },
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
  
  const { data: currentUser, isLoading: isLoadingCurrentUser, error: currentUserError } = useGetCurrentUserQuery(
    undefined, // Параметры не нужны
    { 
      skip: !isAuthenticated, // Пропускаем запрос если пользователь не авторизован
      refetchOnMountOrArgChange: true // Перезагружаем при монтировании компонента
    }
  );
  
  // Получаем параметры из URL и state (если переданы)
  useEffect(() => {
    // Получаем параметры из URL
    const searchParams = new URLSearchParams(location.search);
    const servicePointId = searchParams.get('servicePointId');
    
    // Получаем данные из state (если переданы при навигации)
    const stateData = location.state as {
      servicePointId?: number;
      servicePointName?: string;
      cityId?: number;
      cityName?: string;
      partnerId?: number;
      partnerName?: string;
      step1Completed?: boolean;
    } | null;
    
    // Обновляем данные формы, приоритет у данных из state
    const newFormData = { ...formData };
    
    // Устанавливаем ID сервисной точки (из state или из URL)
    if (stateData?.servicePointId) {
      newFormData.service_point_id = stateData.servicePointId;
      console.log('Установлена сервисная точка из state:', stateData.servicePointId, stateData.servicePointName);
    } else if (servicePointId) {
      newFormData.service_point_id = Number(servicePointId);
      console.log('Установлена сервисная точка из URL:', servicePointId);
    }
    
    // Устанавливаем ID города (только из state)
    if (stateData?.cityId) {
      newFormData.city_id = stateData.cityId;
      console.log('Установлен город из state:', stateData.cityId, stateData.cityName);
      
      // Если передан только город (без сервисной точки), начинаем с первого шага (выбор категории)
      if (!stateData.servicePointId && !servicePointId) {
        setActiveStep(0); // Начинаем с выбора категории
        console.log('Начинаем с выбора категории, так как передан только город');
      }
    }
    
    // Обновляем данные формы
    setFormData(newFormData);
  }, [location.search, location.state]);

  // Отдельный useEffect для предзаполнения данных пользователя
  useEffect(() => {
    console.log('🔍 Проверка данных пользователя для предзаполнения:', {
      isAuthenticated,
      isLoadingCurrentUser,
      hasUser: !!user,
      hasCurrentUser: !!currentUser,
      currentUserError: currentUserError,
      userFromRedux: user,
      userFromAPI: currentUser,
      currentFormData: formData.client
    });

    // Используем данные из API (currentUser) с приоритетом над Redux (user)
    const userData = currentUser || user;
    
    if (isAuthenticated && userData && !isLoadingCurrentUser) {
      console.log('✅ Предзаполняем данные пользователя:', userData);
      
      // Проверяем, не заполнены ли уже данные (чтобы не перезаписывать при редактировании)
      const shouldPrefill = !formData.client.first_name && !formData.client.phone;
      
      if (shouldPrefill) {
        console.log('🔄 Выполняем предзаполнение полей...');
        setFormData(prev => ({
          ...prev,
          client: {
            ...prev.client,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          }
        }));
        console.log('✅ Данные пользователя предзаполнены');
      } else {
        console.log('ℹ️ Данные уже заполнены, пропускаем предзаполнение:', {
          current_first_name: formData.client.first_name,
          current_phone: formData.client.phone
        });
      }
    } else if (isAuthenticated && !userData && !isLoadingCurrentUser && currentUserError) {
      console.error('❌ Ошибка загрузки данных пользователя:', currentUserError);
    } else if (isAuthenticated && isLoadingCurrentUser) {
      console.log('⏳ Загружаем данные пользователя...');
    } else if (!isAuthenticated) {
      console.log('❌ Пользователь не авторизован');
    } else {
      console.log('⚠️ Условия для предзаполнения не выполнены:', {
        isAuthenticated,
        hasUserData: !!userData,
        isLoadingCurrentUser
      });
    }
  }, [isAuthenticated, user, currentUser, isLoadingCurrentUser, currentUserError]);
  
  // Синхронизация данных получателя услуги с данными клиента (для самообслуживания)
  useEffect(() => {
    // Если данные клиента заполнены, а данные получателя пустые, копируем их
    if (formData.client.first_name && 
        formData.client.phone && 
        !formData.service_recipient.first_name && 
        !formData.service_recipient.phone) {
      setFormData(prev => ({
        ...prev,
        service_recipient: {
          first_name: prev.client.first_name,
          last_name: prev.client.last_name || '',
          phone: prev.client.phone,
          email: prev.client.email,
        }
      }));
    }
  }, [formData.client.first_name, formData.client.last_name, formData.client.phone, formData.client.email]);
  
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
  
  // Валидация текущего шага
  const isCurrentStepValid = useMemo((): boolean => {
    const step = STEPS[activeStep];
    
    // Отладочная информация
    console.log('Validating step:', {
      stepId: step.id,
      formData: {
        service_category_id: formData.service_category_id,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        city_id: formData.city_id,
        service_point_id: formData.service_point_id
      }
    });
    
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
        
        console.log('Date-time validation result:', {
          hasDate,
          hasTime,
          booking_date: formData.booking_date,
          start_time: formData.start_time,
          isValid
        });
        
        return isValid;
      }
      
      case 'client-info':
        // Валидация данных заказчика
        const phone = formData.client.phone.replace(/[^\d]/g, '');
        const isPhoneValid = phone.length >= 10 && phone.length <= 15;
        const isEmailValid = !formData.client.email || Boolean(formData.client.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
        
        const isClientValid = formData.client.first_name.trim().length >= 2 && isPhoneValid && isEmailValid;
        
        // Валидация данных получателя услуги
        const recipientPhone = formData.service_recipient.phone.replace(/[^\d]/g, '');
        const isRecipientPhoneValid = recipientPhone.length >= 10 && recipientPhone.length <= 15;
        const isRecipientEmailValid = !formData.service_recipient.email || Boolean(formData.service_recipient.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
        
        const isRecipientValid = (
          formData.service_recipient.first_name.trim().length >= 2 &&
          formData.service_recipient.last_name.trim().length >= 2 &&
          isRecipientPhoneValid &&
          isRecipientEmailValid
        );
        
        return isClientValid && isRecipientValid;
      
      case 'car-type':
        return formData.car_type_id !== null;
      
      case 'services':
        return true; // Услуги опциональны
      
      case 'review':
        return true; // Комментарий опционален
      
      default:
        return false;
    }
  }, [activeStep, formData, currentUser]);
  
  // Отправка формы
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Форматируем данные для API
      const bookingData: any = {
        booking: {
          service_point_id: formData.service_point_id,
          service_category_id: formData.service_category_id,
          booking_date: formData.booking_date,
          start_time: formData.start_time,
          notes: formData.notes || '',
          // Поля получателя услуги
          service_recipient_first_name: formData.service_recipient.first_name,
          service_recipient_last_name: formData.service_recipient.last_name,
          service_recipient_phone: formData.service_recipient.phone,
          service_recipient_email: formData.service_recipient.email || ''
        },
        car: {
          car_type_id: formData.car_type_id,
          license_plate: formData.license_plate,
          car_brand: formData.car_brand || '',
          car_model: formData.car_model || ''
        },
        services: formData.services
      };

      // Для авторизованных пользователей НЕ отправляем данные клиента
      // Сервер автоматически использует current_user.client
      if (!currentUser) {
        bookingData.client = {
          first_name: formData.client.first_name,
          last_name: formData.client.last_name,
          phone: formData.client.phone.replace(/[^\d+]/g, ''),
          email: formData.client.email || ''
        };
      }

      // Отладочная информация
      console.log('Booking data being sent:', bookingData);
      console.log('Current user:', currentUser);
      console.log('Is authenticated:', isAuthenticated);

      // Отправляем запрос
      const response = await createClientBooking(bookingData).unwrap();

      // Сохраняем данные созданного бронирования и показываем модальное окно
      setCreatedBooking(response);
      setSuccessDialogOpen(true);

    } catch (error: any) {
      console.error('Ошибка создания бронирования:', error);
      console.log('Детали ошибки:', error.data);
      
      // Формируем понятное сообщение об ошибке
      let errorMessage = 'Произошла ошибка при создании бронирования. ';
      
      if (error.data?.error) {
        errorMessage += error.data.error;
      }
      
      if (error.data?.details) {
        errorMessage += '\n' + error.data.details.join('\n');
      }
      
      setSubmitError(errorMessage);
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
      navigate('/client/profile/bookings');
    } else {
      navigate('/client/auth/login', {
        state: { 
          redirectTo: '/client/profile/bookings',
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
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              variant="outlined"
              size="small"
            >
              Назад
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Новое бронирование
            </Typography>
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
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Назад
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Шаг {activeStep + 1} из {STEPS.length}
                </Typography>
              </Box>
              
              {activeStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid || isSubmitting}
                  variant="contained"
                  endIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                >
                  {isSubmitting ? 'Создание...' : 'Подтвердить бронирование'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                >
                  Далее
                </Button>
              )}
            </Box>
          </Paper>
        </Container>

        {/* Модальное окно успешного создания бронирования */}
        <SuccessDialog
          open={successDialogOpen}
          title="Бронирование создано!"
          message="Спасибо за ваше бронирование!"
          description="Мы отправили ваш запрос в сервисную точку для подтверждения времени и деталей обслуживания. Вы можете проверить информацию в вашем личном кабинете."
          bookingDetails={createdBooking ? {
            id: createdBooking.id,
            date: createdBooking.booking_date,
            time: createdBooking.start_time,
            servicePoint: createdBooking.service_point?.name,
            servicePointAddress: createdBooking.service_point?.city?.name 
              ? `${createdBooking.service_point.city.name}, ${createdBooking.service_point?.address}`
              : createdBooking.service_point?.address,
            servicePointPhone: createdBooking.service_point?.phone,
            clientName: createdBooking.client?.first_name && createdBooking.client?.last_name 
              ? `${createdBooking.client.first_name} ${createdBooking.client.last_name}` 
              : undefined,
            carInfo: createdBooking.car_brand && createdBooking.car_model 
              ? `${createdBooking.car_brand} ${createdBooking.car_model}` 
              : undefined,
          } : undefined}
          primaryButtonText={currentUser ? "Мои бронирования" : "На главную"}
          secondaryButtonText="Создать еще одно бронирование"
          onPrimaryAction={currentUser ? handleGoToProfile : handleGoHome}
          onSecondaryAction={handleCreateAnother}
          onClose={handleGoHome}
        />
      </Box>
    </ClientLayout>
  );
};

export default NewBookingWithAvailabilityPage;
