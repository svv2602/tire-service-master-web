import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MonetizationOn as PriceIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import { useGetServicesQuery } from '../../../api/servicesList.api';
import type { ServicePointFormDataNew, ServicePointService, ServicePoint } from '../../../types/models';
import type { Service } from '../../../types/service';

interface ServicesStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Загружаем список всех доступных услуг
  const { data: servicesResponse, isLoading: servicesLoading } = useGetServicesQuery({});
  const availableServices = servicesResponse?.data || [];

  // Получаем услуги из формы (исключая помеченные для удаления)
  const activeServices = formik.values.services?.filter(service => !service._destroy) || [];

  // Функция получения доступных услуг для выбора (исключаем уже выбранные)
  const getAvailableServicesForSelection = useMemo(() => {
    const selectedServiceIds = activeServices.map(s => s.service_id).filter(id => id > 0);
    return availableServices.filter(service => !selectedServiceIds.includes(service.id));
  }, [availableServices, activeServices]);

  // Функция добавления новой услуги
  const addNewService = () => {
    if (getAvailableServicesForSelection.length === 0) {
      return; // Нет доступных услуг для добавления
    }

    const newService: ServicePointService = {
      service_id: 0, // Будет выбрано пользователем
      price: 0,
      duration: 30,
      is_available: true,
    };
    
    formik.setFieldValue('services', [
      ...(formik.values.services || []), 
      newService
    ]);
  };

  // Функция удаления услуги
  const removeService = (index: number) => {
    const updatedServices = [...(formik.values.services || [])];
    const serviceToRemove = updatedServices[index];
    
    // Если услуга имеет реальный ID (существует в БД), помечаем для удаления
    if ((serviceToRemove as any).id && (serviceToRemove as any).id > 0) {
      updatedServices[index] = { ...serviceToRemove, _destroy: true };
    } else {
      // Для новых услуг без ID просто удаляем из массива
      updatedServices.splice(index, 1);
    }
    
    formik.setFieldValue('services', updatedServices);
  };

  // Функция обновления услуги
  const updateService = (index: number, field: keyof ServicePointService, value: any) => {
    const updatedServices = [...(formik.values.services || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    // Если выбрана новая услуга, устанавливаем её базовую длительность
    if (field === 'service_id') {
      const selectedService = availableServices.find(s => s.id === value);
      if (selectedService) {
        updatedServices[index].duration = selectedService.duration || 30;
      }
    }
    
    formik.setFieldValue('services', updatedServices);
  };

  // Функция получения ошибок валидации для конкретной услуги
  const getServiceError = (index: number, field: keyof ServicePointService) => {
    const errors = formik.errors.services;
    if (Array.isArray(errors) && errors[index] && typeof errors[index] === 'object') {
      return (errors[index] as any)[field];
    }
    return undefined;
  };

  const isServiceTouched = (index: number, field: keyof ServicePointService) => {
    const touched = formik.touched.services;
    if (Array.isArray(touched) && touched[index] && typeof touched[index] === 'object') {
      return (touched[index] as any)[field];
    }
    return false;
  };

  // Функция получения информации об услуге по ID
  const getServiceInfo = (serviceId: number) => {
    return availableServices.find(s => s.id === serviceId);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PriceIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Услуги и цены
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Настройте список услуг, которые предоставляет данная сервисная точка, 
        с индивидуальными ценами и временем выполнения.
      </Typography>

      {/* Кнопка добавления новой услуги */}
      <Button
        variant="outlined"
        onClick={addNewService}
        startIcon={<AddIcon />}
        sx={{ mb: 3 }}
        disabled={getAvailableServicesForSelection.length === 0 || servicesLoading}
      >
        Добавить услугу
      </Button>

      {getAvailableServicesForSelection.length === 0 && !servicesLoading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Все доступные услуги уже добавлены в сервисную точку
        </Alert>
      )}

      {servicesLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Загрузка списка услуг...
        </Alert>
      )}

      {/* Список услуг */}
      {activeServices.length > 0 ? (
        <Grid container spacing={3}>
          {formik.values.services
            ?.filter(service => !service._destroy) // Показываем только не удаленные услуги
            ?.map((service, filteredIndex) => {
              // Находим оригинальный индекс в полном массиве
              // Используем более надежный способ поиска по service_id и позиции
              const originalIndex = formik.values.services?.findIndex((s, idx) => {
                // Если у услуг есть ID, сравниваем по ID
                if ((s as any).id && (service as any).id) {
                  return (s as any).id === (service as any).id;
                }
                // Иначе сравниваем по service_id и позиции для новых услуг
                return s.service_id === service.service_id && 
                       JSON.stringify(s) === JSON.stringify(service);
              }) ?? -1;
              
              const serviceInfo = getServiceInfo(service.service_id);
              
              return (
                <Grid item xs={12} md={6} key={`${service.service_id}-${originalIndex}`}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          Услуга {filteredIndex + 1}
                        </Typography>
                        <Tooltip title="Удалить услугу">
                          <IconButton
                            color="error"
                            onClick={() => removeService(originalIndex)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      {/* Выбор услуги */}
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={isServiceTouched(originalIndex, 'service_id') && Boolean(getServiceError(originalIndex, 'service_id'))}
                        required
                      >
                        <InputLabel>Услуга</InputLabel>
                        <Select
                          value={service.service_id ? String(service.service_id) : '0'}
                          onChange={(e) => updateService(originalIndex, 'service_id', Number(e.target.value))}
                          onBlur={() => formik.setFieldTouched(`services.${originalIndex}.service_id`, true)}
                          label="Услуга"
                        >
                          <MenuItem value="0" disabled>Выберите услугу</MenuItem>
                          {/* Показываем текущую выбранную услугу, даже если она уже выбрана в другом месте */}
                          {serviceInfo && (
                            <MenuItem value={String(service.service_id)}>
                              {serviceInfo.name}
                              {serviceInfo.category && ` (${serviceInfo.category.name})`}
                            </MenuItem>
                          )}
                          {/* Показываем доступные для выбора услуги */}
                          {getAvailableServicesForSelection.map((availableService: Service) => (
                            <MenuItem key={availableService.id} value={String(availableService.id)}>
                              {availableService.name}
                              {availableService.category && ` (${availableService.category.name})`}
                            </MenuItem>
                          ))}
                        </Select>
                        {isServiceTouched(originalIndex, 'service_id') && getServiceError(originalIndex, 'service_id') && (
                          <FormHelperText>
                            {getServiceError(originalIndex, 'service_id')}
                          </FormHelperText>
                        )}
                      </FormControl>

                      {/* Отображение категории услуги */}
                      {serviceInfo?.category && (
                        <Chip 
                          label={serviceInfo.category.name} 
                          size="small" 
                          color="secondary" 
                          sx={{ mt: 1, mb: 1 }}
                        />
                      )}
                      
                      {/* Цена услуги */}
                      <TextField
                        fullWidth
                        type="number"
                        label="Цена"
                        value={service.price}
                        onChange={(e) => updateService(originalIndex, 'price', Number(e.target.value))}
                        onBlur={() => formik.setFieldTouched(`services.${originalIndex}.price`, true)}
                        error={isServiceTouched(originalIndex, 'price') && Boolean(getServiceError(originalIndex, 'price'))}
                        helperText={isServiceTouched(originalIndex, 'price') && getServiceError(originalIndex, 'price')}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                        margin="normal"
                        required
                      />
                      
                      {/* Длительность услуги */}
                      <TextField
                        fullWidth
                        type="number"
                        label="Длительность"
                        value={service.duration}
                        onChange={(e) => updateService(originalIndex, 'duration', Number(e.target.value))}
                        onBlur={() => formik.setFieldTouched(`services.${originalIndex}.duration`, true)}
                        error={isServiceTouched(originalIndex, 'duration') && Boolean(getServiceError(originalIndex, 'duration'))}
                        helperText={
                          isServiceTouched(originalIndex, 'duration') && getServiceError(originalIndex, 'duration') ||
                          'Ожидаемое время выполнения услуги'
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                          inputProps: { min: 5 }
                        }}
                        margin="normal"
                        required
                      />
                      
                      {/* Доступность услуги */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={service.is_available}
                            onChange={(e) => updateService(originalIndex, 'is_available', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Услуга доступна"
                        sx={{ mt: 1 }}
                      />

                      {/* Базовая информация об услуге */}
                      {serviceInfo && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Базовая цена: {serviceInfo.price}₽ | Стандартное время: {serviceInfo.duration}мин
                          </Typography>
                          {serviceInfo.description && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {serviceInfo.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Пока не добавлено ни одной услуги
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добавьте услуги, которые предоставляет данная сервисная точка. 
            Вы можете установить индивидуальные цены и время выполнения для каждой услуги.
          </Typography>
        </Alert>
      )}

      {/* Валидационные ошибки на уровне всего массива */}
      {formik.touched.services && typeof formik.errors.services === 'string' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {formik.errors.services}
        </Alert>
      )}

      {/* Информационная подсказка */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Совет:</strong> Цены могут отличаться от базовых цен услуг. 
          Установите конкурентные цены с учетом местоположения и специфики вашей сервисной точки.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ServicesStep; 