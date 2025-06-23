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
import ClientNavigation from '../../components/client/ClientNavigation';
import { 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Импорт компонентов UI
import { Stepper } from '../../components/ui/Stepper';

// Импорт шагов формы
import {
  CityServicePointStep,
  DateTimeStep,
  ClientInfoStep,
  CarTypeStep,
  ServicesStep,
  ReviewStep,
} from './components';

// Импорт API хуков
// import { useCreateClientBookingMutation } from '../../api/clientBookings.api';

// Импорт стилей
import { getCardStyles } from '../../styles/components';
import { getThemeColors, getButtonStyles } from '../../styles';

// Типы для данных формы
export interface BookingFormData {
  // Шаг 1: Город и точка обслуживания
  city_id: number | null;
  service_point_id: number | null;
  
  // Шаг 2: Дата и время
  booking_date: string;
  start_time: string;
  
  // Шаг 3: Информация о клиенте
  client_name: string;
  client_phone: string;
  client_email: string;
  
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
  city_id: null,
  service_point_id: null,
  booking_date: '',
  start_time: '',
  client_name: '',
  client_phone: '',
  client_email: '',
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
    }
    
    // Обновляем данные формы
    setFormData(newFormData);
    
    // Если пользователь аутентифицирован, предзаполняем его данные
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        client_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        client_phone: user.phone || '',
        client_email: user.email || '',
      }));
    }
  }, [location.search, location.state, isAuthenticated, user]);
  
  // Мутация для создания бронирования (временно отключена)
  // const [createBooking] = useCreateClientBookingMutation();
  
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
  
  // Проверка валидности текущего шага
  const isCurrentStepValid = useMemo(() => {
    switch (activeStep) {
      case 0: // Город и точка обслуживания
        return !!(formData.city_id && formData.service_point_id);
      case 1: // Дата и время
        return !!(formData.booking_date && formData.start_time);
      case 2: // Информация о клиенте
        return !!(formData.client_name && formData.client_phone);
      case 3: // Тип автомобиля
        return !!(formData.car_type_id && formData.license_plate);
      case 4: // Услуги (опционально)
        return true;
      case 5: // Подтверждение
        return true;
      default:
        return false;
    }
  }, [activeStep, formData]);
  
  // Обработка отправки формы
  const handleSubmit = async () => {
    if (!isCurrentStepValid) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Подготавливаем данные для API
      const bookingData = {
        client: {
          first_name: formData.client_name.split(' ')[0] || '',
          last_name: formData.client_name.split(' ').slice(1).join(' ') || '',
          phone: formData.client_phone,
          email: formData.client_email,
        },
        car: {
          license_plate: formData.license_plate,
          car_brand: formData.car_brand,
          car_model: formData.car_model,
        },
        booking: {
          service_point_id: formData.service_point_id,
          booking_date: formData.booking_date,
          start_time: formData.start_time,
          notes: formData.notes,
        },
        services: formData.services,
      };
      
      // Временно - показываем успешное сообщение вместо реального API вызова
      console.log('Booking data would be sent:', bookingData);
      
      // Имитируем успешное создание
      setTimeout(() => {
        alert('Бронирование успешно создано! (демо версия)');
        navigate('/client/bookings', { replace: true });
      }, 1000);
      
      // TODO: Раскомментировать когда API будет готов
      // const result = await createBooking(bookingData).unwrap();
      // navigate(`/client/booking-success/${result.id}`, {
      //   replace: true,
      //   state: { bookingData: result }
      // });
      
    } catch (error: any) {
      console.error('Ошибка создания бронирования:', error);
      setSubmitError(
        error.data?.message || 
        error.message || 
        'Произошла ошибка при создании бронирования'
      );
    } finally {
      setIsSubmitting(false);
    }
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
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />
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
    </Box>
  );
};

export default NewBookingWithAvailabilityPage;
