import React from 'react';
import { Paper, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';
import { Booking, BookingStatusEnum } from '../../types/booking';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface BookingStatusProps {
  booking: Booking;
}

const BookingStatus: React.FC<BookingStatusProps> = ({ booking }) => {
  const { t } = useTranslation();

  // Определение активного шага на основе статуса
  const getActiveStep = (status: BookingStatusEnum) => {
    switch (status) {
      case BookingStatusEnum.PENDING:
        return 0;
      case BookingStatusEnum.COMPLETED:
        return 2;
      case BookingStatusEnum.CANCELLED:
        return -1; // Особый случай для отмененных записей
      default:
        return 0;
    }
  };

  // Форматирование даты
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  // Получение активного шага
  const activeStep = getActiveStep(booking.status);

  // Шаги процесса
  const steps = [
    t('Запись создана'),
    t('Ожидает обслуживания'),
    t('Обслуживание завершено')
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('Статус записи')}
      </Typography>

      {booking.status === BookingStatusEnum.CANCELLED ? (
        <Box mt={2}>
          <Typography variant="body1" color="error" gutterBottom>
            {t('Запись отменена')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Дата отмены')}: {formatDateTime(booking.updated_at)}
          </Typography>
        </Box>
      ) : (
        <>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('Запись создана')}: {formatDateTime(booking.created_at)}
            </Typography>
            
            {booking.status === BookingStatusEnum.COMPLETED && (
              <Typography variant="body2" color="text.secondary">
                {t('Обслуживание завершено')}: {formatDateTime(booking.updated_at)}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default BookingStatus; 