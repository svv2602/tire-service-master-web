import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  FormHelperText,
  Grid,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useCreateBookingMutation, useUpdateBookingMutation } from '../../api/bookings.api';
import { User, UserRole } from '../../types';
import { BookingStatusEnum, BookingFormData as BookingFormDataType } from '../../types/booking';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { useGetCarsQuery } from '../../api/cars.api';
import { ServicePoint, Car, ApiResponse } from '../../types/models';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { SelectChangeEvent } from '@mui/material';

// Типы для формы бронирования
interface ServiceSelection {
  service_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  available: boolean;
}

// Схема валидации
const validationSchema = yup.object({
  service_point_id: yup.number().required('Выберите точку обслуживания'),
  car_id: yup.number().required('Выберите автомобиль'),
  scheduled_at: yup.date().required('Выберите дату и время'),
  services: yup.array().of(yup.number()).min(1, 'Выберите хотя бы одну услугу'),
  notes: yup.string(),
});

const BookingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  
  const isEditMode = !!id;
  
  // Состояния формы
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Данные бронирования
  const [clientId, setClientId] = useState<number | null>(null);
  const [servicePointId, setServicePointId] = useState<number | null>(null);
  const [carId, setCarId] = useState<number | null>(null);
  const [carTypeId, setCarTypeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<ServiceSelection[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Справочные данные
  const [clients, setClients] = useState<any[]>([]);
  const [servicePoints, setServicePoints] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [carTypes, setCarTypes] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // RTK Query хуки
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery({} as any);
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({} as any);
  
  const isLoading = servicePointsLoading || carsLoading || loading || saving;
  
  // Загрузка справочных данных при монтировании компонента
  useEffect(() => {
    const fetchReferenceData = async () => {
      setLoading(true);
      try {
        // Здесь должны быть запросы к API для загрузки справочных данных
        // Временно используем моковые данные
        
        // Клиенты
        setClients([
          { id: 1, name: 'Иван Петренко', phone: '+380 67 123 45 67' },
          { id: 2, name: 'Мария Коваленко', phone: '+380 50 222 33 44' },
          { id: 3, name: 'Алексей Шевченко', phone: '+380 63 555 66 77' },
        ]);
        
        // Сервисные точки
        setServicePoints([
          { id: 1, name: 'ШиноСервис Экспресс - Киев', address: 'ул. Киевская, 1' },
          { id: 2, name: 'АвтоШина Плюс - Львов', address: 'ул. Львовская, 10' },
          { id: 3, name: 'ШинМайстер - Одесса', address: 'ул. Одесская, 5' },
        ]);
        
        // Автомобили
        setCars([
          { id: 1, brand: 'Toyota', model: 'Camry', number: 'АА1234КК', client_id: 1 },
          { id: 2, brand: 'Honda', model: 'Civic', number: 'ВН5678ІК', client_id: 2 },
          { id: 3, brand: 'BMW', model: 'X5', number: 'КА9999ХХ', client_id: 3 },
        ]);
        
        // Типы автомобилей
        setCarTypes([
          { id: 1, name: 'Легковой' },
          { id: 2, name: 'Кроссовер/SUV' },
          { id: 3, name: 'Внедорожник' },
        ]);
        
        // Доступные услуги
        setAvailableServices([
          { id: 1, name: 'Замена шин', price: 400 },
          { id: 2, name: 'Балансировка', price: 200 },
          { id: 3, name: 'Ремонт диска', price: 600 },
          { id: 4, name: 'Подкачка шин', price: 100 },
        ]);
        
        // Загружаем данные о существующем бронировании при редактировании
        if (isEditMode) {
          // Здесь должен быть запрос к API для загрузки данных бронирования
          // Временно используем моковые данные
          const mockBooking = {
            id: parseInt(id!),
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
          setClientId(mockBooking.client_id);
          setServicePointId(mockBooking.service_point_id);
          setCarId(mockBooking.car_id);
          setCarTypeId(mockBooking.car_type_id);
          setSelectedDate(new Date(mockBooking.booking_date));
          setSelectedTimeSlot({
            id: 1,
            start_time: mockBooking.start_time,
            end_time: mockBooking.end_time,
            available: true,
          });
          setNotes(mockBooking.notes);
          setServices(mockBooking.services);
          
          // Обновляем общую стоимость
          updateTotalPrice(mockBooking.services);
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте снова позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferenceData();
  }, [id, isEditMode]);
  
  // Загрузка временных слотов при выборе даты и сервисной точки
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !servicePointId) return;
      
      try {
        // Здесь должен быть запрос к API для загрузки доступных слотов
        // Временно используем моковые данные
        const mockSlots: TimeSlot[] = [
          { id: 1, start_time: '10:00', end_time: '11:00', available: true },
          { id: 2, start_time: '11:00', end_time: '12:00', available: true },
          { id: 3, start_time: '12:00', end_time: '13:00', available: false },
          { id: 4, start_time: '13:00', end_time: '14:00', available: true },
          { id: 5, start_time: '14:00', end_time: '15:00', available: true },
          { id: 6, start_time: '15:00', end_time: '16:00', available: false },
          { id: 7, start_time: '16:00', end_time: '17:00', available: true },
        ];
        
        setTimeSlots(mockSlots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Не удалось загрузить доступные временные слоты.');
      }
    };
    
    fetchTimeSlots();
  }, [selectedDate, servicePointId]);
  
  // Обновление общей стоимости при изменении услуг
  const updateTotalPrice = (servicesList: ServiceSelection[]) => {
    const total = servicesList.reduce((sum, service) => {
      return sum + (service.price * service.quantity);
    }, 0);
    
    setTotalPrice(total);
  };
  
  // Добавление услуги
  const handleAddService = () => {
    // Добавляем первую доступную услугу, которой еще нет в списке
    const unusedServices = availableServices.filter(
      service => !services.some(s => s.service_id === service.id)
    );
    
    if (unusedServices.length > 0) {
      const newService: ServiceSelection = {
        service_id: unusedServices[0].id,
        name: unusedServices[0].name,
        price: unusedServices[0].price,
        quantity: 1,
      };
      
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      updateTotalPrice(updatedServices);
    }
  };
  
  // Удаление услуги
  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
    updateTotalPrice(updatedServices);
  };
  
  // Изменение услуги
  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...services];
    
    if (field === 'service_id') {
      // Если меняется сама услуга, обновляем название и цену
      const serviceInfo = availableServices.find(s => s.id === value);
      if (serviceInfo) {
        updatedServices[index] = {
          ...updatedServices[index],
          service_id: value,
          name: serviceInfo.name,
          price: serviceInfo.price,
        };
      }
    } else {
      // Иначе просто обновляем поле
      (updatedServices[index] as any)[field] = value;
    }
    
    setServices(updatedServices);
    updateTotalPrice(updatedServices);
  };
  
  // Фильтрация автомобилей по выбранному клиенту
  const getFilteredCars = () => {
    if (!clientId) return [];
    return cars.filter(car => car.client_id === clientId);
  };
  
  const formik = useFormik({
    initialValues: {
      service_point_id: '',
      car_id: '',
      scheduled_at: new Date(),
      services: [] as number[],
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          await updateBooking({ 
            id: id.toString(), 
            booking: {
              client_id: '1', // TODO: получить из контекста
              service_point_id: values.service_point_id,
              car_type_id: '1', // TODO: получить из формы
              scheduled_at: values.scheduled_at.toISOString(),
              status: BookingStatusEnum.PENDING,
            }
          }).unwrap();
        } else {
          await createBooking({
            client_id: '1', // TODO: получить из контекста
            service_point_id: values.service_point_id,
            car_type_id: '1', // TODO: получить из формы
            scheduled_at: values.scheduled_at.toISOString(),
            status: BookingStatusEnum.PENDING,
          }).unwrap();
        }
        
        setSuccess('Бронирование успешно сохранено');
        navigate('/bookings');
      } catch (err) {
        setError('Ошибка при сохранении бронирования');
      }
    },
  });

  const handleServicePointChange = (event: SelectChangeEvent<string>) => {
    formik.setFieldValue('service_point_id', event.target.value);
  };

  const handleCarChange = (event: SelectChangeEvent<string>) => {
    formik.setFieldValue('car_id', event.target.value);
  };

  const handleDateTimeChange = (date: Date | null) => {
    if (date) {
      formik.setFieldValue('scheduled_at', date);
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('notes', event.target.value);
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование бронирования' : 'Новое бронирование'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/bookings')}
        >
          Назад к списку
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Основная информация
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.service_point_id && Boolean(formik.errors.service_point_id)}>
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
              <FormControl fullWidth error={formik.touched.car_id && Boolean(formik.errors.car_id)}>
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
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
            onClick={() => navigate('/bookings')}
          >
            Отмена
                        </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default BookingFormPage;