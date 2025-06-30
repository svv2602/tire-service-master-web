import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  FormHelperText,
  Chip,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useCreateBookingMutation, useUpdateBookingMutation, useGetBookingByIdQuery } from '../../api/bookings.api';
import { 
  BookingStatusEnum, 
  BookingService,
  BookingFormData,
  BookingServiceDetails
} from '../../types/booking';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';

import { useGetClientsQuery } from '../../api/clients.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { ServicePoint, ServiceCategory } from '../../types/models';
import { Client } from '../../types/client';
import { CarType } from '../../types/car';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { SelectChangeEvent } from '@mui/material';

// Импорт компонентов выбора времени
import { AvailabilitySelector } from '../../components/availability';
import { useGetSlotsForCategoryQuery } from '../../api/availability.api';
import { format, parseISO, addDays } from 'date-fns';
import type { AvailableTimeSlot } from '../../types/availability';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

// Импорты централизованной системы стилей
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles';

// Типы для формы бронирования
interface ServiceSelection {
  service_id: number;
  name: string;
  price: number;
  quantity: number;
}

// Расширенный интерфейс для данных бронирования с API
interface BookingDetails {
  id: string;
  client_id: string;
  service_point_id: string;
  car_type_id: string;
  category_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  status_id: number;
  booking_services: BookingServiceDetails[];
}

// Схема валидации для формы бронирования
const validationSchema = yup.object({
  service_point_id: yup.number().required('Выберите точку обслуживания'),
  client_id: yup.number().nullable(), // ✅ Клиент опционален для гостевых бронирований
  car_type_id: yup.number().required('Выберите тип автомобиля'),
  category_id: yup.number().required('Выберите категорию услуг'),
  booking_date: yup.string().required('Выберите дату'),
  start_time: yup.string().required('Выберите время начала'),
  notes: yup.string(),
  // ✅ Валидация для гостевых бронирований
  service_recipient_first_name: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required('Имя получателя услуги обязательно для гостевых бронирований'),
    otherwise: (schema) => schema.optional()
  }),
  service_recipient_last_name: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required('Фамилия получателя услуги обязательна для гостевых бронирований'),
    otherwise: (schema) => schema.optional()
  }),
  service_recipient_phone: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required('Телефон получателя услуги обязателен для гостевых бронирований'),
    otherwise: (schema) => schema.optional()
  }),
});

/**
 * Компонент формы создания/редактирования бронирования
 * Использует централизованную систему стилей для консистентного UI
 */

const BookingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme(); // Инициализация темы для централизованных стилей
  
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  
  const isEditMode = !!id;
  
  // Состояния формы
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Данные бронирования для обработки услуг
  const [services, setServices] = useState<ServiceSelection[]>([]);
  
  // ✅ Состояния для модального окна выбора времени
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // ✅ Состояния для API запросов (чтобы избежать проблем с порядком инициализации)
  const [currentServicePointId, setCurrentServicePointId] = useState<number>(0);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  
  // RTK Query хуки
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({} as any);
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({} as any);
  const { data: carTypesData, isLoading: carTypesLoading } = useGetCarTypesQuery();
  const { data: serviceCategoriesData, isLoading: serviceCategoriesLoading } = useGetServiceCategoriesQuery({});
  const { data: bookingData, isLoading: bookingLoading } = useGetBookingByIdQuery(id || '', { skip: !isEditMode });
  
  const isLoading = servicePointsLoading || clientsLoading || carTypesLoading || serviceCategoriesLoading || (isEditMode && bookingLoading) || loading;

  // ✅ Функция для извлечения времени из полной даты
  const extractTimeFromDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '';
    
    try {
      // Если это уже время в формате HH:mm, возвращаем как есть
      if (/^\d{2}:\d{2}$/.test(dateTimeString)) {
        return dateTimeString;
      }
      
      // Если это полная дата, извлекаем время
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        console.warn('Неверный формат даты:', dateTimeString);
        return '';
      }
      
      // Возвращаем время в формате HH:mm
      return date.toTimeString().substring(0, 5);
    } catch (error) {
      console.error('Ошибка парсинга времени:', error);
      return '';
    }
  };

  // Функция для расчета времени окончания (по умолчанию +1 час)
  const calculateEndTime = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // Добавляем 1 час по умолчанию
    return endDate.toTimeString().substring(0, 5); // Возвращаем в формате HH:mm
  };

  // ✅ Функция форматирования даты в формат dd.mm.yyyy
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Парсим дату в формате yyyy-mm-dd
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString; // Возвращаем исходную строку в случае ошибки
    }
  };

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => ({
    service_point_id: '',
    client_id: '',
    car_type_id: '',
    category_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: new Date().toTimeString().substring(0, 5),
    end_time: calculateEndTime(new Date()),
    status_id: BookingStatusEnum.PENDING,
    notes: '',
    services: [] as BookingService[],
    total_price: '0',
    // ✅ Поля получателя услуги (для гостевых бронирований)
    service_recipient_first_name: '',
    service_recipient_last_name: '',
    service_recipient_phone: '',
    service_recipient_email: '',
    // ✅ Поля данных автомобиля (для гостевых бронирований)
    car_brand: '',
    car_model: '',
    license_plate: '',
  }), []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Подготовка данных для API (админская форма)
        const bookingData = {
          client_id: values.client_id ? Number(values.client_id) : null, // ✅ Поддержка гостевых бронирований
          service_point_id: Number(values.service_point_id),

          car_type_id: Number(values.car_type_id),
          category_id: Number(values.category_id),
          booking_date: values.booking_date,
          start_time: values.start_time,
          end_time: values.end_time,
          status_id: values.status_id,
          notes: values.notes || '',
          services: services.map(service => ({
            service_id: service.service_id,
            quantity: service.quantity,
            price: service.price
          })),
          total_price: services.reduce((sum, service) => sum + (service.price * service.quantity), 0).toString(),
          // ✅ Поля получателя услуги (для гостевых бронирований)
          service_recipient_first_name: values.service_recipient_first_name || '',
          service_recipient_last_name: values.service_recipient_last_name || '',
          service_recipient_phone: values.service_recipient_phone || '',
          service_recipient_email: values.service_recipient_email || '',
          // ✅ Поля данных автомобиля (для гостевых бронирований)
          car_brand: values.car_brand || '',
          car_model: values.car_model || '',
          license_plate: values.license_plate || ''
        };

        if (isEditMode && id) {
          await updateBooking({ 
            id: id.toString(), 
            booking: bookingData
          }).unwrap();
          setSuccess('Бронирование успешно обновлено');
        } else {
          await createBooking(bookingData).unwrap();
          setSuccess('Бронирование успешно создано');
        }
        
        setTimeout(() => {
          navigate('/admin/bookings');
        }, 1500);
      } catch (err) {
        console.error('Ошибка при сохранении бронирования:', err);
        setError('Ошибка при сохранении бронирования. Проверьте данные и попробуйте снова.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Загрузка данных существующего бронирования при редактировании
  useEffect(() => {
    if (isEditMode && bookingData) {
      const booking = bookingData as any; // ✅ Используем any для гибкости с новыми полями
      
      formik.setFieldValue('service_point_id', booking.service_point_id || '');
      formik.setFieldValue('client_id', booking.client_id || ''); // ✅ Может быть null для гостевых

      formik.setFieldValue('car_type_id', booking.car_type_id || '');
      formik.setFieldValue('category_id', booking.service_category_id || '');
      
      // ✅ Обновляем состояния для API запросов
      setCurrentServicePointId(Number(booking.service_point_id) || 0);
      setCurrentCategoryId(Number(booking.service_category_id) || 0);
      formik.setFieldValue('booking_date', booking.booking_date || '');
      // ✅ Извлекаем время из полной даты
      formik.setFieldValue('start_time', extractTimeFromDateTime(booking.start_time || ''));
      formik.setFieldValue('status_id', booking.status_id || BookingStatusEnum.PENDING);
      formik.setFieldValue('notes', booking.notes || '');
      
      // ✅ Инициализация временно отключена для отладки
      // if (booking.booking_date) {
      //   try {
      //     setSelectedDate(parseISO(booking.booking_date));
      //   } catch (error) {
      //     console.error('Ошибка парсинга даты:', error);
      //   }
      // }
      // if (booking.start_time) {
      //   setSelectedTimeSlot(booking.start_time);
      // }
      
      // ✅ Загрузка данных получателя услуги (для гостевых бронирований)
      if (booking.service_recipient) {
        formik.setFieldValue('service_recipient_first_name', booking.service_recipient.first_name || '');
        formik.setFieldValue('service_recipient_last_name', booking.service_recipient.last_name || '');
        formik.setFieldValue('service_recipient_phone', booking.service_recipient.phone || '');
        formik.setFieldValue('service_recipient_email', booking.service_recipient.email || '');
      }
      
      // ✅ Загрузка данных автомобиля (для гостевых бронирований)
      formik.setFieldValue('car_brand', booking.car_brand || '');
      formik.setFieldValue('car_model', booking.car_model || '');
      formik.setFieldValue('license_plate', booking.license_plate || '');
      
      // Загрузка услуг бронирования, если они есть
      if (booking.booking_services && booking.booking_services.length > 0) {
        const loadedServices = booking.booking_services.map((bs: any) => ({
          service_id: bs.service_id,
          name: bs.service_name,
          price: bs.price,
          quantity: bs.quantity
        }));
        setServices(loadedServices);
      }
    }
  }, [isEditMode, bookingData, formik.setFieldValue, setServices]);

  // ✅ API для получения доступных временных слотов
  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetSlotsForCategoryQuery(
    {
      servicePointId: currentServicePointId,
      categoryId: currentCategoryId,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { 
      skip: !currentServicePointId || !currentCategoryId || !selectedDate || !timePickerOpen,
      refetchOnMountOrArgChange: true
    }
  );

  // ✅ Преобразование данных API в формат для AvailabilitySelector
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Группируем слоты по времени начала для подсчета доступных постов
    const groupedByTime = availabilityData.slots.reduce((acc, slot) => {
      const timeKey = slot.start_time;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          available_posts: 0,
          total_posts: 0,
          duration_minutes: slot.duration_minutes,
          can_book: true
        };
      }
      
      acc[timeKey].available_posts += 1;
      acc[timeKey].total_posts += 1;
      
      return acc;
    }, {} as Record<string, AvailableTimeSlot>);

    return Object.values(groupedByTime).sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData]);

  // Мемоизированные обработчики
  const handleServicePointChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('service_point_id', event.target.value);
    setCurrentServicePointId(Number(event.target.value) || 0);
  }, [formik.setFieldValue]);

  const handleClientChange = useCallback((event: SelectChangeEvent<string>) => {
    const clientId = event.target.value === '' ? null : Number(event.target.value);
    formik.setFieldValue('client_id', clientId);
  }, [formik.setFieldValue]);

  const handleCarTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('car_type_id', event.target.value);
  }, [formik.setFieldValue]);

  const handleCategoryChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('category_id', event.target.value);
    setCurrentCategoryId(Number(event.target.value) || 0);
  }, [formik.setFieldValue]);

  const handleNotesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('notes', event.target.value);
  }, [formik.setFieldValue]);

  // ✅ Обработчик изменения времени начала с автоматическим расчетом времени окончания
  const handleStartTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = event.target.value;
    formik.setFieldValue('start_time', startTime);
    
    // Автоматически устанавливаем время окончания (+1 час)
    if (startTime) {
      try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours + 1, minutes);
        const endTime = endDate.toTimeString().substring(0, 5);
        formik.setFieldValue('end_time', endTime);
      } catch (error) {
        console.error('Ошибка расчета времени окончания:', error);
      }
    }
  }, [formik.setFieldValue]);

  const handleBack = useCallback(() => {
    navigate('/admin/bookings');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/admin/bookings');
  }, [navigate]);

  // ✅ Обработчики для модального окна выбора времени
  const handleOpenTimePicker = useCallback(() => {
    if (!currentServicePointId) {
      setError('Сначала выберите точку обслуживания');
      return;
    }
    
    if (!currentCategoryId) {
      setError('Сначала выберите категорию услуг');
      return;
    }
    
    // Инициализируем дату если не выбрана
    if (!selectedDate && formik.values.booking_date) {
      try {
        setSelectedDate(parseISO(formik.values.booking_date));
      } catch (error) {
        setSelectedDate(addDays(new Date(), 1)); // Завтра по умолчанию
      }
    } else if (!selectedDate) {
      setSelectedDate(addDays(new Date(), 1)); // Завтра по умолчанию
    }
    
    setTimePickerOpen(true);
  }, [currentServicePointId, currentCategoryId, formik.values.booking_date, selectedDate]);

  const handleCloseTimePicker = useCallback(() => {
    setTimePickerOpen(false);
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Сбрасываем время при изменении даты
    
    if (date) {
      formik.setFieldValue('booking_date', format(date, 'yyyy-MM-dd'));
      formik.setFieldValue('start_time', '');
    }
  }, [formik.setFieldValue]);

  const handleTimeSlotChange = useCallback((timeSlot: string | null, slotData?: AvailableTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    
    if (timeSlot) {
      formik.setFieldValue('start_time', timeSlot);
      // Автоматически рассчитываем время окончания на основе длительности слота
      if (slotData?.duration_minutes) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + slotData.duration_minutes);
        formik.setFieldValue('end_time', endDate.toTimeString().substring(0, 5));
      }
    }
  }, [formik.setFieldValue]);

  const handleConfirmTimeSelection = useCallback(() => {
    if (selectedDate && selectedTimeSlot) {
      setTimePickerOpen(false);
      setError(null); // Очищаем ошибки
    }
  }, [selectedDate, selectedTimeSlot]);
  
  // Получение централизованных стилей для консистентного дизайна
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const outlinedButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  // Показать индикатор загрузки при получении данных
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование бронирования' : 'Новое бронирование'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={outlinedButtonStyles}
        >
          Назад к списку
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: SIZES.spacing.md }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: SIZES.spacing.md }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Paper sx={cardStyles}>
          <Typography variant="h6" sx={{ mb: SIZES.spacing.md }}>
            Основная информация
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.service_point_id && Boolean(formik.errors.service_point_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="service-point-label">Точка обслуживания</InputLabel>
                <Select
                  labelId="service-point-label"
                  value={formik.values.service_point_id}
                  onChange={handleServicePointChange}
                  label="Точка обслуживания"
                >
                  {servicePointsData?.data?.map((servicePoint: ServicePoint) => (
                    <MenuItem key={servicePoint.id} value={servicePoint.id}>
                      {servicePoint.name} ({servicePoint.address})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.service_point_id && formik.errors.service_point_id && (
                  <FormHelperText>{formik.errors.service_point_id as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.client_id && Boolean(formik.errors.client_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="client-label">Клиент</InputLabel>
                <Select
                  labelId="client-label"
                  value={formik.values.client_id || ''}
                  onChange={handleClientChange}
                  label="Клиент"
                >
                  {/* ✅ Опция для гостевого бронирования */}
                  <MenuItem value="">
                    <em>Гостевое бронирование (без регистрации)</em>
                  </MenuItem>
                  {clientsData?.data?.map((client: Client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name || `${client.first_name} ${client.last_name}`} ({client.phone || client.email})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.client_id && formik.errors.client_id && (
                  <FormHelperText>{formik.errors.client_id as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.car_type_id && Boolean(formik.errors.car_type_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="car-type-label">Тип автомобиля</InputLabel>
                <Select
                  labelId="car-type-label"
                  value={formik.values.car_type_id}
                  onChange={handleCarTypeChange}
                  label="Тип автомобиля"
                >
                  {carTypesData?.map((carType: CarType) => (
                    <MenuItem key={carType.id} value={carType.id}>
                      {carType.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.car_type_id && formik.errors.car_type_id && (
                  <FormHelperText>{formik.errors.car_type_id as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="category-label">Категория услуг</InputLabel>
                <Select
                  labelId="category-label"
                  value={formik.values.category_id}
                  onChange={handleCategoryChange}
                  label="Категория услуг"
                >
                  {serviceCategoriesData?.data?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category_id && formik.errors.category_id && (
                  <FormHelperText>{formik.errors.category_id as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: SIZES.spacing.md, mb: SIZES.spacing.sm }}>
                Дата и время записи
              </Typography>
            </Grid>
            
            {/* ✅ Информационное отображение сохраненных даты и времени */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 1,
                backgroundColor: theme.palette.background.default
              }}>
                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Выбранные дата и время
                </Typography>
                
                {formik.values.booking_date && formik.values.start_time ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={`📅 ${formatDateForDisplay(formik.values.booking_date)}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`🕐 ${formik.values.start_time} - ${formik.values.end_time || 'не указано'}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleOpenTimePicker}
                        sx={{ textTransform: 'none' }}
                      >
                        Изменить дату и время
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => {
                          formik.setFieldValue('booking_date', '');
                          formik.setFieldValue('start_time', '');
                          formik.setFieldValue('end_time', '');
                          setSelectedDate(null);
                          setSelectedTimeSlot(null);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Очистить
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Дата и время не выбраны
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpenTimePicker}
                      sx={{ textTransform: 'none' }}
                    >
                      Выбрать дату и время записи
                    </Button>
                  </Box>
                )}
                
                {/* Отображение ошибок валидации */}
                {(formik.touched.booking_date && formik.errors.booking_date) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.booking_date}
                  </Typography>
                )}
                {(formik.touched.start_time && formik.errors.start_time) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.start_time}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Примечания"
                value={formik.values.notes}
                onChange={handleNotesChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {/* ✅ Секция для редактирования данных гостевых бронирований */}
        {(!formik.values.client_id || isEditMode) && (
          <Paper sx={{ ...cardStyles, mt: SIZES.spacing.lg }}>
            <Typography variant="h6" sx={{ mb: SIZES.spacing.md }}>
              Данные получателя услуги {!formik.values.client_id && '(Гостевое бронирование)'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Имя получателя услуги"
                  value={formik.values.service_recipient_first_name}
                  onChange={(e) => formik.setFieldValue('service_recipient_first_name', e.target.value)}
                  error={formik.touched.service_recipient_first_name && Boolean(formik.errors.service_recipient_first_name)}
                  helperText={formik.touched.service_recipient_first_name && formik.errors.service_recipient_first_name}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Фамилия получателя услуги"
                  value={formik.values.service_recipient_last_name}
                  onChange={(e) => formik.setFieldValue('service_recipient_last_name', e.target.value)}
                  error={formik.touched.service_recipient_last_name && Boolean(formik.errors.service_recipient_last_name)}
                  helperText={formik.touched.service_recipient_last_name && formik.errors.service_recipient_last_name}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Телефон получателя услуги"
                  value={formik.values.service_recipient_phone}
                  onChange={(e) => formik.setFieldValue('service_recipient_phone', e.target.value)}
                  error={formik.touched.service_recipient_phone && Boolean(formik.errors.service_recipient_phone)}
                  helperText={formik.touched.service_recipient_phone && formik.errors.service_recipient_phone}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email получателя услуги (опционально)"
                  type="email"
                  value={formik.values.service_recipient_email}
                  onChange={(e) => formik.setFieldValue('service_recipient_email', e.target.value)}
                  error={formik.touched.service_recipient_email && Boolean(formik.errors.service_recipient_email)}
                  helperText={formik.touched.service_recipient_email && formik.errors.service_recipient_email}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: SIZES.spacing.md, mb: SIZES.spacing.sm }}>
                  Данные автомобиля
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Марка автомобиля"
                  value={formik.values.car_brand}
                  onChange={(e) => formik.setFieldValue('car_brand', e.target.value)}
                  error={formik.touched.car_brand && Boolean(formik.errors.car_brand)}
                  helperText={formik.touched.car_brand && formik.errors.car_brand}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Модель автомобиля"
                  value={formik.values.car_model}
                  onChange={(e) => formik.setFieldValue('car_model', e.target.value)}
                  error={formik.touched.car_model && Boolean(formik.errors.car_model)}
                  helperText={formik.touched.car_model && formik.errors.car_model}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Номер автомобиля"
                  value={formik.values.license_plate}
                  onChange={(e) => formik.setFieldValue('license_plate', e.target.value)}
                  error={formik.touched.license_plate && Boolean(formik.errors.license_plate)}
                  helperText={formik.touched.license_plate && formik.errors.license_plate}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* Здесь можно добавить секцию для выбора услуг */}
        
        <Box sx={{ 
          display: 'flex', 
          gap: SIZES.spacing.md, 
          justifyContent: 'flex-end',
          mt: SIZES.spacing.lg
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={outlinedButtonStyles}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting || loading}
            sx={buttonStyles}
          >
            {formik.isSubmitting || loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </form>

      {/* ✅ Модальное окно выбора времени */}
      <Dialog
        open={timePickerOpen}
        onClose={handleCloseTimePicker}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Выберите дату и время записи
        </DialogTitle>
        <DialogContent>
          <AvailabilitySelector
            servicePointId={currentServicePointId}
            categoryId={currentCategoryId}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            availableTimeSlots={availableTimeSlots}
            isLoading={isLoadingAvailability}
            onDateChange={handleDateChange}
            onTimeSlotChange={handleTimeSlotChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimePicker}>
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmTimeSelection}
            variant="contained"
            disabled={!selectedDate || !selectedTimeSlot}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingFormPage;