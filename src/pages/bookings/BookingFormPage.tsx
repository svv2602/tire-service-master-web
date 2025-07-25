import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
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
import { useCreateBookingMutation, useUpdateBookingMutation, useGetBookingByIdQuery, useGetBookingStatusesQuery } from '../../api/bookings.api';
import { 
  BOOKING_STATUSES, 
  BookingService,
  BookingFormData,
  BookingServiceDetails
} from '../../types/booking';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';

import { useGetClientsQuery } from '../../api/clients.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { useGetCarBrandsQuery, useGetCarModelsByBrandIdQuery } from '../../api';
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

// Импорт UI компонентов
import { PhoneField } from '../../components/ui/PhoneField';

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
  notes: string;
  status_id: string; // Теперь строка, а не число
  booking_services: BookingServiceDetails[];
}

// Схема валидации для формы бронирования
const createValidationSchema = (t: any) => yup.object({
  service_point_id: yup.number().required(t('forms.bookings.form.validation.servicePointRequired')),
  client_id: yup.number().nullable(), // ✅ Клиент опционален для гостевых бронирований
  car_type_id: yup.number().required(t('forms.bookings.form.validation.carTypeRequired')),
  category_id: yup.number().required(t('forms.bookings.form.validation.categoryRequired')),
  booking_date: yup.string().required(t('forms.bookings.form.validation.dateRequired')),
  start_time: yup.string().required(t('forms.bookings.form.validation.startTimeRequired')),
  notes: yup.string(),
  // ✅ Валидация для гостевых бронирований
  service_recipient_first_name: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required(t('forms.bookings.form.validation.firstNameRequired')),
    otherwise: (schema) => schema.optional()
  }),
  service_recipient_last_name: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required(t('forms.bookings.form.validation.lastNameRequired')),
    otherwise: (schema) => schema.optional()
  }),
  service_recipient_phone: yup.string().when('client_id', {
    is: (client_id: number | null) => !client_id,
    then: (schema) => schema.required(t('forms.bookings.form.validation.phoneRequired')),
    otherwise: (schema) => schema.optional()
  }),
});

/**
 * Компонент формы создания/редактирования бронирования
 * Использует централизованную систему стилей для консистентного UI
 */

const BookingFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme(); // Инициализация темы для централизованных стилей
  
  // 🚀 НОВАЯ ЛОГИКА: Определяем тип пользователя для фильтрации слотов
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isServiceUser = Boolean(currentUser && ['admin', 'partner', 'manager', 'operator'].includes(currentUser.role));

  console.log('🔍 Тип пользователя в админке редактирования бронирования:', {
    userRole: currentUser?.role,
    isServiceUser,
    shouldShowAllSlots: isServiceUser
  });
  
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
  
  // ✅ Состояние для работы с брендами и моделями автомобилей
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  
  // RTK Query хуки
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({} as any);
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({} as any);
  const { data: carTypesData, isLoading: carTypesLoading } = useGetCarTypesQuery({});
  const { data: serviceCategoriesData, isLoading: serviceCategoriesLoading } = useGetServiceCategoriesQuery({});
  const { data: bookingData, isLoading: bookingLoading } = useGetBookingByIdQuery(id || '', { skip: !isEditMode });
  const { data: bookingStatusesData, isLoading: bookingStatusesLoading } = useGetBookingStatusesQuery();
  
  // ✅ API запросы для получения брендов и моделей автомобилей
  const { data: carBrandsData, isLoading: carBrandsLoading } = useGetCarBrandsQuery({});
  const { data: carModelsData, isLoading: carModelsLoading } = useGetCarModelsByBrandIdQuery(
    { brandId: selectedBrandId?.toString() || '' },
    { skip: !selectedBrandId }
  );
  
  const isLoading = servicePointsLoading || clientsLoading || carTypesLoading || serviceCategoriesLoading || bookingStatusesLoading || (isEditMode && bookingLoading) || loading || carBrandsLoading;

  // ✅ Вспомогательные переменные для работы с брендами и моделями
  const carBrands = carBrandsData?.data || [];
  const carModels = carModelsData?.car_models || [];

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
        console.warn(t('forms.bookings.form.messages.invalidDateFormat'), dateTimeString);
        return '';
      }
      
      // Возвращаем время в формате HH:mm
      return date.toTimeString().substring(0, 5);
    } catch (error) {
      console.error(t('forms.bookings.form.messages.timeParsingError'), error);
      return '';
    }
  };

  // ✅ Функция форматирования даты в формат dd.mm.yyyy
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Парсим дату в формате yyyy-mm-dd
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error(t('forms.bookings.form.messages.dateFormattingError'), error);
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
    status_id: BOOKING_STATUSES.PENDING,
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
    validationSchema: createValidationSchema(t),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Подготовка данных для API (админская форма)
        // ✅ Функция получения строкового статуса
        // Теперь status_id в форме уже содержит строковый ключ, просто возвращаем его
        const getStatusString = (statusKey: any): string => {
          // Если это уже строка, возвращаем как есть
          if (typeof statusKey === 'string') {
            return statusKey;
          }
          
          // Если это число (старый формат), преобразуем
          if (typeof statusKey === 'number') {
            const statusIdToKeyMap: Record<number, string> = {
              9: 'pending',
              10: 'confirmed',
              11: 'in_progress',
              12: 'completed',
              13: 'cancelled_by_client',
              14: 'cancelled_by_partner',
              15: 'no_show'
            };
            return statusIdToKeyMap[statusKey] || 'pending';
          }
          
          return 'pending'; // По умолчанию
        };
        
        const bookingData = {
          // ✅ Убираем поля, которые не разрешены для обновления
          // client_id и service_point_id не должны изменяться при редактировании
          car_type_id: Number(values.car_type_id),
          service_category_id: Number(values.category_id), // ✅ Исправлено название поля
          booking_date: values.booking_date,
          start_time: values.start_time,
          status: getStatusString(values.status_id), // ✅ Получение строкового статуса
          notes: values.notes || '',
          // ✅ Убираем services - они обрабатываются отдельно
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
        
        // ✅ Для создания нового бронирования добавляем обязательные поля
        if (!isEditMode) {
          (bookingData as any).client_id = values.client_id ? Number(values.client_id) : null;
          (bookingData as any).service_point_id = Number(values.service_point_id);
          (bookingData as any).services = services.map(service => ({
            service_id: service.service_id,
            quantity: service.quantity,
            price: service.price
          }));
        }

        if (isEditMode && id) {
          await updateBooking({ 
            id: id.toString(), 
            booking: bookingData
          }).unwrap();
          setSuccess(t('forms.bookings.form.messages.bookingUpdatedSuccess'));
        } else {
          await createBooking(bookingData).unwrap();
          setSuccess(t('forms.bookings.form.messages.bookingCreatedSuccess'));
        }
        
        setTimeout(() => {
          navigate('/admin/bookings');
        }, 1500);
      } catch (err) {
        console.error(t('forms.bookings.form.messages.bookingSaveError'), err);
        setError(t('forms.bookings.form.messages.bookingSaveErrorText'));
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
      const startTime = extractTimeFromDateTime(booking.start_time || '');
      formik.setFieldValue('start_time', startTime);
      
      // ✅ Установка статуса из данных бронирования
      // Используем строковые ключи статусов вместо числовых ID
      let statusKey = 'pending'; // По умолчанию "pending"
      
      if (booking.status) {
        // Если есть строковый статус, используем его напрямую
        if (typeof booking.status === 'string') {
          statusKey = booking.status;
        } else if (typeof booking.status === 'object' && booking.status.name) {
          statusKey = booking.status.name;
        }
      } else if (booking.status_id) {
        // Если есть старый status_id, маппим его на строковые ключи
        const statusIdToKeyMap: Record<number, string> = {
          9: 'pending',
          10: 'confirmed',
          11: 'in_progress',
          12: 'completed',
          13: 'cancelled_by_client',
          14: 'cancelled_by_partner',
          15: 'no_show'
        };
        statusKey = statusIdToKeyMap[Number(booking.status_id)] || 'pending';
      }
      
      console.log('🔄 Загрузка статуса бронирования:', {
        bookingStatusId: booking.status_id,
        bookingStatus: booking.status,
        resultStatusKey: statusKey
      });
      
      formik.setFieldValue('status_id', statusKey);
      
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
      
      // ✅ Устанавливаем выбранный бренд для загрузки моделей
      if (booking.car_brand && carBrands.length > 0) {
        const brand = carBrands.find(b => b.name === booking.car_brand);
        if (brand) {
          setSelectedBrandId(brand.id);
        }
      }
      
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
  }, [isEditMode, bookingData, formik.setFieldValue, setServices, carBrands]);

  // ✅ Отдельный useEffect для синхронизации selectedBrandId с загруженными брендами
  useEffect(() => {
    if (formik.values.car_brand && carBrands.length > 0 && !selectedBrandId) {
      const brand = carBrands.find(b => b.name === formik.values.car_brand);
      if (brand) {
        setSelectedBrandId(brand.id);
      }
    }
  }, [formik.values.car_brand, carBrands, selectedBrandId]);

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

    // Преобразуем слоты используя новые поля API
    let processedSlots = availabilityData.slots.map(slot => ({
      time: slot.start_time,
      available_posts: slot.available_posts || 0,
      total_posts: slot.total_posts || 0,
      bookings_count: slot.bookings_count || 0,
      duration_minutes: slot.duration_minutes,
      can_book: isServiceUser ? true : (slot.available_posts || 0) > 0, // Служебные пользователи могут бронировать любой слот
      is_available: slot.is_available !== null ? slot.is_available : undefined, // Обрабатываем null как undefined
      occupancy_status: slot.occupancy_status || ((slot.available_posts || 0) === 0 ? 'full' : 'available') // Определяем статус на основе доступности
    }));

    // 🚀 НОВАЯ ЛОГИКА: Для клиентов показываем только доступные слоты, для не-клиентов все слоты
    if (!isServiceUser) {
      // Для клиентов фильтруем только доступные слоты
      processedSlots = processedSlots.filter(slot => (slot.available_posts || 0) > 0);
      console.log('👤 Клиент в админке редактирования: отфильтровано слотов с available_posts > 0:', processedSlots.length);
    } else {
      console.log('🔧 Служебный пользователь в админке редактирования: показываем все слоты:', processedSlots.length);
    }

    return processedSlots.sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData, isServiceUser]);

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

  const handleStatusChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('status_id', event.target.value);
  }, [formik.setFieldValue]);

  // ✅ Обработчики для полей автомобиля
  const handleCarBrandChange = useCallback((event: SelectChangeEvent<string>) => {
    const brandId = Number(event.target.value);
    const selectedBrand = carBrands.find(b => b.id === brandId);
    
    setSelectedBrandId(brandId);
    formik.setFieldValue('car_brand', selectedBrand?.name || '');
    formik.setFieldValue('car_model', ''); // Сбрасываем модель при смене бренда
  }, [carBrands, formik.setFieldValue]);

  const handleCarModelChange = useCallback((event: SelectChangeEvent<string>) => {
    const modelId = Number(event.target.value);
    const selectedModel = carModels.find(m => m.id === modelId);
    
    formik.setFieldValue('car_model', selectedModel?.name || '');
  }, [carModels, formik.setFieldValue]);

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
      setError(t('forms.bookings.form.messages.selectServicePointError'));
      return;
    }
    
    if (!currentCategoryId) {
      setError(t('forms.bookings.form.messages.selectCategoryError'));
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
  }, [currentServicePointId, currentCategoryId, formik.values.booking_date, selectedDate, t]);

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
    } else {
      formik.setFieldValue('start_time', '');
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
          {isEditMode ? t('forms.bookings.form.editTitle') : t('forms.bookings.form.createTitle')}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={outlinedButtonStyles}
        >
          {t('common.back')}
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
            {t('forms.bookings.form.basicInfo')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.service_point_id && Boolean(formik.errors.service_point_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="service-point-label">{t('forms.bookings.form.servicePoint')}</InputLabel>
                <Select
                  labelId="service-point-label"
                  value={formik.values.service_point_id}
                  onChange={handleServicePointChange}
                  label={t('forms.bookings.form.servicePoint')}
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
                <InputLabel id="client-label">{t('forms.bookings.form.client')}</InputLabel>
                <Select
                  labelId="client-label"
                  value={formik.values.client_id || ''}
                  onChange={handleClientChange}
                  label={t('forms.bookings.form.client')}
                >
                  {/* ✅ Опция для гостевого бронирования */}
                  <MenuItem value="">
                    <em>{t('forms.bookings.form.guestBookingOption')}</em>
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
                <InputLabel id="car-type-label">{t('forms.bookings.form.carType')}</InputLabel>
                <Select
                  labelId="car-type-label"
                  value={formik.values.car_type_id}
                  onChange={handleCarTypeChange}
                  label={t('forms.bookings.form.carType')}
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
                <InputLabel id="category-label">{t('forms.bookings.form.category')}</InputLabel>
                <Select
                  labelId="category-label"
                  value={formik.values.category_id}
                  onChange={handleCategoryChange}
                  label={t('forms.bookings.form.category')}
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

            {/* Поле статуса бронирования (только для редактирования) */}
            {isEditMode && (
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.status_id && Boolean(formik.errors.status_id)}
                  sx={textFieldStyles}
                >
                  <InputLabel id="status-label">{t('forms.bookings.form.status')}</InputLabel>
                  <Select
                    labelId="status-label"
                    value={formik.values.status_id || ''}
                    onChange={handleStatusChange}
                    label={t('forms.bookings.form.status')}
                  >
                    {bookingStatusesData?.map((status) => (
                      <MenuItem key={status.key || status.id} value={status.key || status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status_id && formik.errors.status_id && (
                    <FormHelperText>{formik.errors.status_id as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: SIZES.spacing.md, mb: SIZES.spacing.sm }}>
                {t('forms.bookings.form.dateTimeSection')}
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
                  {t('forms.bookings.form.selectedDateTime')}
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
                        label={`🕐 ${formik.values.start_time}`}
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
                        {t('forms.bookings.form.changeDateTime')}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => {
                          formik.setFieldValue('booking_date', '');
                          formik.setFieldValue('start_time', '');
                          setSelectedDate(null);
                          setSelectedTimeSlot(null);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('common.clear')}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('forms.bookings.form.dateTimeNotSelected')}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpenTimePicker}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('forms.bookings.form.selectDateTime')}
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
                label={t('forms.bookings.form.notes')}
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
              {t('forms.bookings.form.serviceRecipientData')} {(!formik.values.client_id && t('forms.bookings.form.guestBooking'))}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('forms.bookings.form.firstName')}
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
                  label={t('forms.bookings.form.lastName')}
                  value={formik.values.service_recipient_last_name}
                  onChange={(e) => formik.setFieldValue('service_recipient_last_name', e.target.value)}
                  error={formik.touched.service_recipient_last_name && Boolean(formik.errors.service_recipient_last_name)}
                  helperText={formik.touched.service_recipient_last_name && formik.errors.service_recipient_last_name}
                  sx={textFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <PhoneField
                  label={t('forms.bookings.form.phone')}
                  value={formik.values.service_recipient_phone}
                  onChange={(value) => formik.setFieldValue('service_recipient_phone', value)}
                  error={formik.touched.service_recipient_phone && Boolean(formik.errors.service_recipient_phone)}
                  helperText={formik.touched.service_recipient_phone && formik.errors.service_recipient_phone}
                  required={!formik.values.client_id}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('forms.bookings.form.email')}
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
                  {t('forms.bookings.form.carData')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  error={formik.touched.car_brand && Boolean(formik.errors.car_brand)}
                  sx={textFieldStyles}
                >
                  <InputLabel>{t('forms.bookings.form.carBrand')}</InputLabel>
                  <Select
                    value={selectedBrandId?.toString() || ''}
                    onChange={handleCarBrandChange}
                    label={t('forms.bookings.form.carBrand')}
                    disabled={carBrandsLoading}
                  >
                    <MenuItem value="">
                      <em>{t('forms.bookings.form.selectCarBrand')}</em>
                    </MenuItem>
                    {carBrands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.car_brand && formik.errors.car_brand && (
                    <FormHelperText>{formik.errors.car_brand}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  error={formik.touched.car_model && Boolean(formik.errors.car_model)}
                  sx={textFieldStyles}
                  disabled={!selectedBrandId || carModelsLoading}
                >
                  <InputLabel>{t('forms.bookings.form.carModel')}</InputLabel>
                  <Select
                    value={carModels.find(m => m.name === formik.values.car_model)?.id?.toString() || ''}
                    onChange={handleCarModelChange}
                    label={t('forms.bookings.form.carModel')}
                    disabled={!selectedBrandId || carModelsLoading}
                  >
                    <MenuItem value="">
                      <em>{t('forms.bookings.form.selectCarModel')}</em>
                    </MenuItem>
                    {carModels.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.car_model && formik.errors.car_model && (
                    <FormHelperText>{formik.errors.car_model}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('forms.bookings.form.licensePlate')}
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
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting || loading}
            sx={buttonStyles}
          >
            {formik.isSubmitting || loading ? t('common.saving') : t('common.save')}
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
          {t('forms.bookings.form.selectDateTimeTitle')}
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
            isServiceUser={isServiceUser}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimePicker}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleConfirmTimeSelection}
            variant="contained"
            disabled={!selectedDate || !selectedTimeSlot}
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingFormPage;