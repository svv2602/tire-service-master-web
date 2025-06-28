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
}) => {
  const theme = useTheme();

  // Загрузка детальной информации о дне с учетом категории
  const { data: dayDetailsData, isLoading: isLoadingDayDetails } = useGetDayDetailsQuery(
    {
      servicePointId: servicePointId?.toString() || '0',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      categoryId: categoryId
    },
    { skip: !servicePointId || !selectedDate }
  );

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

    // Если нет данных о дне или слотах, получаем из API данных
    if (dayDetailsData?.summary) {
      const totalSlots = dayDetailsData.summary.total_slots || 0;
      const availableSlots = dayDetailsData.summary.available_slots || 0;
      const occupiedSlots = dayDetailsData.summary.occupied_slots || 0;
      const occupancyPercentage = dayDetailsData.summary.occupancy_percentage || 0;

      return {
        totalSlots,
        availableSlots,
        occupiedSlots,
        occupancyPercentage
      };
    }

    // Если нет данных из API, считаем по доступным слотам
    const availableSlots = availableTimeSlots.length;
    // Примерная оценка общего количества слотов (это нужно будет подправить когда API вернет полные данные)
    const totalSlots = availableSlots > 0 ? Math.max(availableSlots * 2, 48) : 48; // примерно 48 слотов в день (30 мин интервалы)
    const occupiedSlots = totalSlots - availableSlots;
    const occupancyPercentage = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    return {
      totalSlots,
      availableSlots,
      occupiedSlots,
      occupancyPercentage
    };
  }, [selectedDate, availableTimeSlots, dayDetailsData]);

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
            availablePosts={dayStats.availableSlots}
            servicePointPhone={servicePointPhone}
            isWorking={dayDetailsData?.is_working}
            workingMessage={dayDetailsData?.message}
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