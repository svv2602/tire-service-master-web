import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetCarBrandsQuery } from '../../api/car-brands.api';
import { useGetCarModelsByBrandQuery } from '../../api/car-models.api';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { CarBrand, CarModel } from '../../types';

interface CarInfoFormProps {
  carInfo: {
    brand: string;
    model: string;
    year: string;
    license_plate: string;
  };
  setCarInfo: React.Dispatch<React.SetStateAction<{
    brand: string;
    model: string;
    year: string;
    license_plate: string;
  }>>;
}

const CarInfoForm: React.FC<CarInfoFormProps> = ({ carInfo, setCarInfo }) => {
  const { t } = useTranslation();
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  
  // Получаем список брендов
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrandsQuery({});
  
  // Получаем модели для выбранного бренда
  const { data: modelsData, isLoading: isLoadingModels } = useGetCarModelsByBrandQuery(
    selectedBrandId,
    { skip: !selectedBrandId }
  );
  
  // Обработчики изменения полей
  const handleBrandChange = (value: string | number) => {
    const brandId = String(value);
    setSelectedBrandId(brandId);
    
    // Находим выбранный бренд
    const selectedBrand = brandsData?.data.find((brand: CarBrand) => brand.id.toString() === brandId);
    
    setCarInfo(prev => ({
      ...prev,
      brand: selectedBrand?.name || '',
      model: '' // Сбрасываем модель при смене бренда
    }));
  };
  
  const handleModelChange = (value: string | number) => {
    const modelId = String(value);
    
    // Находим выбранную модель
    const selectedModel = modelsData?.data.find((model: CarModel) => model.id.toString() === modelId);
    
    setCarInfo(prev => ({
      ...prev,
      model: selectedModel?.name || ''
    }));
  };
  
  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Проверяем, что введено число и оно в разумных пределах
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1900 && parseInt(value) <= new Date().getFullYear())) {
      setCarInfo(prev => ({
        ...prev,
        year: value
      }));
    }
  };
  
  const handleLicensePlateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCarInfo(prev => ({
      ...prev,
      license_plate: event.target.value
    }));
  };
  
  // Генерируем список годов для выбора (последние 30 лет)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Информация об автомобиле')}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Select
            fullWidth
            label={t('Марка автомобиля')}
            value={selectedBrandId}
            onChange={handleBrandChange}
            disabled={isLoadingBrands}
            required
          >
            <MenuItem value="">{t('Выберите марку')}</MenuItem>
            {brandsData?.data.map((brand: CarBrand) => (
              <MenuItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={12}>
          <Select
            fullWidth
            label={t('Модель автомобиля')}
            value={carInfo.model}
            onChange={handleModelChange}
            disabled={!selectedBrandId || isLoadingModels}
            required
          >
            <MenuItem value="">{t('Выберите модель')}</MenuItem>
            {modelsData?.data.map((model: CarModel) => (
              <MenuItem key={model.id} value={model.id.toString()}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('Год выпуска')}
            value={carInfo.year}
            onChange={handleYearChange}
            required
            inputProps={{ maxLength: 4 }}
          />
          <FormHelperText>
            {t('Введите год от 1900 до текущего года')}
          </FormHelperText>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('Гос. номер (необязательно)')}
            value={carInfo.license_plate}
            onChange={handleLicensePlateChange}
            placeholder={t('Например: А123БВ777')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarInfoForm; 