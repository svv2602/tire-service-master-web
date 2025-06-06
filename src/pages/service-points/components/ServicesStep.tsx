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
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MonetizationOn as PriceIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import { useGetServicesQuery } from '../../../api/servicesList.api';
import type { ServicePointFormDataNew, ServicePointService, ServicePoint } from '../../../types/models';
import { 
  SIZES, 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles, 
  getFormStyles,
} from '../../../styles';

interface ServicesStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Хук темы для использования централизованных стилей
  const theme = useTheme();
  
  // Получаем стили из централизованной системы
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme);
  const formStyles = getFormStyles(theme);

  // Состояние для поиска услуг
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);

  // Загружаем список всех доступных услуг
  const { data: servicesResponse, isLoading: servicesLoading } = useGetServicesQuery({});
  
  // Мемоизируем availableServices для оптимизации
  const availableServices = useMemo(() => {
    return servicesResponse?.data || [];
  }, [servicesResponse?.data]);

  // Получаем услуги из формы (исключая помеченные для удаления)
  const activeServices = useMemo(() => {
    return formik.values.services?.filter(service => !service._destroy) || [];
  }, [formik.values.services]);

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
      price: service.price || 0, // Используем базовую цену или 0 если не указана
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
    <Box sx={formStyles.container}>
      {/* Заголовок секции с иконкой и счетчиком */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: SIZES.spacing.lg }}>
        <PriceIcon sx={{ mr: SIZES.spacing.sm, color: 'primary.main' }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: SIZES.fontSize.lg,
            fontWeight: 'bold',
            color: theme.palette.text.primary 
          }}
        >
          Услуги и цены
        </Typography>
        <Badge badgeContent={activeServices.length} color="primary" sx={{ ml: SIZES.spacing.md }}>
          <Chip 
            label={`${activeServices.length} услуг`} 
            size="small" 
            color={activeServices.length > 0 ? 'success' : 'default'}
            sx={chipStyles}
          />
        </Badge>
      </Box>

      {/* Описание секции */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: SIZES.spacing.lg,
          fontSize: SIZES.fontSize.sm
        }}
      >
        Настройте список услуг, которые предоставляет данная сервисная точка, 
        с индивидуальными ценами и временем выполнения.
      </Typography>

      {/* Блок добавления новой услуги */}
      <Paper sx={{ 
        ...cardStyles,
        p: SIZES.spacing.md, 
        mb: SIZES.spacing.lg, 
        border: '1px dashed', 
        borderColor: 'primary.main',
        borderRadius: SIZES.borderRadius.md
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: SIZES.spacing.md }}>
          <AddIcon sx={{ mr: SIZES.spacing.sm, color: 'primary.main' }} />
          <Typography 
            variant="subtitle1" 
            color="primary"
            sx={{ 
              fontSize: SIZES.fontSize.md,
              fontWeight: 'bold'
            }}
          >
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
            sx={{
              ...buttonStyles,
              borderRadius: SIZES.borderRadius.sm,
              py: SIZES.spacing.md
            }}
          >
            Выбрать из каталога услуг
          </Button>
        ) : (
          <Stack spacing={SIZES.spacing.md}>
            {/* Поиск и фильтры */}
            <Grid container spacing={SIZES.spacing.md}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Поиск услуг..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={textFieldStyles}
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
                <FormControl fullWidth sx={formStyles.field}>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                    label="Категория"
                    sx={{
                      borderRadius: SIZES.borderRadius.sm
                    }}
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
              <Paper sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                borderRadius: SIZES.borderRadius.sm,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <List>
                  {getFilteredAvailableServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem>
                        <ListItemText
                          primary={service.name}
                          secondary={
                            <Box>
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ fontSize: SIZES.fontSize.xs }}
                              >
                                {service.category?.name} • {service.price || 0}₽ • {service.duration || 30}мин
                              </Typography>
                              {service.description && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: SIZES.fontSize.xs }}
                                >
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
                            sx={{
                              ...buttonStyles,
                              fontSize: SIZES.fontSize.sm,
                              px: SIZES.spacing.md
                            }}
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
              <Alert 
                severity="info"
                sx={{
                  borderRadius: SIZES.borderRadius.sm,
                  fontSize: SIZES.fontSize.sm
                }}
              >
                {(searchQuery || selectedCategory) 
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
              sx={{
                fontSize: SIZES.fontSize.sm,
                color: theme.palette.text.secondary,
                borderRadius: SIZES.borderRadius.sm
              }}
            >
              Свернуть
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Индикатор загрузки */}
      {servicesLoading && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: SIZES.spacing.md,
            borderRadius: SIZES.borderRadius.sm,
            fontSize: SIZES.fontSize.sm
          }}
        >
          Загрузка списка услуг...
        </Alert>
      )}

      {/* Список добавленных услуг */}
      {activeServices.length > 0 ? (
        <Grid container spacing={SIZES.spacing.lg}>
          {formik.values.services
            ?.map((service, originalIndex) => ({ service, originalIndex }))
            .filter(({ service }) => !service._destroy) // Показываем только не удаленные услуги
            ?.map(({ service, originalIndex }, displayIndex) => {
              const serviceInfo = getServiceInfo(service.service_id);
              
              return (
                <Grid item xs={12} md={6} key={`${service.service_id}-${originalIndex}`}>
                  <Card sx={{ 
                    ...cardStyles,
                    height: '100%',
                    border: service.is_available 
                      ? `1px solid ${theme.palette.divider}` 
                      : `1px solid ${theme.palette.error.main}`,
                    opacity: service.is_available ? 1 : 0.7,
                    borderRadius: SIZES.borderRadius.md
                  }}>
                    <CardContent sx={{ p: SIZES.spacing.lg }}>
                      {/* Заголовок карточки услуги */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: SIZES.spacing.md 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {service.is_available ? (
                            <VisibilityIcon sx={{ 
                              mr: SIZES.spacing.sm, 
                              color: 'success.main',
                              fontSize: SIZES.fontSize.md
                            }} />
                          ) : (
                            <VisibilityOffIcon sx={{ 
                              mr: SIZES.spacing.sm, 
                              color: 'error.main',
                              fontSize: SIZES.fontSize.md
                            }} />
                          )}
                          <Typography 
                            variant="h6" 
                            color="primary"
                            sx={{
                              fontSize: SIZES.fontSize.md,
                              fontWeight: 'bold'
                            }}
                          >
                            {serviceInfo?.name || `Услуга ${displayIndex + 1}`}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Дублировать услугу">
                            <IconButton
                              color="primary"
                              onClick={() => duplicateService(originalIndex)}
                              size="small"
                              sx={{ 
                                mr: SIZES.spacing.sm,
                                borderRadius: SIZES.borderRadius.sm
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить услугу">
                            <IconButton
                              color="error"
                              onClick={() => removeService(originalIndex)}
                              size="small"
                              sx={{
                                borderRadius: SIZES.borderRadius.sm
                              }}
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
                          sx={{ 
                            ...chipStyles,
                            mb: SIZES.spacing.md,
                            fontSize: SIZES.fontSize.xs
                          }}
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
                          (isServiceTouched(originalIndex, 'price') && getServiceError(originalIndex, 'price')) ||
                          (serviceInfo ? `Базовая цена: ${serviceInfo.price || 0}₽` : '')
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                          inputProps: { min: 0, step: 10 }
                        }}
                        margin="normal"
                        required
                        sx={textFieldStyles}
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
                          (isServiceTouched(originalIndex, 'duration') && getServiceError(originalIndex, 'duration')) ||
                          (serviceInfo ? `Стандартное время: ${serviceInfo.duration || 30}мин` : 'Ожидаемое время выполнения')
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                          inputProps: { min: 5, step: 5 }
                        }}
                        margin="normal"
                        required
                        sx={textFieldStyles}
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
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: SIZES.fontSize.sm }}
                            >
                              Услуга доступна
                            </Typography>
                            {!service.is_available && (
                              <Chip 
                                label="Отключена" 
                                size="small" 
                                color="error" 
                                sx={{ 
                                  ...chipStyles,
                                  ml: SIZES.spacing.sm,
                                  fontSize: SIZES.fontSize.xs
                                }}
                              />
                            )}
                          </Box>
                        }
                        sx={{ mt: SIZES.spacing.sm }}
                      />

                      {/* Базовая информация об услуге */}
                      {serviceInfo && (
                        <Box sx={{ 
                          mt: SIZES.spacing.md, 
                          p: SIZES.spacing.sm, 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'rgba(0, 0, 0, 0.02)', 
                          borderRadius: SIZES.borderRadius.sm
                        }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: SIZES.fontSize.xs }}
                          >
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
        <Alert 
          severity="info" 
          sx={{ 
            mt: SIZES.spacing.md,
            borderRadius: SIZES.borderRadius.sm
          }}
        >
          <Typography 
            variant="body1" 
            gutterBottom
            sx={{ fontSize: SIZES.fontSize.md }}
          >
            Пока не добавлено ни одной услуги
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: SIZES.fontSize.sm }}
          >
            Добавьте услуги, которые предоставляет данная сервисная точка. 
            Вы можете установить индивидуальные цены и время выполнения для каждой услуги.
          </Typography>
        </Alert>
      )}

      {/* Валидационные ошибки на уровне всего массива */}
      {formik.touched.services && typeof formik.errors.services === 'string' && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: SIZES.spacing.md,
            borderRadius: SIZES.borderRadius.sm,
            fontSize: SIZES.fontSize.sm
          }}
        >
          {formik.errors.services}
        </Alert>
      )}

      {/* Краткая статистика */}
      {activeServices.length > 0 && (
        <Paper sx={{ 
          ...cardStyles,
          p: SIZES.spacing.md, 
          mt: SIZES.spacing.lg, 
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.08)'
            : 'rgba(25, 118, 210, 0.04)',
          borderRadius: SIZES.borderRadius.md
        }}>
          <Typography 
            variant="subtitle2" 
            gutterBottom
            sx={{
              fontSize: SIZES.fontSize.md,
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            📊 Статистика услуг
          </Typography>
          <Grid container spacing={SIZES.spacing.md}>
            <Grid item xs={6}>
              <Typography 
                variant="body2"
                sx={{ fontSize: SIZES.fontSize.sm }}
              >
                Всего услуг: <strong>{activeServices.length}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography 
                variant="body2"
                sx={{ fontSize: SIZES.fontSize.sm }}
              >
                Активных: <strong>{activeServices.filter(s => s.is_available).length}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography 
                variant="body2"
                sx={{ fontSize: SIZES.fontSize.sm }}
              >
                Средняя цена: <strong>
                  {Math.round(activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length)}₽
                </strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography 
                variant="body2"
                sx={{ fontSize: SIZES.fontSize.sm }}
              >
                Среднее время: <strong>
                  {Math.round(activeServices.reduce((sum, s) => sum + s.duration, 0) / activeServices.length)}мин
                </strong>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Информационная подсказка */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: SIZES.spacing.lg,
          borderRadius: SIZES.borderRadius.sm
        }}
      >
        <Typography 
          variant="body2"
          sx={{ fontSize: SIZES.fontSize.sm }}
        >
          💡 <strong>Совет:</strong> Цены могут отличаться от базовых цен услуг. 
          Установите конкурентные цены с учетом местоположения и специфики вашей сервисной точки.
          Отключенные услуги не будут доступны для бронирования клиентами.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ServicesStep; 