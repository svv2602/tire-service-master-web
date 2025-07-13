// Шаг 2: Выбор даты и времени

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
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
  Stack,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, addDays } from 'date-fns';
import { useDateLocale } from '../../../hooks/useDateLocale';
import {
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
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
  
  // Получаем информацию о текущем пользователе для определения служебной роли
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isServiceUser = currentUser && ['admin', 'partner', 'manager', 'operator'].includes(currentUser.role);
  
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
  }, []);
  
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
        },
        isServiceUser: isServiceUser // Добавляем информацию о типе пользователя
      });
    }
  }, [formData.service_point_id, formData.service_category_id, selectedDate, isServiceUser]);

  // API запрос для получения слотов
  const { data: availabilityData, isLoading: isLoadingAvailability, error: availabilityError } = useGetSlotsForCategoryQuery(
    {
      servicePointId: formData.service_point_id || 0,
      categoryId: formData.service_category_id || 0,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { skip: !formData.service_point_id || !formData.service_category_id || !selectedDate }
  );

  // API запрос для получения деталей дня
  const { data: dayDetailsData, isLoading: isLoadingDayDetails, error: dayDetailsError } = useGetDayDetailsQuery(
    {
      servicePointId: formData.service_point_id?.toString() || '0',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      categoryId: formData.service_category_id
    },
    { skip: !formData.service_point_id || !formData.service_category_id || !selectedDate }
  );

  // Преобразование данных API в формат для компонентов
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Преобразуем слоты используя новые поля API
    return availabilityData.slots.map(slot => ({
      time: slot.start_time,
      available_posts: slot.available_posts || 0,
      total_posts: slot.total_posts || 0,
      bookings_count: slot.bookings_count || 0,
      duration_minutes: slot.duration_minutes,
      can_book: isServiceUser ? true : (slot.available_posts || 0) > 0, // Служебные пользователи могут бронировать любой слот
      is_available: slot.is_available,
      occupancy_status: slot.occupancy_status
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData, isServiceUser]);
  
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
        availableTimeSlotsLength: availableTimeSlots.length,
        isServiceUser: isServiceUser,
        currentUser: currentUser,
        userRole: currentUser?.role,
        allSlots: availabilityData?.slots || []
      });
    }
  }, [formData.service_point_id, selectedDate, formData.service_category_id, dayDetailsData, availabilityData, availableTimeSlots, isServiceUser]);
  
  // Обработчик выбора даты БЕЗ автоматического перехода к выбору времени
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setFormData((prev: any) => ({
      ...prev,
      booking_date: date ? format(date, 'yyyy-MM-dd') : '',
      start_time: '',
    }));
    // УБИРАЕМ автоматический переход к выбору времени
    // if (date) {
    //   setExpandedPanel('time');
    // }
  };

  // Обработчик кнопки "Далее" для перехода к выбору времени
  const handleProceedToTimeSelection = () => {
    if (selectedDate) {
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
          {t('forms.booking.dateTime.title')}
        </Typography>
        <Alert severity="warning">
                    {t('forms.booking.dateTime.selectServicePointFirst')}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          {t('forms.booking.dateTime.title')}
        {isServiceUser && (
          <Chip 
            label={t('forms.booking.dateTime.serviceUserMode')} 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }}
          />
        )}
      </Typography>
      
      {/* Информация о выбранной точке обслуживания */}
      <Paper sx={{ ...getCardStyles(theme), p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <LocationIcon sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isLoadingServicePoint ? t('forms.booking.dateTime.loadingServicePoint') : (servicePointData?.name || `${t('forms.booking.dateTime.servicePoint')} #${formData.service_point_id}`)}
            </Typography>
            {servicePointData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {servicePointData.city?.name && `${t('forms.booking.dateTime.city')} ${servicePointData.city.name}`}
                {servicePointData.address && `, ${servicePointData.address}`}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Аккордеон выбора даты */}
      <Accordion expanded={expandedPanel === 'date'} onChange={() => setExpandedPanel('date')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalendarMonthIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('forms.booking.dateTime.selectDate')}
            </Typography>
            {selectedDate && (
              <Chip 
                label={format(selectedDate, 'dd.MM.yyyy')} 
                color="success" 
                size="small" 
              />
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
                isWorking={dayDetailsData?.is_working as boolean | undefined}
              />
            </Box>
          </Box>
          
          {/* Кнопка "Далее" для перехода к выбору времени */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleProceedToTimeSelection}
              disabled={!selectedDate}
              endIcon={<ArrowForwardIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              {t('forms.booking.dateTime.proceedToTimeSelection')}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Аккордеон выбора времени */}
      <Accordion expanded={expandedPanel === 'time'} onChange={() => setExpandedPanel('time')} disabled={!selectedDate}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AccessTimeIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('forms.booking.dateTime.selectTime')}
            </Typography>
            {/* Отображаем только выбранное время */}
            {selectedTimeSlot && (
              <Chip 
                label={selectedTimeSlot} 
                color="success" 
                size="small" 
              />
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
            isServiceUser={isServiceUser || false} // Передаем информацию о типе пользователя
          />
        </AccordionDetails>
      </Accordion>

      
      {/* Валидация */}
      {selectedDate && !selectedTimeSlot && (
        <FormHelperText error>
                      {t('forms.booking.dateTime.selectTime')}
        </FormHelperText>
      )}
      
      {!selectedDate && (
        <FormHelperText error>
                      {t('forms.booking.dateTime.selectDate')}
        </FormHelperText>
      )}
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('forms.booking.dateTime.fillRequiredFields')}
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!selectedDate && (
              <li>
                <Typography variant="body2">
                  {t('forms.booking.dateTime.selectDate')}
                </Typography>
              </li>
            )}
            {!selectedTimeSlot && (
              <li>
                <Typography variant="body2">
                  {t('forms.booking.dateTime.selectTime')}
                </Typography>
              </li>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default DateTimeStep;
