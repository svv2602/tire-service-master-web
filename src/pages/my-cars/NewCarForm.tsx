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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchWithAuth } from '../../api/apiUtils';

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
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
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
  
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Загрузка необходимых справочников
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
  
  // Фильтруем модели при изменении марки
  useEffect(() => {
    if (formData.car_brand_id) {
      const filtered = carModels.filter(model => model.car_brand_id === formData.car_brand_id);
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [formData.car_brand_id, carModels]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
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
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.client_id) {
      setError('Для добавления автомобиля необходимо войти в систему как клиент');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Подготавливаем данные для отправки
      const carData = {
        car: {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          license_plate: formData.license_plate,
          color: formData.color,
          is_primary: formData.is_primary,
          car_type_id: formData.car_type_id,
          car_brand_id: formData.car_brand_id,
          car_model_id: formData.car_model_id
        }
      };
      
      // Отправляем запрос на создание автомобиля
      const response = await fetchWithAuth(
        `/api/v1/clients/${user.client_id}/cars`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(carData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось создать автомобиль');
      }
      
      // Показываем сообщение об успехе
      setSuccess(true);
      
      // Через 2 секунды редиректим на страницу со списком автомобилей
      setTimeout(() => {
        navigate('/my-cars');
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка создания автомобиля:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box my={3}>
      <Typography variant="h5" component="h1" gutterBottom>
        Добавление нового автомобиля
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Автомобиль успешно добавлен! Перенаправление на список автомобилей...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
              <FormControl fullWidth>
                <InputLabel id="car-brand-label">Марка автомобиля</InputLabel>
                <Select
                  labelId="car-brand-label"
                  name="car_brand_id"
                  value={formData.car_brand_id || ''}
                  onChange={handleSelectChange}
                  label="Марка автомобиля"
                  required
                >
                  {carBrands.map(brand => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
              <FormControl fullWidth disabled={!formData.car_brand_id}>
                <InputLabel id="car-model-label">Модель автомобиля</InputLabel>
                <Select
                  labelId="car-model-label"
                  name="car_model_id"
                  value={formData.car_model_id || ''}
                  onChange={handleSelectChange}
                  label="Модель автомобиля"
                  required
                >
                  {filteredModels.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
              <TextField
                fullWidth
                label="Марка (если нет в списке)"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                disabled={!!formData.car_brand_id}
              />
            </div>
            
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
              <TextField
                fullWidth
                label="Модель (если нет в списке)"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                disabled={!!formData.car_model_id}
              />
            </div>
            
            <div style={{ width: '33.33%', padding: '12px', boxSizing: 'border-box' }}>
              <TextField
                fullWidth
                label="Год выпуска"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                required
              />
            </div>
            
            <div style={{ width: '33.33%', padding: '12px', boxSizing: 'border-box' }}>
              <TextField
                fullWidth
                label="Гос. номер"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div style={{ width: '33.33%', padding: '12px', boxSizing: 'border-box' }}>
              <TextField
                fullWidth
                label="Цвет"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
              <FormControl fullWidth>
                <InputLabel id="car-type-label">Тип автомобиля</InputLabel>
                <Select
                  labelId="car-type-label"
                  name="car_type_id"
                  value={formData.car_type_id || ''}
                  onChange={handleSelectChange}
                  label="Тип автомобиля"
                  required
                >
                  {carTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={formData.is_primary} 
                    onChange={handleCheckboxChange}
                    name="is_primary"
                  />
                } 
                label="Сделать основным автомобилем"
              />
            </div>
            
            <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}>
              <Box display="flex" justifyContent="space-between">
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/my-cars')}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Добавить автомобиль'}
                </Button>
              </Box>
            </div>
          </div>
        </form>
      </Paper>
    </Box>
  );
};

export default NewCarForm; 