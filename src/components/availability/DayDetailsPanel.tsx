import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DayDetailsPanelProps {
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  isLoading?: boolean;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  selectedTimeSlot,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Детали записи
        </Typography>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    );
  }

  if (!selectedDate || !selectedTimeSlot) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Детали записи
        </Typography>
        <Typography color="text.secondary">
          Выберите дату и время для просмотра деталей
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Детали записи
      </Typography>
      <Typography>
        Дата: {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
      </Typography>
      <Typography>
        Время: {selectedTimeSlot}
      </Typography>
    </Box>
  );
};

export default DayDetailsPanel; 