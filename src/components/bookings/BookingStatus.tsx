import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Booking, BOOKING_STATUSES, BookingStatusKey } from '../../types/booking';
import { getStatusDisplayName, convertStatusToKey } from '../../utils/bookingStatus';

interface BookingStatusProps {
  booking: Booking;
}

// Функция для определения активного шага
const getActiveStep = (status: string): number => {
  const statusKey = convertStatusToKey(status);
  
  switch (statusKey) {
    case BOOKING_STATUSES.PENDING:
      return 0;
    case BOOKING_STATUSES.CONFIRMED:
      return 1;
    case BOOKING_STATUSES.IN_PROGRESS:
      return 2;
    case BOOKING_STATUSES.COMPLETED:
      return 3;
    case BOOKING_STATUSES.CANCELLED_BY_CLIENT:
    case BOOKING_STATUSES.CANCELLED_BY_PARTNER:
    case BOOKING_STATUSES.NO_SHOW:
      return -1; // Особый случай для отмененных записей
    default:
      return 0;
  }
};

export const BookingStatus: React.FC<BookingStatusProps> = ({ booking }) => {
  const { t } = useTranslation('components');

  // Получение активного шага
  const activeStep = getActiveStep(booking.status);

  // Шаги процесса
  const steps = [
    t('bookingStatus.steps.pending'),
    t('bookingStatus.steps.confirmed'),
    t('bookingStatus.steps.inProgress'),
    t('bookingStatus.steps.completed')
  ];

  const statusKey = convertStatusToKey(booking.status);
  const isCancelled = statusKey === BOOKING_STATUSES.CANCELLED_BY_CLIENT || 
                      statusKey === BOOKING_STATUSES.CANCELLED_BY_PARTNER || 
                      statusKey === BOOKING_STATUSES.NO_SHOW;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('bookingStatus.title')}
      </Typography>

      {isCancelled ? (
        <Box mt={2}>
          <Typography variant="body1" color="error" gutterBottom>
            {t('bookingStatus.cancelled')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getStatusDisplayName(booking.status)}
          </Typography>
        </Box>
      ) : (
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
    </Box>
  );
}; 