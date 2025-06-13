import React, { useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { ru } from 'date-fns/locale';
import { addDays, isSameDay, isAfter, isBefore } from 'date-fns';

interface AvailabilityCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  isLoading?: boolean;
  disabledDays?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selectedDate,
  onDateChange,
  isLoading = false,
  disabledDays = [],
  minDate = new Date(),
  maxDate,
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // По умолчанию максимальная дата - 30 дней вперед
  const defaultMaxDate = maxDate || addDays(new Date(), 30);
  
  // Проверка, является ли день выходным
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0; // Воскресенье - выходной
  };
  
  // Проверка, является ли день отключенным
  const isDisabledDay = (date: Date) => {
    return disabledDays.some(disabledDate => isSameDay(date, disabledDate));
  };
  
  // Обработчик изменения даты
  const handleDateChange = (date: Date | null) => {
    if (date && !isWeekend(date) && !isDisabledDay(date)) {
      onDateChange(date);
    }
  };
  
  // Функция для определения, должен ли день быть отключен
  const shouldDisableDate = (date: Date) => {
    return (
      isWeekend(date) || 
      isDisabledDay(date) || 
      isBefore(date, minDate) || 
      isAfter(date, defaultMaxDate)
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarIcon sx={{ mr: 1, color: colors.primary }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Выберите дату
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={320} />
      ) : (
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          minDate={minDate}
          maxDate={defaultMaxDate}
          sx={{
            width: '100%',
            '& .MuiPickersDay-root': {
              fontSize: '0.875rem',
              margin: '2px',
            },
            '& .MuiPickersDay-root.Mui-selected': {
              backgroundColor: colors.primary,
              color: 'white',
              '&:hover': {
                backgroundColor: colors.primary,
              },
            },
            '& .MuiPickersDay-root.Mui-disabled': {
              color: colors.textSecondary,
              textDecoration: 'line-through',
              opacity: 0.6,
            },
            '& .MuiPickersDay-today': {
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              '&:not(.Mui-selected)': {
                border: `1px solid ${colors.primary}`,
              },
            },
          }}
        />
      )}

      {selectedDate && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: colors.textPrimary }}>
            Выбрана дата: {selectedDate.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric',
              weekday: 'long'
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AvailabilityCalendar; 