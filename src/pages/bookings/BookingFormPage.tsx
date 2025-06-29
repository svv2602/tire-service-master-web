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
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useCreateBookingMutation, useUpdateBookingMutation, useGetBookingByIdQuery } from '../../api/bookings.api';
import { 
  BookingStatusEnum, 
  BookingService,
  BookingFormData,
  BookingServiceDetails
} from '../../types/booking';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { useGetCarsQuery } from '../../api/cars.api';
import { useGetClientsQuery } from '../../api/clients.api';
import { useGetCarTypesQuery } from '../../api/carTypes.api';
import { ServicePoint } from '../../types/models';
import { Client } from '../../types/client';
import { Car, CarType } from '../../types/car';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { SelectChangeEvent } from '@mui/material';

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
  car_id: string | null;
  car_type_id: string;
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
  client_id: yup.number().required('Выберите клиента'),
  car_id: yup.number().nullable(),
  car_type_id: yup.number().required('Выберите тип автомобиля'),
  booking_date: yup.string().required('Выберите дату'),
  start_time: yup.string().required('Выберите время начала'),
  end_time: yup.string().required('Выберите время окончания'),
  notes: yup.string(),
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
  
  // RTK Query хуки
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({} as any);
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({} as any);
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({} as any);
  const { data: carTypesData, isLoading: carTypesLoading } = useGetCarTypesQuery();
  const { data: bookingData, isLoading: bookingLoading } = useGetBookingByIdQuery(id || '', { skip: !isEditMode });
  
  const isLoading = servicePointsLoading || carsLoading || clientsLoading || carTypesLoading || (isEditMode && bookingLoading) || loading;

  // Функция для расчета времени окончания (по умолчанию +1 час)
  const calculateEndTime = (startDate: Date): string => {
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return endDate.toTimeString().substring(0, 5);
  };

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => ({
    service_point_id: '',
    client_id: '',
    car_id: '',
    car_type_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: new Date().toTimeString().substring(0, 5),
    end_time: calculateEndTime(new Date()),
    status_id: BookingStatusEnum.PENDING,
    notes: '',
    services: [] as BookingService[],
    total_price: '0',
    // Поля получателя услуги (опционально для админской формы)
    service_recipient_first_name: '',
    service_recipient_last_name: '',
    service_recipient_phone: '',
    service_recipient_email: '',
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
          client_id: Number(values.client_id),
          service_point_id: Number(values.service_point_id),
          car_id: values.car_id ? Number(values.car_id) : null,
          car_type_id: Number(values.car_type_id),
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
          // Поля получателя услуги для админской формы (опционально)
          service_recipient_first_name: values.service_recipient_first_name || '',
          service_recipient_last_name: values.service_recipient_last_name || '',
          service_recipient_phone: values.service_recipient_phone || '',
          service_recipient_email: values.service_recipient_email || ''
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
      const booking = bookingData as unknown as BookingDetails;
      
      formik.setFieldValue('service_point_id', booking.service_point_id);
      formik.setFieldValue('client_id', booking.client_id);
      formik.setFieldValue('car_id', booking.car_id);
      formik.setFieldValue('car_type_id', booking.car_type_id);
      formik.setFieldValue('booking_date', booking.booking_date);
      formik.setFieldValue('start_time', booking.start_time);
      formik.setFieldValue('end_time', booking.end_time);
      formik.setFieldValue('status_id', booking.status_id);
      formik.setFieldValue('notes', booking.notes || '');
      
      // Загрузка услуг бронирования, если они есть
      if (booking.booking_services && booking.booking_services.length > 0) {
        const loadedServices = booking.booking_services.map(bs => ({
          service_id: bs.service_id,
          name: bs.service_name,
          price: bs.price,
          quantity: bs.quantity
        }));
        setServices(loadedServices);
      }
    }
  }, [isEditMode, bookingData, formik]);

  // Мемоизированные обработчики
  const handleServicePointChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('service_point_id', event.target.value);
  }, [formik]);

  const handleClientChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('client_id', event.target.value);
  }, [formik]);

  const handleCarChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('car_id', event.target.value);
  }, [formik]);

  const handleCarTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('car_type_id', event.target.value);
  }, [formik]);

  const handleStartTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = event.target.value;
    formik.setFieldValue('start_time', startTime);
    
    // Автоматически устанавливаем время окончания (+1 час)
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours + 1, minutes);
      formik.setFieldValue('end_time', endDate.toTimeString().substring(0, 5));
    }
  }, [formik]);

  const handleEndTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('end_time', event.target.value);
  }, [formik]);

  const handleNotesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('notes', event.target.value);
  }, [formik]);

  const handleBack = useCallback(() => {
    navigate('/admin/bookings');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/admin/bookings');
  }, [navigate]);
  
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
                  value={formik.values.client_id}
                  onChange={handleClientChange}
                  label="Клиент"
                >
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
                error={formik.touched.car_id && Boolean(formik.errors.car_id)}
                sx={textFieldStyles}
              >
                <InputLabel id="car-label">Автомобиль</InputLabel>
                <Select
                  labelId="car-label"
                  value={formik.values.car_id}
                  onChange={handleCarChange}
                  label="Автомобиль"
                >
                  <MenuItem value="">
                    <em>Не выбран</em>
                  </MenuItem>
                  {carsData?.map((car: Car) => (
                    <MenuItem key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.license_plate || 'Без номера'})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.car_id && formik.errors.car_id && (
                  <FormHelperText>{formik.errors.car_id as string}</FormHelperText>
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
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: SIZES.spacing.md, mb: SIZES.spacing.sm }}>
                Дата и время
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Дата"
                type="date"
                value={formik.values.booking_date}
                onChange={(e) => formik.setFieldValue('booking_date', e.target.value)}
                error={formik.touched.booking_date && Boolean(formik.errors.booking_date)}
                helperText={formik.touched.booking_date && formik.errors.booking_date}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Время начала"
                type="time"
                value={formik.values.start_time}
                onChange={handleStartTimeChange}
                error={formik.touched.start_time && Boolean(formik.errors.start_time)}
                helperText={formik.touched.start_time && formik.errors.start_time}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Время окончания"
                type="time"
                value={formik.values.end_time}
                onChange={handleEndTimeChange}
                error={formik.touched.end_time && Boolean(formik.errors.end_time)}
                helperText={formik.touched.end_time && formik.errors.end_time}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
              />
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
    </Box>
  );
};

export default BookingFormPage;