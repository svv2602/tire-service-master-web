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
import { CreateAccountDialog } from '../../components/booking/CreateAccountDialog';
import BookingTypeChoiceDialog from '../../components/booking/BookingTypeChoiceDialog';
import CreateAccountAndBookingDialog from '../../components/booking/CreateAccountAndBookingDialog';
import { AddCarToProfileDialog } from '../../components/booking/AddCarToProfileDialog';

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
import { useGetMyClientCarsQuery } from '../../api/clients.api';

// Импорт утилит
import { shouldOfferToAddCar, prepareCarDataForDialog } from '../../utils/carUtils';

// Импорт стилей
import { getCardStyles } from '../../styles/components';
import { getThemeColors, getButtonStyles } from '../../styles';

import ClientLayout from '../../components/client/ClientLayout';

// Импорт типов
import { BookingFormData } from '../../types/booking';

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
  console.log('🚀 NewBookingWithAvailabilityPage загружен');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Отладочная информация в самом начале
  console.log('📍 location.pathname:', location.pathname);
  console.log('📍 location.state:', location.state);
  console.log('📍 location.search:', location.search);
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
  
  // Состояние диалога создания аккаунта
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  
  // Состояние диалога выбора типа бронирования
  const [bookingTypeChoiceDialogOpen, setBookingTypeChoiceDialogOpen] = useState(false);
  
  // Состояние диалога создания аккаунта и бронирования
  const [createAccountAndBookingDialogOpen, setCreateAccountAndBookingDialogOpen] = useState(false);
  
  // Состояние диалога добавления автомобиля в профиль
  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [carDataForDialog, setCarDataForDialog] = useState<any>({
    license_plate: '',
    car_brand: '',
    car_model: '',
    car_type_id: undefined,
  });
  
  // API хуки
  const { data: clientCars = [], refetch: refetchClientCars } = useGetMyClientCarsQuery(undefined, {
    skip: !isAuthenticated, // Пропускаем если пользователь не авторизован
  });
  
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
  
  // ✅ Предзаполнение данных из location.state (город с главной страницы)
  useEffect(() => {
    const stateData = location.state as any;
    console.log('🔍 Проверка location.state:', stateData);
    
    if (stateData) {
      console.log('📍 Получены данные из location.state:', stateData);
      
      // Обновляем formData с данными из location.state
      setFormData(prev => {
        const updatedData = { ...prev };
        
        // Предзаполнение города
        if (stateData.cityId && stateData.cityName) {
          updatedData.city_id = stateData.cityId;
          console.log(`🏙️ Предзаполнен город: ${stateData.cityName} (ID: ${stateData.cityId})`);
        }
        
        // Предзаполнение сервисной точки (если передана)
        if (stateData.servicePointId) {
          updatedData.service_point_id = stateData.servicePointId;
          console.log(`🏢 Предзаполнена сервисная точка: ID ${stateData.servicePointId}`);
        }
        
        // Предзаполнение категории (если передана)
        if (stateData.service_category_id) {
          updatedData.service_category_id = stateData.service_category_id;
          console.log(`🔧 Предзаполнена категория: ID ${stateData.service_category_id}`);
        }
        
        console.log('📋 Окончательные данные formData после обновления:', updatedData);
        
        return updatedData;
      });
      
      // Определяем начальный шаг в зависимости от переданных данных
      if (stateData.step1Completed || (stateData.cityId && stateData.servicePointId && stateData.service_category_id)) {
        // Если город, сервисная точка и категория уже выбраны, переходим к выбору даты и времени
        setActiveStep(2);
        console.log('⏭️ Переход на шаг выбора даты и времени (шаг 2)');
      } else if (stateData.cityId && stateData.servicePointId) {
        // Если выбраны город и сервисная точка, но не категория, переходим к выбору категории
        setActiveStep(0);
        console.log('⏭️ Переход на шаг выбора категории (шаг 0)');
      } else if (stateData.cityId) {
        // Если выбран только город, переходим к выбору категории и точки
        setActiveStep(0);
        console.log('⏭️ Переход на шаг выбора категории (шаг 0)');
      }
    }
  }, []);
  
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
  
  // ✅ Обновленная отправка формы - показываем диалог выбора для незарегистрированных пользователей
  const handleSubmit = async () => {
    // 🔥 НОВАЯ ЛОГИКА АКТИВНА - ВЕРСИЯ 4.07.2025-17:00 🔥
    console.log('🔥 НОВАЯ ЛОГИКА АКТИВНА - ВЕРСИЯ 4.07.2025-17:00 🔥');
    
    // Если пользователь не авторизован, показываем диалог выбора типа бронирования
    if (!isAuthenticated) {
      console.log('👤 Пользователь не авторизован, показываем диалог выбора типа бронирования');
      setBookingTypeChoiceDialogOpen(true);
      return;
    }

    // Если пользователь авторизован, создаем бронирование напрямую
    await createBookingForAuthenticatedUser();
  };

  // Создание бронирования для авторизованного пользователя
  const createBookingForAuthenticatedUser = async () => {
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
      console.log('🚀 Отправляем данные бронирования авторизованного пользователя:', JSON.stringify(bookingData, null, 2));

      const response = await createClientBooking(bookingData).unwrap();

      // Сохраняем данные созданного бронирования
      setCreatedBooking(response);

      // Проверяем, нужно ли предложить добавить автомобиль в профиль
      const carData = prepareCarDataForDialog(formData);
      console.log('🔍 Подготовленные данные автомобиля:', carData);
      console.log('🔍 Список автомобилей клиента:', clientCars);
      
      if (shouldOfferToAddCar(carData, clientCars)) {
        console.log('🚗 Предлагаем добавить автомобиль в профиль:', carData);
        setCarDataForDialog(carData);
        setAddCarDialogOpen(true);
      } else {
        console.log('ℹ️ Автомобиль уже есть в профиле или нет данных для добавления');
        setSuccessDialogOpen(true);
      }

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

  // Создание гостевого бронирования
  const createGuestBooking = async () => {
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
      navigate('/client/bookings');
    } else {
      navigate('/client/auth/login', {
        state: { 
          redirectTo: '/client/bookings',
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

  // Обработчики диалога создания аккаунта
  const handleAccountCreated = (userData: any) => {
    console.log('✅ Аккаунт создан и бронирование привязано:', userData);
    setCreateAccountDialogOpen(false);
    
    // Показываем уведомление об успешном создании аккаунта
    console.log('🔄 Переходим в личный кабинет...');
    
    // Используем window.location.href для принудительной перезагрузки
    // Это гарантирует, что состояние аутентификации будет обновлено
    window.location.href = '/client/bookings?newAccount=true';
  };

  const handleContinueWithoutAccount = () => {
    console.log('ℹ️ Пользователь продолжил без создания аккаунта');
    setCreateAccountDialogOpen(false);
    
    // Перенаправляем на главную
    navigate('/client');
  };

  // Обработчики диалога выбора типа бронирования
  const handleCreateWithAccount = () => {
    console.log('🆕 Пользователь выбрал создание с аккаунтом');
    setBookingTypeChoiceDialogOpen(false);
    setCreateAccountAndBookingDialogOpen(true);
  };

  const handleCreateWithoutAccount = () => {
    console.log('👤 Пользователь выбрал создание без аккаунта');
    setBookingTypeChoiceDialogOpen(false);
    createGuestBooking();
  };

  const handleBookingTypeChoiceClose = () => {
    setBookingTypeChoiceDialogOpen(false);
  };

  // Обработчики диалога создания аккаунта и бронирования
  const handleAccountAndBookingSuccess = (bookingId: number) => {
    console.log('✅ Аккаунт и бронирование созданы, ID бронирования:', bookingId);
    setCreateAccountAndBookingDialogOpen(false);
    
    // Переходим в личный кабинет с информацией о новом аккаунте
    console.log('🔄 Переходим в личный кабинет...');
    navigate('/client/bookings?newAccount=true&bookingId=' + bookingId);
  };

  const handleAccountAndBookingClose = () => {
    setCreateAccountAndBookingDialogOpen(false);
  };
  
  // Обработчики диалога добавления автомобиля в профиль
  const handleAddCarDialogClose = () => {
    setAddCarDialogOpen(false);
    setCarDataForDialog({
      license_plate: '',
      car_brand: '',
      car_model: '',
      car_type_id: undefined,
    });
    // Показываем диалог успеха после закрытия диалога добавления автомобиля
    setSuccessDialogOpen(true);
  };

  const handleCarAdded = (addedCar: any) => {
    console.log('✅ Автомобиль добавлен в профиль:', addedCar);
    setAddCarDialogOpen(false);
    setCarDataForDialog({
      license_plate: '',
      car_brand: '',
      car_model: '',
      car_type_id: undefined,
    });
    refetchClientCars(); // Обновляем список автомобилей клиента
    setSuccessDialogOpen(true); // Показываем модальное окно успеха
  };
  
  // Рендер текущего шага
  const renderCurrentStep = () => {
    const CurrentStepComponent = STEPS[activeStep].component;
    
    // Для шага CarTypeStep передаем дополнительный проп onStepChange
    const additionalProps = STEPS[activeStep].id === 'car-type' 
      ? { onStepChange: setActiveStep }
      : {};
    
    return (
      <CurrentStepComponent
        formData={formData}
        setFormData={setFormData}
        onNext={handleNext}
        onBack={handleBack}
        isValid={isCurrentStepValid}
        {...additionalProps}
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
            ? "Ваше бронирование успешно создано. Вы можете просмотреть его в личном кабинете или вернуться на главную."
            : "Ваше гостевое бронирование успешно создано! Информация о бронировании отправлена на указанный номер телефона."
        }
        primaryButtonText={
          isAuthenticated 
            ? 'Мои бронирования' 
            : 'На главную'
        }
        onPrimaryAction={
          isAuthenticated 
            ? handleGoToProfile 
            : handleGoHome
        }
        secondaryButtonText={isAuthenticated ? 'Возврат на главную' : undefined}
        onSecondaryAction={isAuthenticated ? handleGoHome : undefined}
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

      {/* Диалог создания аккаунта для гостевых бронирований */}
      <CreateAccountDialog
        open={createAccountDialogOpen}
        onClose={() => setCreateAccountDialogOpen(false)}
        bookingData={formData}
        createdBooking={createdBooking}
        onAccountCreated={handleAccountCreated}
        onContinueWithoutAccount={handleContinueWithoutAccount}
      />

      {/* Диалог выбора типа бронирования */}
      <BookingTypeChoiceDialog
        open={bookingTypeChoiceDialogOpen}
        onClose={handleBookingTypeChoiceClose}
        onCreateWithAccount={handleCreateWithAccount}
        onCreateWithoutAccount={handleCreateWithoutAccount}
      />

      {/* Диалог создания аккаунта и бронирования одновременно */}
      <CreateAccountAndBookingDialog
        open={createAccountAndBookingDialogOpen}
        onClose={handleAccountAndBookingClose}
        bookingData={formData}
        onSuccess={handleAccountAndBookingSuccess}
      />

      {/* Диалог добавления автомобиля в профиль */}
      <AddCarToProfileDialog
        open={addCarDialogOpen}
        onClose={handleAddCarDialogClose}
        carData={carDataForDialog}
        onCarAdded={handleCarAdded}
      />
    </ClientLayout>
  );
};

export default NewBookingWithAvailabilityPage;
