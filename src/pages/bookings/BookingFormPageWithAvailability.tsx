// pages/bookings/BookingFormPageWithAvailability.tsx
// Форма бронирования с интеграцией динамической системы доступности

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Card,
  CardContent,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useCreateBookingMutation, useUpdateBookingMutation } from '../../api/bookings.api';
import { useGetServicePointsQuery } from '../../api/servicePoints.api';
import { AvailabilitySelector } from '../../components/availability';
import { getTablePageStyles } from '../../styles/components';
import { useTheme } from '@mui/material';

// Типы для формы
interface ServiceSelection {
  service_id: number;
  name: string;
  price: number;
  quantity: number;
}

// Промежуточный интерфейс для состояния формы (с опциональными полями)
interface BookingFormState {
  client_id: number | undefined;
  service_point_id: number | undefined;
  car_id: number | undefined;
  car_type_id: number | undefined;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  services: ServiceSelection[];
}

const BookingFormPageWithAvailability: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  
  const isEditMode = !!id;
  
  // Состояния формы
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Основные данные формы
  const [formData, setFormData] = useState<BookingFormState>({
    client_id: undefined,
    service_point_id: undefined,
    car_id: undefined,
    car_type_id: undefined,
    booking_date: '',
    start_time: '',
    end_time: '',
    notes: '',
    services: []
  });
  
  // Состояния для доступности
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60); // минуты
  
  // Справочные данные
  const [clients, setClients] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // RTK Query
  const { data: servicePointsData, isLoading: servicePointsLoading } = useGetServicePointsQuery();
  
  // Мемоизированные моковые данные
  const mockClients = useMemo(() => [
    { id: 1, name: t('forms.bookings.mockData.clients.ivan'), phone: '+380 67 123 45 67' },
    { id: 2, name: t('forms.bookings.mockData.clients.maria'), phone: '+380 50 222 33 44' },
    { id: 3, name: t('forms.bookings.mockData.clients.alex'), phone: '+380 63 555 66 77' },
  ], [t]);
  
  const mockCars = useMemo(() => [
    { id: 1, brand: 'Toyota', model: 'Camry', number: 'АА1234КК', client_id: 1 },
    { id: 2, brand: 'Honda', model: 'Civic', number: 'ВН5678ІК', client_id: 2 },
    { id: 3, brand: 'BMW', model: 'X5', number: 'КА9999ХХ', client_id: 3 },
  ], []);
  
  const mockAvailableServices = useMemo(() => [
    { id: 1, name: t('forms.bookings.mockData.services.tireChange'), price: 400, duration: 30 },
    { id: 2, name: t('forms.bookings.mockData.services.balancing'), price: 200, duration: 15 },
    { id: 3, name: t('forms.bookings.mockData.services.rimRepair'), price: 600, duration: 45 },
    { id: 4, name: t('forms.bookings.mockData.services.tirePump'), price: 100, duration: 10 },
  ], [t]);

  // Инициализация моковых данных
  useEffect(() => {
    setClients(mockClients);
    setCars(mockCars);
    setAvailableServices(mockAvailableServices);
  }, [mockClients, mockCars, mockAvailableServices]);

  // Расчет общей продолжительности услуг
  useEffect(() => {
    const totalDuration = formData.services.reduce((sum, service) => {
      const serviceData = availableServices.find(s => s.id === service.service_id);
      return sum + (serviceData?.duration || 15) * service.quantity;
    }, 0);
    
    setEstimatedDuration(Math.max(totalDuration, 30)); // минимум 30 минут
  }, [formData.services, availableServices]);

  // Расчет общей стоимости
  useEffect(() => {
    const total = formData.services.reduce((sum, service) => {
      return sum + (service.price * service.quantity);
    }, 0);
    setTotalPrice(total);
  }, [formData.services]);

  // Обработка изменений даты и времени
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const endTime = calculateEndTime(selectedTime, estimatedDuration);
      
      setFormData(prev => ({
        ...prev,
        booking_date: dateString,
        start_time: selectedTime,
        end_time: endTime
      }));
    }
  }, [selectedDate, selectedTime, estimatedDuration]);

  // Вычисление времени окончания
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + durationMinutes);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Обработчик изменения сервисной точки
  const handleServicePointChange = (servicePointId: number) => {
    setFormData(prev => ({ ...prev, service_point_id: servicePointId }));
    // Сбрасываем выбранную дату/время при смене точки
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Обработчик добавления услуги
  const handleAddService = (serviceId: number) => {
    const serviceData = availableServices.find(s => s.id === serviceId);
    if (!serviceData) return;

    const existingService = formData.services.find(s => s.service_id === serviceId);
    
    if (existingService) {
      // Увеличиваем количество
      setFormData(prev => ({
        ...prev,
        services: prev.services.map(s => 
          s.service_id === serviceId 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      }));
    } else {
      // Добавляем новую услугу
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, {
          service_id: serviceId,
          name: serviceData.name,
          price: serviceData.price,
          quantity: 1
        }]
      }));
    }
  };

  // Обработчик удаления услуги
  const handleRemoveService = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.service_id !== serviceId)
    }));
  };

  // Валидация формы
  const isFormValid = (): boolean => {
    return !!(
      formData.client_id &&
      formData.service_point_id &&
      formData.car_id &&
      formData.booking_date &&
      formData.start_time &&
      formData.services.length > 0
    );
  };

  // Обработчик сохранения
  const handleSave = async () => {
    if (!isFormValid()) {
      setError(t('forms.common.fillAllRequiredFields'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Преобразуем данные формы в формат API
      const bookingData = {
        client_id: formData.client_id!,
        service_point_id: formData.service_point_id!,
        car_id: formData.car_id!,
        car_type_id: formData.car_type_id,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        services: formData.services.map(s => ({
          service_id: s.service_id,
          quantity: s.quantity,
          price: s.price
        })),
        status_id: 'pending', // статус "Новое" - теперь строка
        total_price: totalPrice.toString() // API ожидает строку
      };

      if (isEditMode && id) {
        await updateBooking({ id, booking: bookingData }).unwrap();
        setSuccess(t('forms.bookings.form.messages.bookingUpdatedSuccess'));
      } else {
        await createBooking(bookingData).unwrap();
        setSuccess(t('forms.bookings.form.messages.bookingCreatedSuccess'));
      }
      
      // Перенаправление через 2 секунды
      setTimeout(() => {
        navigate('/admin/bookings');
      }, 2000);
      
    } catch (err: any) {
      console.error('Ошибка при сохранении:', err);
      setError(err?.data?.message || t('forms.bookings.form.messages.bookingSaveErrorText'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/bookings');
  };

  const isLoading = servicePointsLoading;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4">
          {isEditMode ? t('forms.bookings.form.editTitle') : t('forms.bookings.form.createTitle')}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          {t('common.back')}
        </Button>
      </Box>

      {/* Сообщения */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Левая колонка - основная информация */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('forms.bookings.form.basicInfo')}
            </Typography>
            
            <Grid container spacing={2}>
              {/* Клиент */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('forms.bookings.form.client')}</InputLabel>
                  <Select
                    value={formData.client_id || ''}
                    label={t('forms.bookings.form.client')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      client_id: Number(e.target.value) || undefined
                    }))}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name} ({client.phone})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Автомобиль */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('forms.bookings.form.carInfo')}</InputLabel>
                  <Select
                    value={formData.car_id || ''}
                    label={t('forms.bookings.form.carInfo')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      car_id: Number(e.target.value) || undefined
                    }))}
                  >
                    {cars.filter(car => car.client_id === formData.client_id).map((car) => (
                      <MenuItem key={car.id} value={car.id}>
                        {car.brand} {car.model} ({car.number})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Сервисная точка */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('forms.bookings.form.servicePoint')}</InputLabel>
                  <Select
                    value={formData.service_point_id || ''}
                    label={t('forms.bookings.form.servicePoint')}
                    onChange={(e) => handleServicePointChange(Number(e.target.value) || 0)}
                  >
                    {servicePointsData?.data.map((point: any) => (
                      <MenuItem key={point.id} value={point.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {point.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {point.address}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Примечания */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('forms.bookings.form.notes')}
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Выбор услуг */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('forms.bookings.form.services')}
            </Typography>
            
            <Grid container spacing={2}>
              {availableServices.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 }
                    }}
                    onClick={() => handleAddService(service.id)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.price} грн • {service.duration} мин
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Выбранные услуги */}
            {formData.services.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('forms.bookings.selectedServices')}:
                </Typography>
                {formData.services.map((service) => (
                  <Chip
                    key={service.service_id}
                    label={`${service.name} x${service.quantity} = ${service.price * service.quantity} грн`}
                    onDelete={() => handleRemoveService(service.service_id)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                  {t('forms.bookings.total')}: {totalPrice} грн • {t('forms.bookings.time')}: {estimatedDuration} мин
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Выбор времени */}
          {formData.service_point_id && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon />
                {t('forms.bookings.timeSelection')}
              </Typography>
              
              <AvailabilitySelector
                servicePointId={formData.service_point_id}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTimeSlot={selectedTime}
                onTimeSlotChange={setSelectedTime}
                availableTimeSlots={[
                  { time: '09:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '10:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '11:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '12:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '13:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '14:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '15:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '16:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '17:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 },
                  { time: '18:00', available_posts: 1, total_posts: 1, can_book: true, duration_minutes: 30 }
                ]}
                isLoading={isLoading}
              />
            </Paper>
          )}
        </Grid>

        {/* Правая колонка - сводка */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              {t('forms.bookings.bookingSummary')}
            </Typography>
            
            <Box sx={{ space: 2 }}>
              {formData.client_id && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('forms.bookings.form.client')}:
                  </Typography>
                  <Typography variant="body2">
                    {clients.find(c => c.id === formData.client_id)?.name}
                  </Typography>
                </Box>
              )}

              {formData.service_point_id && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('forms.bookings.form.servicePoint')}:
                  </Typography>
                  <Typography variant="body2">
                    {servicePointsData?.data.find((p: any) => p.id === formData.service_point_id)?.name}
                  </Typography>
                </Box>
              )}

              {selectedDate && selectedTime && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('forms.bookings.dateAndTime')}:
                  </Typography>
                  <Typography variant="body2">
                    {selectedDate.toLocaleDateString('ru-RU')} в {selectedTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('forms.bookings.duration')}: {estimatedDuration} мин
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('forms.bookings.total')}:
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {totalPrice} грн
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!isFormValid() || saving}
              >
                {saving ? t('common.saving') : (isEditMode ? t('forms.bookings.form.update') : t('forms.bookings.form.create'))}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingFormPageWithAvailability; 