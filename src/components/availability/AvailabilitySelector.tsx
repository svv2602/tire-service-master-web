import React from 'react';
import { Box, Paper } from '@mui/material';
import { TimeSlotPicker } from './TimeSlotPicker';
import { DayDetailsPanel } from './DayDetailsPanel';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { useGetDayDetailsQuery } from '../../api/availability.api';
import type { AvailableTimeSlot } from '../../types/availability';

interface AvailabilitySelectorProps {
  servicePointId?: number;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null, slotData?: AvailableTimeSlot) => void;
  availableTimeSlots: AvailableTimeSlot[];
  isLoading?: boolean;
  servicePointPhone?: string;
  categoryId?: number; // Добавляем categoryId для фильтрации по категории услуг
  totalSlotsForDay?: number; // Добавляем общее количество слотов для правильного отображения загруженности
}

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  servicePointId,
  selectedDate,
  onDateChange,
  selectedTimeSlot,
  onTimeSlotChange,
  availableTimeSlots,
  isLoading = false,
  servicePointPhone,
  categoryId,
  totalSlotsForDay,
}) => {
  const theme = useTheme();

  // Загрузка детальной информации о дне с учетом категории
  const { data: dayDetailsData, isLoading: isLoadingDayDetails, error: dayDetailsError } = useGetDayDetailsQuery(
    {
      servicePointId: servicePointId?.toString() || '0',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      categoryId: categoryId
    },
    { skip: !servicePointId || !selectedDate }
  );

  // Отладочная информация для запроса деталей дня (только в development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDate && servicePointId) {
      const requestParams = {
        servicePointId: servicePointId?.toString() || '0',
        date: format(selectedDate, 'yyyy-MM-dd'),
        categoryId: categoryId
      };
      console.log('🔍 Параметры запроса getDayDetails:', requestParams);
      console.log('🔍 Ошибка getDayDetails:', dayDetailsError);
      console.log('🔍 Состояние загрузки getDayDetails:', isLoadingDayDetails);
      console.log('🔍 Результат getDayDetails:', dayDetailsData);
      console.log('🔍 Skip условие:', !servicePointId || !selectedDate);
    }
  }, [selectedDate, servicePointId, categoryId, dayDetailsData, dayDetailsError, isLoadingDayDetails]);

  // Подсчет загруженности по слотам/записям, а не по постам
  const dayStats = React.useMemo(() => {
    if (!selectedDate) {
      return {
        totalSlots: 0,
        availableSlots: 0,
        occupiedSlots: 0,
        occupancyPercentage: 0
      };
    }

    // Отладочная информация (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 AvailabilitySelector dayDetailsData:', dayDetailsData);
      console.log('🔍 AvailabilitySelector dayDetailsData?.summary:', dayDetailsData?.summary);
      console.log('🔍 AvailabilitySelector categoryId:', categoryId);
    }

    // Используем данные из API day_details для правильного подсчета
    if (dayDetailsData?.summary) {
      const totalSlots = dayDetailsData.summary.total_slots || 0;
      const occupiedSlots = dayDetailsData.summary.occupied_slots || 0;
      const availableSlots = totalSlots - occupiedSlots; // Правильная формула: всего - занято = свободно
      const occupancyPercentage = dayDetailsData.summary.occupancy_percentage || 0;

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AvailabilitySelector используем данные из API:', { 
          totalSlots, 
          occupiedSlots, 
          availableSlots, 
          occupancyPercentage,
          apiAvailableSlots: dayDetailsData.summary.available_slots // для сравнения
        });
      }

      return {
        totalSlots,
        availableSlots,
        occupiedSlots,
        occupancyPercentage
      };
    }

    // Fallback: если нет данных из API
    const availableSlots = availableTimeSlots.length;
    const totalSlots = totalSlotsForDay || availableSlots;
    const occupiedSlots = Math.max(0, totalSlots - availableSlots);
    const occupancyPercentage = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ AvailabilitySelector fallback логика:', { 
        availableSlots, 
        totalSlots, 
        occupiedSlots, 
        occupancyPercentage 
      });
    }

    return {
      totalSlots,
      availableSlots,
      occupiedSlots,
      occupancyPercentage
    };
  }, [selectedDate, availableTimeSlots, dayDetailsData, totalSlotsForDay]);

  // Отладочная информация для передачи данных в DayDetailsPanel
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDate) {
      console.log('🔍 Передача данных в DayDetailsPanel:', {
        totalPosts: dayStats.totalSlots,
        availablePosts: dayStats.totalSlots - dayStats.occupiedSlots,
        occupiedSlots: dayStats.occupiedSlots,
        dayStats: dayStats
      });
    }
  }, [dayStats, selectedDate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Верхняя строка: календарь и информация */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper 
          sx={{ 
            flex: '1 1 300px',
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[1]
          }}
        >
          <AvailabilityCalendar
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            isLoading={isLoading}
            servicePointId={servicePointId}
            categoryId={categoryId}
          />
        </Paper>

        <Paper 
          sx={{ 
            flex: '1 1 300px',
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[1]
          }}
        >
          <DayDetailsPanel
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            isLoading={isLoading || isLoadingDayDetails}
            occupancyPercentage={dayStats.occupancyPercentage}
            totalPosts={dayStats.totalSlots}
            availablePosts={dayStats.totalSlots - dayStats.occupiedSlots}
            servicePointPhone={servicePointPhone}
            isWorking={dayDetailsData?.is_working}
            workingMessage={dayDetailsData?.message}
            scheduleInfo={dayDetailsData?.schedule_info}
          />
        </Paper>
      </Box>

      {/* Нижняя строка: выбор времени на всю ширину */}
      <Paper 
        sx={{ 
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[1]
        }}
      >
        <TimeSlotPicker
          selectedTimeSlot={selectedTimeSlot}
          onTimeSlotChange={onTimeSlotChange}
          availableTimeSlots={availableTimeSlots}
          isLoading={isLoading}
        />
      </Paper>
    </Box>
  );
};

export default AvailabilitySelector; 