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
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useCreateBookingMutation, useUpdateBookingMutation } from '../../api/bookings.api';
import { 
  BookingStatusEnum, 
  BookingService
} from '../../types/booking';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { useGetCarsQuery } from '../../api/cars.api';
import { ServicePoint, ApiResponse } from '../../types/models';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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

// Схема валидации для формы бронирования
const validationSchema = yup.object({
  service_point_id: yup.number().required('Выберите точку обслуживания'),
  car_id: yup.number().required('Выберите автомобиль'),
  scheduled_at: yup.date().required('Выберите дату и время'),
  services: yup.array().of(yup.number()).min(1, 'Выберите хотя бы одну услугу'),
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
  
  // Данные бронирования для обработки услуг (пока не используется в форме, но может понадобиться)
  const [services, setServices] = useState<ServiceSelection[]>([]);
  
  // RTK Query хуки
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({} as any);
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({} as any);
  
  const isLoading = servicePointsLoading || carsLoading || loading;

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => ({
    service_point_id: '',
    car_id: '',
    scheduled_at: new Date(),
    services: [] as BookingService[],
    notes: '',
  }), []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          await updateBooking({ 
            id: id.toString(), 
            booking: {
              client_id: 1, // TODO: получить из контекста
              service_point_id: Number(values.service_point_id),
              car_id: Number(values.car_id),
              car_type_id: 1, // TODO: получить из формы
              booking_date: values.scheduled_at.toISOString().split('T')[0],
              start_time: values.scheduled_at.toISOString(),
              end_time: new Date(values.scheduled_at.getTime() + 60 * 60 * 1000).toISOString(),
              status_id: BookingStatusEnum.PENDING,
              notes: values.notes || '',
              services: services.map(service => ({
                service_id: service.service_id,
                quantity: service.quantity,
                price: service.price
              }))
            }
          }).unwrap();
        } else {
          await createBooking({
            client_id: 1, // TODO: получить из контекста
            service_point_id: Number(values.service_point_id),
            car_id: Number(values.car_id),
            car_type_id: 1, // TODO: получить из формы
            booking_date: values.scheduled_at.toISOString().split('T')[0],
            start_time: values.scheduled_at.toISOString(),
            end_time: new Date(values.scheduled_at.getTime() + 60 * 60 * 1000).toISOString(),
            status_id: BookingStatusEnum.PENDING,
            notes: values.notes || '',
            services: services.map(service => ({
              service_id: service.service_id,
              quantity: service.quantity,
              price: service.price
            }))
          }).unwrap();
        }
        
        setSuccess('Бронирование успешно сохранено');
        navigate('/bookings');
      } catch (err) {
        setError('Ошибка при сохранении бронирования');
      }
    },
  });

  // Загрузка справочных данных при монтировании компонента
  useEffect(() => {
    const fetchReferenceData = async () => {
      setLoading(true);
      try {
        // Загружаем данные о существующем бронировании при редактировании
        if (isEditMode && id) {
          // Здесь должен быть запрос к API для загрузки данных бронирования
          // Временно используем моковые данные
          const mockBooking = {
            id: parseInt(id),
            client_id: 1,
            service_point_id: 1,
            car_id: 1,
            car_type_id: 1,
            booking_date: '2023-07-15',
            start_time: '14:30',
            end_time: '15:30',
            notes: 'Примечание к бронированию',
            services: [
              { service_id: 1, name: 'Замена шин', price: 400, quantity: 4 },
              { service_id: 2, name: 'Балансировка', price: 200, quantity: 4 },
            ],
          };
          
          // Заполняем форму данными
          formik.setFieldValue('service_point_id', mockBooking.service_point_id);
          formik.setFieldValue('car_id', mockBooking.car_id);
          formik.setFieldValue('scheduled_at', new Date(mockBooking.booking_date));
          formik.setFieldValue('notes', mockBooking.notes);
          setServices(mockBooking.services);
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте снова позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferenceData();
  }, [id, isEditMode, formik]);
  
  // Загрузка временных слотов при выборе даты и сервисной точки (упрощенная версия)
  useEffect(() => {
    // Этот useEffect можно расширить для загрузки реальных временных слотов
    // когда будет добавлена соответствующая функциональность
  }, []);

  // Мемоизированные обработчики
  const handleServicePointChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('service_point_id', event.target.value);
  }, [formik]);

  const handleCarChange = useCallback((event: SelectChangeEvent<string>) => {
    formik.setFieldValue('car_id', event.target.value);
  }, [formik]);

  const handleDateTimeChange = useCallback((date: Date | null) => {
    if (date) {
      formik.setFieldValue('scheduled_at', date);
    }
  }, [formik]);

  const handleNotesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('notes', event.target.value);
  }, [formik]);

  const handleBack = useCallback(() => {
    navigate('/bookings');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/bookings');
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
          
          <Grid container spacing={SIZES.spacing.lg}>
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
                  {(servicePointsData as ApiResponse<ServicePoint>)?.data?.map((point: ServicePoint) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
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
                  {carsData?.map((car: any) => (
                    <MenuItem key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.license_plate})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Дата и время"
                value={formik.values.scheduled_at}
                onChange={handleDateTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.scheduled_at && Boolean(formik.errors.scheduled_at),
                    helperText: formik.touched.scheduled_at && formik.errors.scheduled_at ? String(formik.errors.scheduled_at) : '',
                    sx: textFieldStyles,
                  },
                }}
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
            disabled={formik.isSubmitting}
            sx={buttonStyles}
          >
            {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default BookingFormPage;