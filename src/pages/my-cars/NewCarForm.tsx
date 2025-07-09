// Форма добавления нового автомобиля
// Использует централизованную систему стилей для единообразия интерфейса

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { fetchWithAuth } from '../../api/apiUtils';
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles 
} from '../../styles/components';
import { SIZES } from '../../styles/theme';

// Интерфейсы для типов данных
interface CarBrand {
  id: number;
  name: string;
}

interface CarModel {
  id: number;
  name: string;
  car_brand_id: number;
}

interface CarType {
  id: number;
  name: string;
}

const NewCarForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  
  // Формируем стили с помощью централизованной системы
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const outlinedButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  // Состояние формы
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    color: '',
    is_primary: false,
    car_type_id: 0 as number | null,
    car_brand_id: 0 as number | null,
    car_model_id: 0 as number | null
  });
  
  // Справочные данные
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([]);
  
  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка справочных данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Загружаем марки автомобилей
        const brandsResponse = await fetchWithAuth('/api/v1/car_brands');
        if (!brandsResponse.ok) throw new Error('Не удалось загрузить марки автомобилей');
        const brandsData = await brandsResponse.json();
        setCarBrands(brandsData);
        
        // Загружаем модели автомобилей
        const modelsResponse = await fetchWithAuth('/api/v1/car_models');
        if (!modelsResponse.ok) throw new Error('Не удалось загрузить модели автомобилей');
        const modelsData = await modelsResponse.json();
        setCarModels(modelsData);
        
        // Загружаем типы автомобилей
        const typesResponse = await fetchWithAuth('/api/v1/car_types');
        if (!typesResponse.ok) throw new Error('Не удалось загрузить типы автомобилей');
        const typesData = await typesResponse.json();
        setCarTypes(typesData);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Фильтрация моделей при изменении марки
  useEffect(() => {
    if (formData.car_brand_id) {
      const filtered = carModels.filter(model => model.car_brand_id === formData.car_brand_id);
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [formData.car_brand_id, carModels]);
  
  // Обработчик изменения текстовых полей
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик изменения селектов
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Если изменилась марка, сбрасываем выбранную модель
    if (name === 'car_brand_id') {
      setFormData(prev => ({ ...prev, car_model_id: null }));
    }
    
    // Обновляем поля make и model при выборе из справочников
    if (name === 'car_brand_id') {
      const brand = carBrands.find(b => b.id === value);
      if (brand) {
        setFormData(prev => ({ ...prev, make: brand.name }));
      }
    }
    
    if (name === 'car_model_id') {
      const model = carModels.find(m => m.id === value);
      if (model) {
        setFormData(prev => ({ ...prev, model: model.name }));
      }
    }
  };
  
  // Обработчик изменения чекбокса
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user?.id) {
      setError('Отсутствует идентификатор клиента');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetchWithAuth(
        `/api/v1/clients/${user.id}/cars`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось добавить автомобиль');
      }
      
      // Перенаправляем на страницу со списком автомобилей
      navigate('/my-cars');
    } catch (err) {
      console.error('Ошибка добавления автомобиля:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ my: SIZES.spacing.xl }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ my: SIZES.spacing.lg }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {t('forms.clientPages.newCarForm.title')}
      </Typography>
      
      <Paper sx={cardStyles}>
        {error && (
          <Alert severity="error" sx={{ mb: SIZES.spacing.lg }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={SIZES.spacing.lg}>
            {/* Марка автомобиля */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={textFieldStyles}>
                <InputLabel id="car-brand-label">{t('forms.clientPages.newCarForm.carBrand')}</InputLabel>
                <Select
                  labelId="car-brand-label"
                  name="car_brand_id"
                  value={formData.car_brand_id || ''}
                  onChange={handleSelectChange}
                  label={t('forms.clientPages.newCarForm.carBrand')}
                  required
                >
                  {carBrands.map(brand => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Модель автомобиля */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!formData.car_brand_id} sx={textFieldStyles}>
                <InputLabel id="car-model-label">{t('forms.clientPages.newCarForm.carModel')}</InputLabel>
                <Select
                  labelId="car-model-label"
                  name="car_model_id"
                  value={formData.car_model_id || ''}
                  onChange={handleSelectChange}
                  label={t('forms.clientPages.newCarForm.carModel')}
                  required
                >
                  {filteredModels.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Марка (если нет в списке) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('forms.clientPages.newCarForm.customBrand')}
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                disabled={!!formData.car_brand_id}
                sx={textFieldStyles}
              />
            </Grid>
            
            {/* Модель (если нет в списке) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('forms.clientPages.newCarForm.customModel')}
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                disabled={!!formData.car_model_id}
                sx={textFieldStyles}
              />
            </Grid>
            
            {/* Год выпуска */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('forms.clientPages.newCarForm.year')}
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                required
                sx={textFieldStyles}
              />
            </Grid>
            
            {/* Гос. номер */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('forms.clientPages.newCarForm.licensePlate')}
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                required
                sx={textFieldStyles}
              />
            </Grid>
            
            {/* Цвет */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('forms.clientPages.newCarForm.color')}
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                sx={textFieldStyles}
              />
            </Grid>
            
            {/* Тип автомобиля */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={textFieldStyles}>
                <InputLabel id="car-type-label">{t('forms.clientPages.newCarForm.carType')}</InputLabel>
                <Select
                  labelId="car-type-label"
                  name="car_type_id"
                  value={formData.car_type_id || ''}
                  onChange={handleSelectChange}
                  label={t('forms.clientPages.newCarForm.carType')}
                  required
                >
                  {carTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Основной автомобиль */}
            <Grid item xs={12} md={6}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={formData.is_primary} 
                    onChange={handleCheckboxChange}
                    name="is_primary"
                  />
                } 
                label={t('forms.clientPages.newCarForm.isPrimary')}
              />
            </Grid>
            
            {/* Кнопки */}
            <Grid item xs={12}>
              <Box 
                display="flex" 
                justifyContent="space-between"
                sx={{ mt: SIZES.spacing.md }}
              >
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/my-cars')}
                  disabled={loading}
                  sx={outlinedButtonStyles}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  sx={buttonStyles}
                >
                  {loading ? <CircularProgress size={24} /> : 'Добавить автомобиль'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NewCarForm; 