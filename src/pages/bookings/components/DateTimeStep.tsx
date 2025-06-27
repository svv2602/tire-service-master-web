// Шаг 2: Выбор даты и времени

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useGetSlotsForCategoryQuery } from '../../../api/availability.api';
import { useGetServicePointBasicInfoQuery } from '../../../api/servicePoints.api';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

// Импорт типов - используем локальный тип
interface DateTimeStepProps {
  formData: any; // Используем any для совместимости с локальным BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Эффект для фокуса на календаре при монтировании компонента
  useEffect(() => {
    // Небольшая задержка для плавности UX и ожидания рендера календаря
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        // Ищем кнопку календаря или первый интерактивный элемент
        const calendarButton = calendarRef.current.querySelector('button[role="gridcell"]:not([disabled])') as HTMLElement;
        const calendarInput = calendarRef.current.querySelector('input') as HTMLElement;
        const focusTarget = calendarButton || calendarInput || calendarRef.current;
        
        if (focusTarget) {
          focusTarget.focus();
          // Добавляем визуальное выделение области календаря
          calendarRef.current.style.outline = `2px solid ${theme.palette.primary.main}`;
          calendarRef.current.style.outlineOffset = '4px';
          calendarRef.current.style.borderRadius = '8px';
          
          // Убираем выделение через некоторое время
          setTimeout(() => {
            if (calendarRef.current) {
              calendarRef.current.style.outline = 'none';
              calendarRef.current.style.outlineOffset = '0';
            }
          }, 2000);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []); // Срабатывает только при монтировании компонента
  
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
      setFormData((prev: any) => ({
        ...prev,
        booking_date: format(tomorrow, 'yyyy-MM-dd'),
      }));
    }
    
    if (formData.start_time) {
      setSelectedTimeSlot(formData.start_time);
    }
  }, [formData.booking_date, formData.start_time, setFormData]);
  
  // Загрузка доступных временных слотов с учетом категории
  const { data: availabilityData, isLoading: isLoadingAvailability, error: availabilityError } = useGetSlotsForCategoryQuery(
    {
      servicePointId: formData.service_point_id?.toString() || '0',
      categoryId: formData.service_category_id,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { skip: !formData.service_point_id || !formData.service_category_id || !selectedDate }
  );
  
  // Получаем доступные временные слоты
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Группируем слоты по времени начала
    const groupedByTime = availabilityData.slots.reduce((acc, slot) => {
      const timeKey = slot.start_time;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          posts: [],
          available_posts: 0,
          total_posts: 0
        };
      }
      
      acc[timeKey].posts.push(slot);
      acc[timeKey].available_posts += 1; // Все слоты в ответе доступны
      acc[timeKey].total_posts += 1;
      
      return acc;
    }, {} as Record<string, {
      time: string;
      posts: any[];
      available_posts: number;
      total_posts: number;
    }>);

    // Преобразуем в массив и сортируем по времени
    return Object.values(groupedByTime)
      .map(group => ({
        time: group.time,
        available_posts: group.available_posts,
        total_posts: group.total_posts,
        can_book: group.available_posts > 0
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData]);
  
  // Обработчик изменения даты
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Сбрасываем время при изменении даты
    
    setFormData((prev: any) => ({
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
    
    setFormData((prev: any) => ({
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

      {/* Селектор доступности с рефом для фокуса */}
      <Box ref={calendarRef} sx={{ mb: 3 }}>
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
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!formData.booking_date && (
              <Typography variant="body2" component="li">
                Дата бронирования
              </Typography>
            )}
            {!formData.start_time && (
              <Typography variant="body2" component="li">
                Время бронирования
              </Typography>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {isValid && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Все обязательные поля заполнены. Можете перейти к следующему шагу.
        </Alert>
      )}
    </Box>
  );
};

export default DateTimeStep;
