import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ru } from 'date-fns/locale';

interface AvailabilityCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  isLoading?: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selectedDate,
  onDateChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите дату
        </Typography>
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выберите дату
      </Typography>
      <DateCalendar
        value={selectedDate}
        onChange={(newDate) => onDateChange(newDate)}
        disablePast
        sx={{
          width: '100%',
          '& .MuiPickersDay-root': {
            fontSize: '0.875rem',
          },
        }}
      />
    </Box>
  );
};

export default AvailabilityCalendar; 