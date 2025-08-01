import React, { useState, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../styles';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { ru } from 'date-fns/locale';
import { addDays, isSameDay, isAfter, isBefore, format } from 'date-fns';
import { useCheckDayAvailabilityQuery } from '../../api/availability.api';

interface AvailabilityCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  isLoading?: boolean;
  disabledDays?: Date[];
  minDate?: Date;
  maxDate?: Date;
  servicePointId?: number;
  categoryId?: number;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selectedDate,
  onDateChange,
  isLoading = false,
  disabledDays = [],
  minDate = new Date(),
  maxDate,
  servicePointId,
  categoryId,
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  // По умолчанию максимальная дата - 30 дней вперед
  const defaultMaxDate = maxDate || addDays(new Date(), 30);
  
  // Состояние для кэширования результатов проверки доступности
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, boolean>>({});
  
  // Проверка, является ли день отключенным вручную
  const isDisabledDay = (date: Date) => {
    return disabledDays.some(disabledDate => isSameDay(date, disabledDate));
  };
  
  // Функция для проверки доступности дня через API
  const checkDateAvailability = async (date: Date): Promise<boolean> => {
    if (!servicePointId) return true; // Если нет servicePointId, разрешаем все дни кроме воскресений
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const cacheKey = `${servicePointId}-${dateStr}-${categoryId || 'all'}`;
    
    // Проверяем кэш
    if (availabilityCache[cacheKey] !== undefined) {
      return availabilityCache[cacheKey];
    }
    
    try {
      // Здесь мы не можем использовать хук внутри функции, 
      // поэтому используем fetch напрямую
      const response = await fetch(
        `/api/v1/service_points/${servicePointId}/availability/${dateStr}/check${categoryId ? `?category_id=${categoryId}` : ''}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const isAvailable = data.is_available || false;
        
        // Кэшируем результат
        setAvailabilityCache(prev => ({
          ...prev,
          [cacheKey]: isAvailable
        }));
        
        return isAvailable;
      }
    } catch (error) {
      console.warn('Ошибка проверки доступности дня:', error);
    }
    
    // В случае ошибки, возвращаем false для безопасности
    return false;
  };
  
  // Функция для определения, должен ли день быть отключен
  const shouldDisableDate = (date: Date) => {
    // Базовые проверки диапазона дат
    if (isBefore(date, minDate) || isAfter(date, defaultMaxDate)) {
      return true;
    }
    
    // Проверка вручную отключенных дней
    if (isDisabledDay(date)) {
      return true;
    }
    
    // Если нет servicePointId, блокируем только воскресенья (старое поведение)
    if (!servicePointId) {
      return date.getDay() === 0; // Воскресенье
    }
    
    // Для дней с servicePointId НЕ блокируем дни по умолчанию
    // Позволяем пользователю выбрать любую дату в разрешенном диапазоне
    // Информация о доступности будет показана после выбора
    return false;
  };

  // Обработчик изменения даты с проверкой доступности
  const handleDateChange = async (date: Date | null) => {
    if (!date || shouldDisableDate(date)) {
      return;
    }
    
    // Всегда позволяем выбрать дату, даже если она недоступна
    // Информация о недоступности будет показана в DayDetailsPanel
    onDateChange(date);
    
    // Если есть servicePointId, проверяем доступность через API для кэширования
    if (servicePointId) {
      await checkDateAvailability(date);
    }
  };

  return (
    <Box>
      {/* Удаляем внутренний заголовок */}
      {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarIcon sx={{ mr: 1, color: colors.primary }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
          Выберите дату
        </Typography>
      </Box> */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={320} />
      ) : (
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          minDate={minDate}
          maxDate={defaultMaxDate}
          // Принудительно убираем выделение даты по умолчанию
          defaultValue={null}
          // Отключаем автоматическое выделение текущей даты
          views={['day']}
          openTo="day"
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
            // Стили для выбранного дня - только когда selectedDate не null
            ...(selectedDate && {
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
            }),
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
              border: `1px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
              fontWeight: 600,
              backgroundColor: 'transparent',
              color: colors.textPrimary,
              
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
                color: colors.textPrimary,
              },
              
              // Убираем автоматическое выделение для сегодняшнего дня
              // Сегодняшний день будет только обведен рамкой, но не выделен синим
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