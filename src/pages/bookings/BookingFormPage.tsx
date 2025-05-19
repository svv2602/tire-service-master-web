import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Chip,
  FormHelperText,
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
import { bookingsApi, Booking, BookingService } from '../../api/bookings';
import { UserRole } from '../../types';

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

const BookingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
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
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!clientId || !servicePointId || !carId || !carTypeId || !selectedDate || !selectedTimeSlot) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (services.length === 0) {
      setError('Добавьте хотя бы одну услугу');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Подготовка данных для отправки
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const bookingData: Partial<Booking> = {
        client_id: clientId,
        service_point_id: servicePointId,
        car_id: carId,
        car_type_id: carTypeId,
        booking_date: formattedDate,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        notes: notes,
        total_price: totalPrice,
      };
      
      // Подготовка данных услуг
      const bookingServices: Partial<BookingService>[] = services.map(service => ({
        service_id: service.service_id,
        price: service.price,
        quantity: service.quantity,
      }));
      
      // Отправка данных на сервер
      let response;
      if (isEditMode) {
        // Обновление существующего бронирования
        response = await bookingsApi.update(parseInt(id!), bookingData, bookingServices);
        setSuccess('Бронирование успешно обновлено');
      } else {
        // Создание нового бронирования
        response = await bookingsApi.create(bookingData, bookingServices);
        setSuccess('Бронирование успешно создано');
      }
      
      // Переход к списку бронирований после короткой задержки
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error) {
      console.error('Error saving booking:', error);
      setError('Не удалось сохранить бронирование. Пожалуйста, попробуйте снова.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
      
      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Основная информация
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Клиент */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <FormControl fullWidth required>
                <InputLabel id="client-label">Клиент</InputLabel>
                <Select
                  labelId="client-label"
                  value={clientId || ''}
                  onChange={(e) => setClientId(e.target.value as number)}
                  label="Клиент"
                  disabled={user?.role === UserRole.CLIENT}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} ({client.phone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Сервисная точка */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <FormControl fullWidth required>
                <InputLabel id="service-point-label">Точка обслуживания</InputLabel>
                <Select
                  labelId="service-point-label"
                  value={servicePointId || ''}
                  onChange={(e) => setServicePointId(e.target.value as number)}
                  label="Точка обслуживания"
                >
                  {servicePoints.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name} ({point.address})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Автомобиль */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <FormControl fullWidth required>
                <InputLabel id="car-label">Автомобиль</InputLabel>
                <Select
                  labelId="car-label"
                  value={carId || ''}
                  onChange={(e) => setCarId(e.target.value as number)}
                  label="Автомобиль"
                  disabled={!clientId}
                >
                  {getFilteredCars().map((car) => (
                    <MenuItem key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.number})
                    </MenuItem>
                  ))}
                </Select>
                {!clientId && (
                  <FormHelperText>Сначала выберите клиента</FormHelperText>
                )}
              </FormControl>
            </Box>
            
            {/* Тип автомобиля */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <FormControl fullWidth required>
                <InputLabel id="car-type-label">Тип автомобиля</InputLabel>
                <Select
                  labelId="car-type-label"
                  value={carTypeId || ''}
                  onChange={(e) => setCarTypeId(e.target.value as number)}
                  label="Тип автомобиля"
                >
                  {carTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Дата */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дата*"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                  disablePast
                />
              </LocalizationProvider>
            </Box>
            
            {/* Временной слот */}
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
              <FormControl fullWidth required>
                <InputLabel id="time-slot-label">Время</InputLabel>
                <Select
                  labelId="time-slot-label"
                  value={selectedTimeSlot?.id || ''}
                  onChange={(e) => {
                    const slot = timeSlots.find(s => s.id === e.target.value);
                    setSelectedTimeSlot(slot || null);
                  }}
                  label="Время"
                  disabled={!selectedDate || !servicePointId || timeSlots.length === 0}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem 
                      key={slot.id} 
                      value={slot.id}
                      disabled={!slot.available}
                    >
                      {slot.start_time} - {slot.end_time}
                      {!slot.available && ' (Занято)'}
                    </MenuItem>
                  ))}
                </Select>
                {(!selectedDate || !servicePointId) && (
                  <FormHelperText>Сначала выберите дату и точку обслуживания</FormHelperText>
                )}
              </FormControl>
            </Box>
            
            {/* Примечания */}
            <Box sx={{ width: '100%' }}>
              <TextField
                label="Примечания"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />
            </Box>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Услуги
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddService}
              disabled={availableServices.length === services.length}
            >
              Добавить услугу
            </Button>
          </Box>
          
          {services.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              Добавьте услуги для бронирования
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {services.map((service, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                        <FormControl fullWidth>
                          <InputLabel id={`service-label-${index}`}>Услуга</InputLabel>
                          <Select
                            labelId={`service-label-${index}`}
                            value={service.service_id}
                            onChange={(e) => handleServiceChange(index, 'service_id', e.target.value)}
                            label="Услуга"
                          >
                            {availableServices.map((availableService) => (
                              <MenuItem 
                                key={availableService.id} 
                                value={availableService.id}
                                disabled={services.some(s => 
                                  s.service_id === availableService.id && s !== service
                                )}
                              >
                                {availableService.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box sx={{ width: { xs: '48%', md: 'calc(25% - 16px)' } }}>
                        <TextField
                          label="Количество"
                          type="number"
                          InputProps={{ inputProps: { min: 1 } }}
                          value={service.quantity}
                          onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value))}
                          fullWidth
                        />
                      </Box>
                      
                      <Box sx={{ width: { xs: '48%', md: 'calc(25% - 16px)' } }}>
                        <TextField
                          label="Цена"
                          type="number"
                          InputProps={{ inputProps: { min: 0 }, readOnly: true }}
                          value={service.price}
                          fullWidth
                        />
                      </Box>
                      
                      <Box sx={{ width: { xs: '48%', md: 'calc(10% - 16px)' } }}>
                        <Typography variant="body1" fontWeight="bold">
                          {service.price * service.quantity} ₴
                        </Typography>
                      </Box>
                      
                      <Box sx={{ width: { xs: '48%', md: 'calc(10% - 16px)' }, textAlign: 'right' }}>
                        <Button
                          color="error"
                          onClick={() => handleRemoveService(index)}
                        >
                          <DeleteIcon />
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6">
              Итого: {totalPrice} ₴
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            disabled={saving}
            sx={{ minWidth: 200 }}
          >
            {saving ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditMode ? (
              'Сохранить изменения'
            ) : (
              'Создать бронирование'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default BookingFormPage; 