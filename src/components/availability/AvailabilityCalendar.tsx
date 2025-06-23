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
              color: colors.textPrimary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
                color: colors.textPrimary,
              },
            },
            '& .MuiPickersDay-root.Mui-selected': {
              backgroundColor: theme.palette.mode === 'dark' ? '#2196F3' : '#1976D2',
              color: '#ffffff',
              fontWeight: 700,
              border: `2px solid ${theme.palette.mode === 'dark' ? '#42A5F5' : '#1565C0'}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 0 0 2px rgba(33, 150, 243, 0.3), 0 4px 12px rgba(33, 150, 243, 0.4)' 
                : '0 0 0 2px rgba(25, 118, 210, 0.3), 0 4px 12px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#42A5F5' : '#1565C0',
                color: '#ffffff',
                transform: 'scale(1.05)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 0 0 3px rgba(66, 165, 245, 0.4), 0 6px 16px rgba(66, 165, 245, 0.5)' 
                  : '0 0 0 3px rgba(21, 101, 192, 0.4), 0 6px 16px rgba(21, 101, 192, 0.5)',
              },
            },
            '& .MuiPickersDay-root.Mui-disabled': {
              color: colors.textSecondary,
              textDecoration: 'line-through',
              opacity: 0.6,
              '&:hover': {
                backgroundColor: 'transparent',
                color: colors.textSecondary,
              },
            },
            '& .MuiPickersDay-today': {
              border: `3px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(0, 0, 0, 0.08)',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              fontWeight: 700,
              position: 'relative',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 0 0 1px rgba(255, 255, 255, 0.3)' 
                : '0 0 0 1px rgba(0, 0, 0, 0.2)',
              '&:not(.Mui-selected)': {
                border: `3px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(0, 0, 0, 0.08)',
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(0, 0, 0, 0.15)',
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  transform: 'scale(1.1)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 12px rgba(255, 255, 255, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.5)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(0, 0, 0, 0.3)',
                  border: `3px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
                },
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                border: `3px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                  transform: 'scale(1.05)',
                },
              },
            },
          }}
        />
      )}


    </Box>
  );
};

export default AvailabilityCalendar; 