import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Breadcrumbs, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import ClientNavigation from '../../components/client/ClientNavigation';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon, 
  BookOnline as BookIcon,
  DirectionsCar as CarIcon,
  Event as EventIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getButtonStyles, getThemeColors } from '../../styles';
import { useTheme } from '@mui/material';
import { AvailabilitySelector } from '../../components/availability';
import type { AvailableTimeSlot } from '../../types/availability';
import { useGetAvailableTimesQuery, useCheckTimeAvailabilityMutation } from '../../api/availability.api';
import { useCreateBookingMutation } from '../../api/bookings.api';
import CarInfoForm from '../../components/booking/CarInfoForm';
import ClientInfoForm from '../../components/booking/ClientInfoForm';
import BookingSummary from '../../components/booking/BookingSummary';
import { format } from 'date-fns';

// Шаги процесса бронирования
const steps = [
  { label: 'Автомобиль', icon: <CarIcon /> },
  { label: 'Дата и время', icon: <EventIcon /> },
  { label: 'Данные клиента', icon: <PersonIcon /> },
  { label: 'Подтверждение', icon: <CheckCircleIcon /> }
];

const ClientBookingPage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Получаем ID сервисной точки из параметров URL
  const searchParams = new URLSearchParams(location.search);
  const servicePointId = searchParams.get('servicePointId');
  
  // Состояние формы бронирования
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [carInfo, setCarInfo] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    carTypeId: 1 // Значение по умолчанию
  });
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    receive_notifications: true
  });
  const [services] = useState([
    { service_id: 1, quantity: 1, price: 1000 } // Пример услуги
  ]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Запрашиваем доступные временные слоты при выборе даты
  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetAvailableTimesQuery(
    { servicePointId: servicePointId || '0', params: { date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '' } },
    { skip: !selectedDate || !servicePointId }
  );
  
  // Мутация для проверки доступности времени
  const [checkAvailability, { isLoading: isCheckingAvailability }] = useCheckTimeAvailabilityMutation();
  
  // Мутация для создания бронирования
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  
  // Обновляем доступные слоты при изменении данных доступности
  useEffect(() => {
    if (availabilityData?.available_times) {
      const slots = availabilityData.available_times
        .filter(slot => slot.can_book);
      setAvailableTimeSlots(slots);
    }
  }, [availabilityData]);
  
  // Обработчики для шагов формы
  const handleNext = async () => {
    if (activeStep === 1 && selectedDate && selectedTimeSlot) {
      try {
        // Проверяем доступность выбранного времени
        const result = await checkAvailability({
          servicePointId: servicePointId || '0',
          params: {
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTimeSlot,
            duration_minutes: 60 // Предполагаемая длительность услуги
          }
        }).unwrap();
        
        if (!result.available) {
          setBookingError(`Выбранное время недоступно: ${result.message || 'Пожалуйста, выберите другое время'}`);
          return;
        }
        setBookingError(null);
      } catch (error) {
        setBookingError('Ошибка при проверке доступности. Пожалуйста, попробуйте еще раз.');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !servicePointId) {
      setBookingError('Не все обязательные поля заполнены');
      return;
    }
    
    try {
      // Формируем данные для бронирования
      const bookingData = {
        service_point_id: Number(servicePointId),
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTimeSlot,
        end_time: '', // Будет рассчитано на сервере
        client_id: 0, // Будет создан или найден на сервере
        car_id: 0, // Будет создан на сервере
        car_type_id: carInfo.carTypeId,
        services: services,
        notes: clientInfo.notes
      };
      
      // Данные клиента
      const clientData = {
        name: clientInfo.name,
        phone: clientInfo.phone,
        email: clientInfo.email
      };
      
      // Данные автомобиля
      const carData = {
        brand: carInfo.brand,
        model: carInfo.model,
        year: carInfo.year,
        license_plate: carInfo.licensePlate
      };
      
      // Создаем бронирование
      const response = await createBooking({
        booking: bookingData,
        client: clientData,
        car: carData
      }).unwrap();
      
      // Переходим на страницу успешного бронирования
      navigate(`/client/booking/success?bookingId=${response.id}`);
    } catch (error: any) {
      setBookingError(error.data?.error || 'Не удалось создать запись. Пожалуйста, проверьте данные и попробуйте снова.');
    }
  };
  
  // Рендер содержимого текущего шага
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <CarInfoForm 
            carInfo={carInfo} 
            setCarInfo={setCarInfo} 
          />
        );
      case 1:
        return (
          <AvailabilitySelector
            servicePointId={servicePointId ? parseInt(servicePointId) : undefined}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            availableTimeSlots={availableTimeSlots}
            isLoading={isLoadingAvailability}
          />
        );
      case 2:
        return (
          <ClientInfoForm
            clientInfo={clientInfo}
            setClientInfo={setClientInfo}
            isAuthenticated={isAuthenticated}
          />
        );
      case 3:
        return (
          <BookingSummary
            servicePointId={servicePointId || ''}
            carInfo={carInfo}
            clientInfo={clientInfo}
            bookingDate={selectedDate}
            bookingTime={selectedTimeSlot}
            services={services}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>Запись на услугу</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: colors.textPrimary, textAlign: 'center' }}>
            <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Онлайн запись
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={() => (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: activeStep >= index ? colors.primary : colors.backgroundSecondary,
                    color: activeStep >= index ? 'white' : colors.textSecondary
                  }}>
                    {step.icon}
                  </Box>
                )}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {bookingError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {bookingError}
            </Alert>
          )}
          
          {renderStepContent()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
              sx={secondaryButtonStyles}
              disabled={isCreatingBooking || isCheckingAvailability}
            >
              {activeStep === 0 ? 'Назад к выбору сервиса' : 'Назад'}
            </Button>
            
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              sx={primaryButtonStyles}
              disabled={
                (activeStep === 0 && (!carInfo.brand || !carInfo.model || !carInfo.licensePlate)) ||
                (activeStep === 1 && (!selectedDate || !selectedTimeSlot)) ||
                (activeStep === 2 && (!clientInfo.name || !clientInfo.phone)) ||
                isCreatingBooking || 
                isCheckingAvailability
              }
            >
              {activeStep === steps.length - 1 ? (
                isCreatingBooking ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Подтвердить запись'
                )
              ) : (
                isCheckingAvailability && activeStep === 1 ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Далее'
                )
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ClientBookingPage; 