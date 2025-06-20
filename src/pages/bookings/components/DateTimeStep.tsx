// Шаг 2: Выбор даты и времени

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  FormHelperText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// Импорт компонентов доступности
import { AvailabilitySelector } from '../../../components/availability';

// Импорт API хуков
import { useGetAvailableTimesQuery } from '../../../api/availability.api';
import { useGetServicePointBasicInfoQuery } from '../../../api/servicePoints.api';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface DateTimeStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Инициализация состояния из formData
  useEffect(() => {
    if (formData.booking_date) {
      try {
        const date = parseISO(formData.booking_date);
        setSelectedDate(date);
      } catch (error) {
        console.error('Ошибка парсинга даты:', error);
      }
    } else {
      // Если дата не выбрана, устанавливаем завтра по умолчанию
      const tomorrow = addDays(new Date(), 1);
      setSelectedDate(tomorrow);
      setFormData(prev => ({
        ...prev,
        booking_date: format(tomorrow, 'yyyy-MM-dd'),
      }));
    }
    
    if (formData.start_time) {
      setSelectedTimeSlot(formData.start_time);
    }
  }, [formData.booking_date, formData.start_time, setFormData]);
  
  // Загрузка доступных временных слотов
  const { data: availabilityData, isLoading: isLoadingAvailability, error: availabilityError } = useGetAvailableTimesQuery(
    {
      servicePointId: formData.service_point_id?.toString() || '0',
      params: { date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '' }
    },
    { skip: !formData.service_point_id || !selectedDate }
  );
  
  // Получаем доступные временные слоты
  const availableTimeSlots = useMemo(() => {
    return (availabilityData?.available_times || [])
      .filter(slot => slot.can_book);
  }, [availabilityData]);
  
  // Обработчик изменения даты
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Сбрасываем время при изменении даты
    
    setFormData(prev => ({
      ...prev,
      booking_date: date ? format(date, 'yyyy-MM-dd') : '',
      start_time: '',
    }));
  };
  
  // Загрузка информации о точке обслуживания
  const { data: servicePointData, isLoading: isLoadingServicePoint } = useGetServicePointBasicInfoQuery(
    formData.service_point_id?.toString() || '0',
    { skip: !formData.service_point_id }
  );
  
  // Обработчик изменения времени
  const handleTimeSlotChange = (timeSlot: string | null) => {
    setSelectedTimeSlot(timeSlot);
    
    setFormData(prev => ({
      ...prev,
      start_time: timeSlot || '',
    }));
  };

  // Проверяем, является ли выбранная дата сегодняшним днем
  
  if (!formData.service_point_id) {
    return (
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Выберите дату и время
        </Typography>
        <Alert severity="warning">
          Сначала необходимо выбрать точку обслуживания на предыдущем шаге.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Выберите дату и время
      </Typography>
      
      {/* Информация о выбранной точке обслуживания */}
      <Paper sx={{ ...getCardStyles(theme), p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <LocationIcon sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isLoadingServicePoint ? 'Загрузка...' : (servicePointData?.name || `Точка обслуживания #${formData.service_point_id}`)}
            </Typography>
            {servicePointData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {servicePointData.city?.name && `г. ${servicePointData.city.name}`}
                {servicePointData.address && `, ${servicePointData.address}`}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Выберите удобные дату и время для вашего визита
        </Typography>
      </Paper>
      
      {/* Ошибка загрузки доступности */}
      {availabilityError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка загрузки доступного времени. Попробуйте обновить страницу.
        </Alert>
      )}

      {/* Селектор доступности */}
      <Box sx={{ mb: 3 }}>
        <AvailabilitySelector
          servicePointId={formData.service_point_id}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedTimeSlot={selectedTimeSlot}
          onTimeSlotChange={handleTimeSlotChange}
          availableTimeSlots={availableTimeSlots}
          isLoading={isLoadingAvailability}
          servicePointPhone={servicePointData?.contact_phone || servicePointData?.phone}
        />
      </Box>


      
      {/* Валидация */}
      {selectedDate && !selectedTimeSlot && (
        <FormHelperText error>
          Выберите время для продолжения
        </FormHelperText>
      )}
      
      {!selectedDate && (
        <FormHelperText error>
          Выберите дату для продолжения
        </FormHelperText>
      )}
      
      {/* Подтверждение выбора */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Дата и время выбраны: {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: ru })} в {selectedTimeSlot}. Теперь можно перейти к заполнению контактной информации.
        </Alert>
      )}
    </Box>
  );
};

export default DateTimeStep;
