import React, { useMemo, useState } from 'react';
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
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MonetizationOn as PriceIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
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
  // Состояние для поиска услуг
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);

  // Загружаем список всех доступных услуг
  const { data: servicesResponse, isLoading: servicesLoading } = useGetServicesQuery({});
  const availableServices = servicesResponse?.data || [];

  // Получаем услуги из формы (исключая помеченные для удаления)
  const activeServices = formik.values.services?.filter(service => !service._destroy) || [];

  // Получаем уникальные категории
  const categories = useMemo(() => {
    const categoryMap = new Map();
    availableServices.forEach(service => {
      if (service.category) {
        categoryMap.set(service.category.id, service.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [availableServices]);

  // Функция получения доступных услуг для выбора с фильтрацией
  const getFilteredAvailableServices = useMemo(() => {
    const selectedServiceIds = activeServices.map(s => s.service_id).filter(id => id > 0);
    let filtered = availableServices.filter(service => !selectedServiceIds.includes(service.id));
    
    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category?.id === selectedCategory);
    }
    
    return filtered;
  }, [availableServices, activeServices, searchQuery, selectedCategory]);

  // Функция добавления услуги по ID
  const addServiceById = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    const newService: ServicePointService = {
      service_id: serviceId,
      price: service.price, // Используем базовую цену как стартовую
      duration: service.duration || 30,
      is_available: true,
    };
    
    formik.setFieldValue('services', [
      ...(formik.values.services || []), 
      newService
    ]);
    
    // Сбрасываем поиск после добавления
    setSearchQuery('');
    setShowServiceSelection(false);
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
    
    formik.setFieldValue('services', updatedServices);
  };

  // Функция дублирования услуги
  const duplicateService = (index: number) => {
    const serviceToClone = { ...(formik.values.services?.[index] || {}) };
    // Убираем ID для создания новой услуги
    delete (serviceToClone as any).id;
    
    formik.setFieldValue('services', [
      ...(formik.values.services || []), 
      serviceToClone
    ]);
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
        <Badge badgeContent={activeServices.length} color="primary" sx={{ ml: 2 }}>
          <Chip 
            label={`${activeServices.length} услуг`} 
            size="small" 
            color={activeServices.length > 0 ? 'success' : 'default'}
          />
        </Badge>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Настройте список услуг, которые предоставляет данная сервисная точка, 
        с индивидуальными ценами и временем выполнения.
      </Typography>

      {/* Блок добавления новой услуги */}
      <Paper sx={{ p: 2, mb: 3, border: '1px dashed', borderColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" color="primary">
            Добавить услугу
          </Typography>
        </Box>

        {!showServiceSelection ? (
          <Button
            variant="outlined"
            onClick={() => setShowServiceSelection(true)}
            startIcon={<SearchIcon />}
            disabled={servicesLoading}
            fullWidth
          >
            Выбрать из каталога услуг
          </Button>
        ) : (
          <Stack spacing={2}>
            {/* Поиск и фильтры */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Поиск услуг..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                    label="Категория"
                  >
                    <MenuItem value="">Все категории</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Список доступных услуг */}
            {getFilteredAvailableServices.length > 0 ? (
              <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {getFilteredAvailableServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem>
                        <ListItemText
                          primary={service.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {service.category?.name} • {service.price}₽ • {service.duration}мин
                              </Typography>
                              {service.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {service.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => addServiceById(service.id)}
                          >
                            Добавить
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < getFilteredAvailableServices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            ) : (
              <Alert severity="info">
                {searchQuery || selectedCategory 
                  ? 'Услуги не найдены по заданным критериям'
                  : 'Все доступные услуги уже добавлены'
                }
              </Alert>
            )}

            <Button
              variant="text"
              onClick={() => {
                setShowServiceSelection(false);
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Свернуть
            </Button>
          </Stack>
        )}
      </Paper>

      {servicesLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Загрузка списка услуг...
        </Alert>
      )}

      {/* Список добавленных услуг */}
      {activeServices.length > 0 ? (
        <Grid container spacing={3}>
          {formik.values.services
            ?.map((service, originalIndex) => ({ service, originalIndex }))
            .filter(({ service }) => !service._destroy) // Показываем только не удаленные услуги
            ?.map(({ service, originalIndex }, displayIndex) => {
              const serviceInfo = getServiceInfo(service.service_id);
              
              return (
                <Grid item xs={12} md={6} key={`${service.service_id}-${originalIndex}`}>
                  <Card sx={{ 
                    height: '100%',
                    border: service.is_available ? '1px solid #e0e0e0' : '1px solid #f44336',
                    opacity: service.is_available ? 1 : 0.7
                  }}>
                    <CardContent>
                      {/* Заголовок карточки услуги */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {service.is_available ? (
                            <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                          ) : (
                            <VisibilityOffIcon sx={{ mr: 1, color: 'error.main' }} />
                          )}
                          <Typography variant="h6" color="primary">
                            {serviceInfo?.name || `Услуга ${displayIndex + 1}`}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Дублировать услугу">
                            <IconButton
                              color="primary"
                              onClick={() => duplicateService(originalIndex)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
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
                      </Box>

                      {/* Категория услуги */}
                      {serviceInfo?.category && (
                        <Chip 
                          label={serviceInfo.category.name} 
                          size="small" 
                          color="secondary" 
                          sx={{ mb: 2 }}
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
                        helperText={
                          isServiceTouched(originalIndex, 'price') && getServiceError(originalIndex, 'price') ||
                          (serviceInfo ? `Базовая цена: ${serviceInfo.price}₽` : '')
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                          inputProps: { min: 0, step: 10 }
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
                          (serviceInfo ? `Стандартное время: ${serviceInfo.duration}мин` : 'Ожидаемое время выполнения')
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                          inputProps: { min: 5, step: 5 }
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
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2">
                              Услуга доступна
                            </Typography>
                            {!service.is_available && (
                              <Chip 
                                label="Отключена" 
                                size="small" 
                                color="error" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        sx={{ mt: 1 }}
                      />

                      {/* Базовая информация об услуге */}
                      {serviceInfo && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            📋 {serviceInfo.description || 'Описание отсутствует'}
                          </Typography>
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

      {/* Краткая статистика */}
      {activeServices.length > 0 && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            📊 Статистика услуг
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                Всего услуг: <strong>{activeServices.length}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Активных: <strong>{activeServices.filter(s => s.is_available).length}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Средняя цена: <strong>
                  {Math.round(activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length)}₽
                </strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Среднее время: <strong>
                  {Math.round(activeServices.reduce((sum, s) => sum + s.duration, 0) / activeServices.length)}мин
                </strong>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Информационная подсказка */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Совет:</strong> Цены могут отличаться от базовых цен услуг. 
          Установите конкурентные цены с учетом местоположения и специфики вашей сервисной точки.
          Отключенные услуги не будут доступны для бронирования клиентами.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ServicesStep; 