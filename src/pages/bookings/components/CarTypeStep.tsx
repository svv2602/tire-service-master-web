// Шаг 4: Информация об автомобиле

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import {
  Box,
  Typography,
  Grid,
  Alert,
  FormHelperText,
  InputAdornment,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  ConfirmationNumber as LicensePlateIcon,
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as CarIcon,
  MyLocation as MyCarIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт UI компонентов
import { TextField } from '../../../components/ui/TextField';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

// Импорт API хуков
import { useGetCarTypesQuery } from '../../../api/carTypes.api';
import { useGetCarBrandsQuery, useGetCarModelsByBrandIdQuery } from '../../../api';
import { useGetMyClientCarsQuery } from '../../../api/clients.api';

// Импорт типов - используем any для совместимости
import { CarType } from '../../../types/car';
import { ClientCar } from '../../../types/client';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface CarTypeStepProps {
  formData: any; // Используем any для совместимости с локальным BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  onStepChange?: (stepIndex: number) => void; // Добавляем возможность перехода на конкретный шаг
}

const CarTypeStep: React.FC<CarTypeStepProps> = ({
  formData,
  setFormData,
  isValid,
  onNext,
  onStepChange,
}) => {
  const theme = useTheme();
  
  // Получаем информацию о текущем пользователе
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [carTypeAccordionOpen, setCarTypeAccordionOpen] = useState(false);
  const [myCarAccordionOpen, setMyCarAccordionOpen] = useState(false);
  const [errors, setErrors] = useState({
    license_plate: '',
  });
  
  // Рефы для управления фокусом
  const licensePlateRef = useRef<HTMLInputElement>(null);
  
  // Загрузка данных
  const { data: carTypesData, isLoading: isLoadingCarTypes, error: carTypesError } = useGetCarTypesQuery();
  const { data: brandsData } = useGetCarBrandsQuery({});
  const { data: modelsData } = useGetCarModelsByBrandIdQuery(
    { brandId: selectedBrandId?.toString() || '' },
    { skip: !selectedBrandId }
  );
  
  // Загрузка автомобилей клиента (только для авторизованных пользователей)
  const { 
    data: clientCars, 
    isLoading: isLoadingClientCars, 
    error: clientCarsError 
  } = useGetMyClientCarsQuery(undefined, { 
    skip: !isAuthenticated || !user 
  });
  
  // Получаем данные из API
  const carTypes = carTypesData || [];
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const models = modelsData?.car_models || [];
  
  // Состояние для отслеживания того, был ли выбран автомобиль клиента
  const [wasClientCarSelected, setWasClientCarSelected] = useState(false);
  
  // Автоматически открываем аккордеон при загрузке компонента (если тип не выбран)
  useEffect(() => {
    if (!formData.car_type_id && carTypes.length > 0) {
      // Если есть автомобили клиента, открываем их, иначе типы авто
      if (isAuthenticated && clientCars && clientCars.length > 0) {
        setMyCarAccordionOpen(true);
      } else {
        setCarTypeAccordionOpen(true);
      }
    }
  }, [formData.car_type_id, carTypes.length, isAuthenticated, clientCars]);
  
  // Устанавливаем фокус на номер авто после выбора типа
  useEffect(() => {
    if (formData.car_type_id && !carTypeAccordionOpen && !myCarAccordionOpen) {
      setTimeout(() => {
        licensePlateRef.current?.focus();
      }, 300); // Небольшая задержка для завершения анимации аккордеона
    }
  }, [formData.car_type_id, carTypeAccordionOpen, myCarAccordionOpen]);
  
  // Автоматический переход на следующий шаг при заполнении всех обязательных полей
  useEffect(() => {
    // Проверяем, что форма валидна и был выбран автомобиль клиента
    if (isValid && wasClientCarSelected) {
      // Небольшая задержка для визуального эффекта
      setTimeout(() => {
        // Переходим сразу на шаг "Услуги" (индекс 5) вместо следующего по порядку
        if (onStepChange) {
          onStepChange(5); // Шаг "Услуги"
        } else {
          onNext(); // Fallback на следующий шаг
        }
      }, 1000);
    }
  }, [isValid, wasClientCarSelected, onNext, onStepChange]);
  
  // Валидация номера автомобиля
  const validateLicensePlate = (value: string) => {
    if (!value.trim()) {
      return 'Номер автомобиля обязателен для заполнения';
    }
    return '';
  };
  
  // Обработчик выбора автомобиля клиента
  const handleClientCarSelect = (clientCar: ClientCar) => {
    // Заполняем все данные из выбранного автомобиля
    setFormData((prev: any) => ({
      ...prev,
      car_type_id: clientCar.car_type_id || null,
      license_plate: clientCar.license_plate,
      car_brand: clientCar.brand?.name || '',
      car_model: clientCar.model?.name || '',
      car_year: clientCar.year,
    }));
    
    // Устанавливаем выбранную марку для каскадного выбора
    if (clientCar.brand) {
      setSelectedBrandId(clientCar.brand.id);
    }
    
    // Сворачиваем аккордеон после выбора
    setMyCarAccordionOpen(false);
    
    // Отмечаем, что был выбран автомобиль клиента
    setWasClientCarSelected(true);
    
    // Если тип авто установлен, переходим сразу на шаг услуг
    if (clientCar.car_type_id) {
      // Небольшая задержка для визуального эффекта
      setTimeout(() => {
        // Переходим сразу на шаг "Услуги" (индекс 5) вместо следующего по порядку
        if (onStepChange) {
          onStepChange(5); // Шаг "Услуги"
        } else {
          onNext(); // Fallback на следующий шаг
        }
      }, 800);
    } else {
      // Если тип авто не был установлен, открываем аккордеон типов
      setCarTypeAccordionOpen(true);
    }
  };
  
  // Обработчики изменения полей
  const handleCarTypeSelect = (carType: CarType) => {
    setFormData((prev: any) => ({
      ...prev,
      car_type_id: carType.id,
    }));
    
    // Сворачиваем аккордеон после выбора
    setCarTypeAccordionOpen(false);
  };
  
  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId);
    const selectedBrand = brands.find(b => b.id === brandId);
    setFormData((prev: any) => ({
      ...prev,
      car_brand: selectedBrand?.name || '',
      car_model: '', // Сбрасываем модель при смене бренда
    }));
  };
  
  const handleModelChange = (modelId: number) => {
    const selectedModel = models.find(m => m.id === modelId);
    setFormData((prev: any) => ({
      ...prev,
      car_model: selectedModel?.name || '',
    }));
  };
  
  const handleLicensePlateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData((prev: any) => ({
      ...prev,
      license_plate: value.toUpperCase(), // Автоматически переводим в верхний регистр
    }));
    
    const error = validateLicensePlate(value);
    setErrors(prev => ({
      ...prev,
      license_plate: error,
    }));
  };
  
  // Инициализация выбранного бренда
  useEffect(() => {
    if (formData.car_brand && brands.length > 0) {
      const brand = brands.find(b => b.name === formData.car_brand);
      if (brand) {
        setSelectedBrandId(brand.id);
      }
    }
  }, [formData.car_brand, brands]);
  
  // Получение названия выбранного типа авто
  const getSelectedCarTypeName = () => {
    if (formData.car_type_id) {
      const selectedType = carTypes.find(type => type.id === formData.car_type_id);
      return selectedType?.name || `Тип #${formData.car_type_id}`;
    }
    return null;
  };
  
  // Рендер карточки типа автомобиля
  const renderCarTypeCard = (carType: CarType) => {
    const isSelected = formData.car_type_id === carType.id;
    
    return (
      <Card
        key={carType.id}
        sx={{
          ...getCardStyles(theme),
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea onClick={() => handleCarTypeSelect(carType)}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {carType.name}
              </Typography>
              {isSelected && (
                <Chip
                  label="Выбрано"
                  color="primary"
                  size="small"
                  variant="filled"
                />
              )}
            </Box>
            
            {carType.description && (
              <Typography variant="body2" color="text.secondary">
                {carType.description}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };
  
  // Рендер карточки автомобиля клиента
  const renderClientCarCard = (clientCar: ClientCar) => {
    return (
      <Card
        key={clientCar.id}
        sx={{
          ...getCardStyles(theme),
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea onClick={() => handleClientCarSelect(clientCar)}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                {clientCar.license_plate}
                {clientCar.is_primary && (
                  <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                )}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {clientCar.brand?.name || 'Неизвестная марка'} {clientCar.model?.name || 'Неизвестная модель'}
            </Typography>
            
            {clientCar.year && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Год: {clientCar.year}
              </Typography>
            )}
            
            {clientCar.car_type && (
              <Chip
                label={clientCar.car_type.name}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CarIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Информация об автомобиле
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Шаг 4 из 6: Укажите тип и номер вашего автомобиля
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Мои автомобили - показываем только для авторизованных пользователей */}
        {isAuthenticated && (
          <Grid item xs={12}>
            <Accordion 
              expanded={myCarAccordionOpen} 
              onChange={(_, expanded) => setMyCarAccordionOpen(expanded)}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                boxShadow: 'none',
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: theme.palette.info.light,
                  '&.Mui-expanded': {
                    minHeight: 56,
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                    '&.Mui-expanded': {
                      margin: '12px 0',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MyCarIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Мои автомобили
                  </Typography>
                  {clientCars && clientCars.length > 0 && (
                    <Chip
                      label={`${clientCars.length} авто`}
                      color="info"
                      size="small"
                      variant="filled"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {clientCarsError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Ошибка загрузки автомобилей. Попробуйте обновить страницу.
                  </Alert>
                )}
                
                {isLoadingClientCars ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : !clientCars || clientCars.length === 0 ? (
                  <Alert severity="info">
                    У вас пока нет сохраненных автомобилей. Вы можете добавить их в профиле или заполнить данные ниже.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {clientCars.map((clientCar) => (
                      <Grid item xs={12} sm={6} md={4} key={clientCar.id}>
                        {renderClientCarCard(clientCar)}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        
        {/* Разделитель, если есть мои автомобили */}
        {isAuthenticated && clientCars && clientCars.length > 0 && (
          <Grid item xs={12}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                или выберите тип автомобиля вручную
              </Typography>
            </Divider>
          </Grid>
        )}
        
        {/* Выбор типа автомобиля - Аккордеон */}
        <Grid item xs={12}>
          <Accordion 
            expanded={carTypeAccordionOpen} 
            onChange={(_, expanded) => setCarTypeAccordionOpen(expanded)}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: formData.car_type_id ? theme.palette.success.light : theme.palette.grey[50],
                '&.Mui-expanded': {
                  minHeight: 56,
                },
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                  '&.Mui-expanded': {
                    margin: '12px 0',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarIcon color={formData.car_type_id ? 'success' : 'action'} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  1. Тип автомобиля *
                </Typography>
                {formData.car_type_id && (
                  <Chip
                    label={getSelectedCarTypeName()}
                    color="success"
                    size="small"
                    variant="filled"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              {carTypesError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Ошибка загрузки типов автомобилей. Попробуйте обновить страницу.
                </Alert>
              )}
              
              {isLoadingCarTypes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : carTypes.length === 0 ? (
                <Alert severity="warning">
                  Типы автомобилей не найдены.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {carTypes.map((carType) => (
                    <Grid item xs={12} sm={6} md={4} key={carType.id}>
                      {renderCarTypeCard(carType)}
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {!formData.car_type_id && carTypes.length > 0 && (
                <FormHelperText error sx={{ mt: 1 }}>
                  Выберите тип автомобиля для продолжения
                </FormHelperText>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Номер автомобиля - показываем только после выбора типа */}
        {formData.car_type_id && (
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              2. Номер автомобиля *
            </Typography>
            
            <TextField
              ref={licensePlateRef}
              label="Номер автомобиля"
              value={formData.license_plate}
              onChange={handleLicensePlateChange}
              placeholder="АА1234ВВ"
              required
              error={!!errors.license_plate}
              helperText={errors.license_plate || 'Государственный номер автомобиля'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LicensePlateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
        )}
        
        {/* Марка автомобиля - показываем только после выбора типа */}
        {formData.car_type_id && (
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              3. Марка автомобиля (необязательно)
            </Typography>
            
            <Select
              label="Марка"
              value={selectedBrandId || ''}
              onChange={(value) => handleBrandChange(Number(value))}
              options={brands.map(brand => ({
                value: brand.id,
                label: brand.name,
              }))}
              placeholder="Выберите марку"
              fullWidth
            />
          </Grid>
        )}
        
        {/* Модель автомобиля - показываем только после выбора марки */}
        {formData.car_type_id && selectedBrandId && (
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              4. Модель автомобиля (необязательно)
            </Typography>
            
            <Select
              label="Модель"
              value={models.find(m => m.name === formData.car_model)?.id || ''}
              onChange={(value) => handleModelChange(Number(value))}
              options={models.map(model => ({
                value: model.id,
                label: model.name,
              }))}
              placeholder="Выберите модель"
              disabled={!selectedBrandId}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
      
      {/* Информация */}
      <Alert severity="info" sx={{ mt: 3 }}>
        💡 {isAuthenticated 
          ? 'Выберите один из своих автомобилей или укажите данные вручную. Указание марки и модели поможет мастеру лучше подготовиться к обслуживанию'
          : 'Указание марки и модели автомобиля поможет мастеру лучше подготовиться к обслуживанию'
        }
      </Alert>
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {!formData.car_type_id && (
              <Typography variant="body2" component="li">
                Тип автомобиля
              </Typography>
            )}
            {formData.car_type_id && !formData.license_plate && (
              <Typography variant="body2" component="li">
                Номер автомобиля
              </Typography>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {wasClientCarSelected 
            ? '✅ Автомобиль выбран! Переход к выбору услуг...'
            : '✅ Все обязательные поля заполнены. Можете перейти к следующему шагу.'
          }
        </Alert>
      )}
    </Box>
  );
};

export default CarTypeStep;
