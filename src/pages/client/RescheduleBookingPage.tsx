import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, CircularProgress,
  Alert, Stepper, Step, StepLabel, StepContent, Divider
} from '@mui/material';
import { useGetBookingByIdQuery, useUpdateBookingMutation } from '../../api/bookings.api';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AvailabilitySelector from '../../components/availability/AvailabilitySelector';
import TimeSlotPicker from '../../components/availability/TimeSlotPicker';
import { BookingFormData } from '../../types/booking';

const RescheduleBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start_time: string;
    end_time: string;
  } | null>(null);

  // Запрос на получение данных о записи
  const { data: booking, isLoading: isLoadingBooking, isError: isErrorBooking } = useGetBookingByIdQuery(id || '');
  
  // Мутация для обновления записи
  const [updateBooking, { isLoading: isUpdating, isError: isUpdateError }] = useUpdateBookingMutation();

  // Обработчик возврата к списку записей
  const handleBack = () => {
    navigate(`/client/bookings/${id}`);
  };

  // Обработчик выбора даты
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setActiveStep(1);
  };

  // Обработчик выбора времени
  const handleTimeSlotSelect = (slot: { start_time: string; end_time: string }) => {
    setSelectedTimeSlot(slot);
    setActiveStep(2);
  };

  // Обработчик переноса записи
  const handleReschedule = async () => {
    if (!booking || !selectedDate || !selectedTimeSlot) return;

    try {
      const updateData: Partial<BookingFormData> = {
        booking_date: selectedDate,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
      };

      await updateBooking({ id: id || '', booking: updateData }).unwrap();
      navigate(`/client/bookings/${id}?reschedule_success=true`);
    } catch (error) {
      console.error('Ошибка при переносе записи:', error);
    }
  };

  if (isLoadingBooking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isErrorBooking || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('Ошибка при загрузке данных о записи')}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          {t('Вернуться к записи')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3} display="flex" alignItems="center">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          {t('Назад')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('Перенос записи')}
        </Typography>
      </Box>

      {isUpdateError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('Ошибка при переносе записи. Пожалуйста, попробуйте еще раз.')}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('Текущая запись')}
        </Typography>
        
        <Box mt={2} mb={4}>
          <Typography variant="body1" gutterBottom>
            <strong>{t('Дата')}:</strong> {booking.booking_date}
          </Typography>
          <Typography variant="body1">
            <strong>{t('Время')}:</strong> {booking.start_time} - {booking.end_time}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {t('Выберите новую дату и время')}
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 3 }}>
          <Step>
            <StepLabel>{t('Выберите дату')}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <AvailabilitySelector
                  servicePointId={booking.service_point_id}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>{t('Выберите время')}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {selectedDate && (
                  <TimeSlotPicker
                    servicePointId={booking.service_point_id}
                    date={selectedDate}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    selectedTimeSlot={selectedTimeSlot}
                  />
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {t('Назад')}
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>{t('Подтверждение')}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  {t('Вы выбрали следующую дату и время:')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t('Дата')}:</strong> {selectedDate}
                </Typography>
                {selectedTimeSlot && (
                  <Typography variant="body1" gutterBottom>
                    <strong>{t('Время')}:</strong> {selectedTimeSlot.start_time} - {selectedTimeSlot.end_time}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleReschedule}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={isUpdating}
                >
                  {isUpdating ? <CircularProgress size={24} /> : t('Подтвердить перенос')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {t('Назад')}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Container>
  );
};

export default RescheduleBookingPage; 