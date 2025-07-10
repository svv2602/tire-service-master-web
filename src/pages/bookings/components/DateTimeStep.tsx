// Шаг 2: Выбор даты и времени

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Alert,
  Paper,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, addDays } from 'date-fns';
import { useDateLocale } from '../../../hooks/useDateLocale';
import {
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Импорт компонентов доступности
import { AvailabilityCalendar } from '../../../components/availability/AvailabilityCalendar';
import { DayDetailsPanel } from '../../../components/availability/DayDetailsPanel';
import TimeSlotPicker from '../../../components/availability/TimeSlotPicker';

// Импорт API хуков
import { useGetSlotsForCategoryQuery, useGetDayDetailsQuery } from '../../../api/availability.api';
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
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [expandedPanel, setExpandedPanel] = useState<'date' | 'time'>('date');
  
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
        console.error('Error parsing date:', error);
      }
    }
    // УБРАНА АВТОМАТИЧЕСКАЯ УСТАНОВКА ЗАВТРАШНЕЙ ДАТЫ
    // Теперь дата выделяется только после клика пользователя
    
    if (formData.start_time) {
      setSelectedTimeSlot(formData.start_time);
    }
  }, [formData.booking_date, formData.start_time, setFormData]);
  
  // Отладочная информация для API запроса слотов
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const apiParams = {
        servicePointId: formData.service_point_id?.toString() || '0',
        categoryId: formData.service_category_id,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
      };
      const skipCondition = !formData.service_point_id || !formData.service_category_id || !selectedDate;
      
      console.log('🕒 DateTimeStep API параметры:', {
        apiParams,
        skipCondition,
        formData: {
          service_point_id: formData.service_point_id,
          service_category_id: formData.service_category_id,
          selectedDate: selectedDate
        }
      });
    }
  }, [formData.service_point_id, formData.service_category_id, selectedDate]);

  // Загрузка доступных слотов для выбранной даты
  const { data: availabilityData, isLoading: isLoadingAvailability, error: availabilityError } = useGetSlotsForCategoryQuery(
    {
      servicePointId: formData.service_point_id?.toString() || '0',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      categoryId: formData.service_category_id?.toString() || '1'
    },
    { skip: !formData.service_point_id || !selectedDate || !formData.service_category_id }
  );

  // Загрузка статистики дня для правильного отображения загруженности
  const { data: dayDetailsData, isLoading: isLoadingDayDetails, error: dayDetailsError } = useGetDayDetailsQuery(
    {
      servicePointId: formData.service_point_id?.toString() || '0',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      categoryId: formData.service_category_id?.toString() || '1'
    },
    { skip: !formData.service_point_id || !selectedDate || !formData.service_category_id }
  );

  // Отладочная информация для API ответа
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Данные доступности слотов:', {
        availabilityData,
        isLoadingAvailability,
        availabilityError,
        selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      });
    }
  }, [availabilityData, isLoadingAvailability, availabilityError, selectedDate]);
  
  // Группировка доступных слотов по времени с подсчетом доступности
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Теперь API уже возвращает правильную группировку по времени
    // Каждый слот содержит available_posts, total_posts, bookings_count
    const processedSlots = availabilityData.slots.map(slot => ({
      time: slot.start_time,
      available_posts: slot.available_posts || 1,
      total_posts: slot.total_posts || 1,
      can_book: (slot.available_posts || 0) > 0,
      duration_minutes: slot.duration_minutes,
      bookings_count: slot.bookings_count || 0
    }));

    // Отладочная информация для обработанных слотов
    if (process.env.NODE_ENV === 'development') {
      console.log('⏰ Обработанные временные слоты:', {
        originalSlots: availabilityData?.slots?.length || 0,
        processedSlots: processedSlots.length,
        sampleSlots: processedSlots.slice(0, 3),
        hasNewFields: processedSlots.length > 0 && processedSlots[0].available_posts !== undefined
      });
    }

    return processedSlots.sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData]);
  
  // Отладочная информация для диагностики данных
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DateTimeStep - Отладочная информация:', {
        servicePointId: formData.service_point_id,
        selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
        categoryId: formData.service_category_id,
        dayDetailsData,
        dayDetailsError,
        isLoadingDayDetails,
        availabilityData,
        availabilityError,
        isLoadingAvailability,
        availableTimeSlotsLength: availableTimeSlots.length
      });
    }
  }, [formData.service_point_id, selectedDate, formData.service_category_id, dayDetailsData, availabilityData, availableTimeSlots]);
  
  // Обработчик выбора даты с переходом к выбору времени
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setFormData((prev: any) => ({
      ...prev,
      booking_date: date ? format(date, 'yyyy-MM-dd') : '',
      start_time: '',
    }));
    if (date) {
      setExpandedPanel('time');
    }
  };
  
  // Загрузка информации о точке обслуживания
  const { data: servicePointData, isLoading: isLoadingServicePoint } = useGetServicePointBasicInfoQuery(
    formData.service_point_id?.toString() || '0',
    { skip: !formData.service_point_id }
  );
  
  // Обработчик выбора времени
  const handleTimeSlotChange = (timeSlot: string | null, slotData?: any) => {
    setSelectedTimeSlot(timeSlot);
    setFormData((prev: any) => ({
      ...prev,
      start_time: timeSlot || '',
      duration_minutes: slotData?.duration_minutes,
    }));
  };

  // Проверяем, является ли выбранная дата сегодняшним днем
  
  if (!formData.service_point_id) {
    return (
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          {t('bookingSteps.dateTime.title')}
        </Typography>
        <Alert severity="warning">
          {t('bookingSteps.dateTime.selectServicePointFirst')}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        {t('bookingSteps.dateTime.title')}
      </Typography>
      
      {/* Информация о выбранной точке обслуживания */}
      <Paper sx={{ ...getCardStyles(theme), p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <LocationIcon sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isLoadingServicePoint ? t('bookingSteps.dateTime.loadingServicePoint') : (servicePointData?.name || `${t('bookingSteps.dateTime.servicePoint')} #${formData.service_point_id}`)}
            </Typography>
            {servicePointData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {servicePointData.city?.name && `${t('bookingSteps.dateTime.city')} ${servicePointData.city.name}`}
                {servicePointData.address && `, ${servicePointData.address}`}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Ошибка загрузки доступности */}
      {availabilityError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('bookingSteps.dateTime.errorLoadingSlots')}
        </Alert>
      )}

      {/* Аккордеон выбора даты */}
      <Accordion expanded={expandedPanel === 'date'} onChange={() => setExpandedPanel('date')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalendarMonthIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('bookingSteps.dateTime.selectDate')}
            </Typography>
            {selectedDate && (
              <Chip label={format(selectedDate, 'd MMMM yyyy', { locale: dateLocale })} color="success" size="small" />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <AvailabilityCalendar
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                isLoading={isLoadingAvailability}
                servicePointId={formData.service_point_id}
                categoryId={formData.service_category_id}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <DayDetailsPanel
                selectedDate={selectedDate}
                selectedTimeSlot={null}
                isLoading={isLoadingDayDetails || isLoadingAvailability}
                totalPosts={dayDetailsData?.summary?.total_slots || 0}
                availablePosts={(dayDetailsData?.summary?.total_slots || 0) - (dayDetailsData?.summary?.occupied_slots || 0)}
                occupancyPercentage={dayDetailsData?.summary?.occupancy_percentage || 0}
                servicePointPhone={servicePointData?.phone}
                isWorking={dayDetailsData?.is_working || false}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Аккордеон выбора времени */}
      <Accordion expanded={expandedPanel === 'time'} onChange={() => setExpandedPanel('time')} disabled={!selectedDate}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AccessTimeIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('bookingSteps.dateTime.selectTime')}
            </Typography>
            {selectedTimeSlot && (
              <Chip label={selectedTimeSlot} color="success" size="small" />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <TimeSlotPicker
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={handleTimeSlotChange}
            availableTimeSlots={availableTimeSlots}
            isLoading={isLoadingAvailability}
            hideSelectedChip={true}
          />
        </AccordionDetails>
      </Accordion>

      
      {/* Валидация */}
      {selectedDate && !selectedTimeSlot && (
        <FormHelperText error>
                      {t('bookingSteps.dateTime.selectTime')}
        </FormHelperText>
      )}
      
      {!selectedDate && (
        <FormHelperText error>
                      {t('bookingSteps.dateTime.selectDate')}
        </FormHelperText>
      )}
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('bookingSteps.dateTime.requiredFieldsWarning')}:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!formData.booking_date && (
              <Typography variant="body2" component="li">
                {t('bookingSteps.dateTime.dateRequired')}
              </Typography>
            )}
            {!formData.start_time && (
              <Typography variant="body2" component="li">
                {t('bookingSteps.dateTime.timeRequired')}
              </Typography>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('bookingSteps.dateTime.allRequiredFieldsFilled')}
        </Alert>
      )}
    </Box>
  );
};

export default DateTimeStep;
