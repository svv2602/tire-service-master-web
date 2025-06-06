// components/availability/AvailabilitySelector.tsx
// Главный компонент для выбора доступности

import React, { useState } from 'react';
import { Box, Stack, Typography, useTheme, Paper } from '@mui/material';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { DayDetailsPanel } from './DayDetailsPanel';
import { SIZES } from '../../styles/theme';
import { getCardStyles } from '../../styles/components';

interface AvailabilitySelectorProps {
  servicePointId: string | number;
  selectedDate?: Date;
  selectedTime?: string;
  onDateTimeSelect: (date: Date, time?: string) => void;
  minDuration?: number;
  showDetails?: boolean;
  className?: string;
}

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  servicePointId,
  selectedDate,
  selectedTime,
  onDateTimeSelect,
  minDuration = 60,
  showDetails = true,
  className = ''
}) => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [currentTime, setCurrentTime] = useState<string | undefined>(selectedTime);

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setCurrentTime(undefined); // Сбрасываем время при смене даты
    onDateTimeSelect(date, undefined);
  };

  const handleTimeSelect = (time: string) => {
    setCurrentTime(time);
    onDateTimeSelect(currentDate, time);
  };

  return (
    <Box sx={{ 
      mb: SIZES.spacing.lg,
      className
    }}>
      {/* Календарь для выбора даты */}
      <Box sx={{ mb: SIZES.spacing.md }}>
        <AvailabilityCalendar
          servicePointId={servicePointId}
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          minDate={new Date()}
        />
      </Box>

      {/* Сетка с выбором времени и деталями */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr',
            lg: showDetails ? '2fr 1fr' : '1fr' 
          },
          gap: SIZES.spacing.md,
          mb: SIZES.spacing.md
        }}
      >
        {/* Выбор временных слотов */}
        <Box>
          <TimeSlotPicker
            servicePointId={servicePointId}
            selectedDate={currentDate}
            selectedTime={currentTime}
            onTimeSelect={handleTimeSelect}
            minDuration={minDuration}
          />
        </Box>

        {/* Панель с деталями дня */}
        {showDetails && (
          <Box>
            <DayDetailsPanel
              servicePointId={servicePointId}
              selectedDate={currentDate}
            />
          </Box>
        )}
      </Box>

      {/* Итоговая информация о выборе */}
      {currentTime && (
        <Paper 
          sx={{ 
            ...cardStyles, 
            p: SIZES.spacing.md,
            bgcolor: `${theme.palette.primary.main}10`,
            borderColor: `${theme.palette.primary.main}30`,
            borderRadius: SIZES.borderRadius.md,
          }}
          variant="outlined"
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: SIZES.spacing.sm 
          }}>
            <Box 
              component="svg" 
              sx={{ 
                width: 20,
                height: 20,
                color: theme.palette.primary.main
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </Box>
            <Typography sx={{ color: theme.palette.primary.dark }}>
              <Box component="span" sx={{ fontWeight: 500 }}>
                Выбранное время:
              </Box>{' '}
              {currentDate.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} в {currentTime}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}; 