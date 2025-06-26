// Шаг 4: Информация об автомобиле

import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import {
  ConfirmationNumber as LicensePlateIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт UI компонентов
import { TextField } from '../../../components/ui/TextField';
import { Select } from '../../../components/ui/Select';

// Импорт API хуков
import { useGetCarTypesQuery } from '../../../api/carTypes.api';
import { useGetCarBrandsQuery, useGetCarModelsByBrandIdQuery } from '../../../api';

// Импорт типов - используем any для совместимости
import { CarType } from '../../../types/car';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface CarTypeStepProps {
  formData: any; // Используем any для совместимости с локальным BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const CarTypeStep: React.FC<CarTypeStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const theme = useTheme();
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    license_plate: '',
  });
  
  // Загрузка данных
  const { data: carTypesData, isLoading: isLoadingCarTypes, error: carTypesError } = useGetCarTypesQuery();
  const { data: brandsData } = useGetCarBrandsQuery({});
  const { data: modelsData } = useGetCarModelsByBrandIdQuery(
    { brandId: selectedBrandId?.toString() || '' },
    { skip: !selectedBrandId }
  );
  
  // Получаем данные из API
  const carTypes = carTypesData || [];
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const models = modelsData?.car_models || [];
  
  // Валидация номера автомобиля
  const validateLicensePlate = (value: string) => {
    if (!value.trim()) {
      return 'Номер автомобиля обязателен для заполнения';
    }
    return '';
  };
  
  // Обработчики изменения полей
  const handleCarTypeSelect = (carType: CarType) => {
    setFormData((prev: any) => ({
      ...prev,
      car_type_id: carType.id,
    }));
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
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Информация об автомобиле
      </Typography>
      
      <Grid container spacing={3}>
        {/* Выбор типа автомобиля */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1. Выберите тип автомобиля *
          </Typography>
          
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
        </Grid>
        
        {/* Номер автомобиля */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            2. Номер автомобиля *
          </Typography>
          
          <TextField
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
        
        {/* Марка автомобиля */}
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
        
        {/* Модель автомобиля */}
        {selectedBrandId && (
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
        💡 Указание марки и модели автомобиля поможет мастеру лучше подготовиться к обслуживанию
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
            {!formData.license_plate && (
              <Typography variant="body2" component="li">
                Номер автомобиля
              </Typography>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {isValid && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Все обязательные поля заполнены. Можете перейти к следующему шагу.
        </Alert>
      )}
    </Box>
  );
};

export default CarTypeStep;
