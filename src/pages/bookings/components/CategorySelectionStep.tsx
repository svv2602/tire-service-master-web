import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton,
  Chip,
  Autocomplete,
  TextField
} from '@mui/material';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useGetServiceCategoriesByCityIdQuery } from '../../../api/serviceCategories.api';
import { useGetCityByIdQuery, useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';

interface CategorySelectionStepProps {
  formData: any; // Используем any для совместимости с существующей структурой
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  formData,
  setFormData,
  onNext,
  isValid
}) => {
  // Загружаем категории услуг по выбранному городу
  const { data: categoriesResponse, isLoading, error } = useGetServiceCategoriesByCityIdQuery(
    formData.city_id!,
    { skip: !formData.city_id }
  );

  const categories = categoriesResponse?.data || [];

  // Загружаем список городов с сервисными точками для селекта
  const { data: citiesResponse, isLoading: citiesLoading } = useGetCitiesWithServicePointsQuery();

  // Загружаем информацию о выбранном городе
  const { data: cityResponse, isLoading: isCityLoading } = useGetCityByIdQuery(
    formData.city_id!,
    { skip: !formData.city_id }
  );

  const cities = citiesResponse?.data || [];
  const selectedCity = cityResponse?.data;

  // Отладочная информация (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log('CategorySelectionStep Debug:', {
      formData_city_id: formData.city_id,
      selectedCity,
      isCityLoading,
      cityResponse,
      categoriesResponse,
      categories_count: categories.length
    });
  }

  const handleCityChange = (newCity: any) => {
    setFormData((prev: any) => ({
      ...prev,
      city_id: newCity ? newCity.id : null,
      // Сбрасываем зависимые поля при смене города
      service_category_id: null,
      service_point_id: null,
      booking_date: '',
      start_time: ''
    }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setFormData((prev: any) => ({ 
      ...prev,
      service_category_id: categoryId,
      // Сбрасываем следующие шаги при смене категории
      service_point_id: null,
      booking_date: '',
      start_time: ''
    }));
    
    // Автоматически переходим к следующему шагу
    setTimeout(() => {
      onNext();
    }, 300);
  };

  if (isLoading && formData.city_id) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите тип услуг
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && formData.city_id) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите тип услуг
        </Typography>
        <Alert severity="error">
          Ошибка загрузки категорий услуг для выбранного города. Попробуйте выбрать другой город или обновить страницу.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выберите тип услуг
      </Typography>
      
      {/* Селект для выбора города */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedCity || null}
          onChange={(event, newValue) => handleCityChange(newValue)}
          options={cities}
          getOptionLabel={(option) => option.name}
          loading={citiesLoading || isCityLoading}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                {option.region && (
                  <Typography variant="caption" color="text.secondary">
                    {option.region.name}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Выберите город"
              placeholder="Начните вводить название города"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          noOptionsText="Города не найдены"
          loadingText="Загрузка городов..."
          sx={{ minWidth: 300 }}
        />
      </Box>
      
      {/* Отладочная информация (временно) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
          Debug: city_id={formData.city_id}, loading={isCityLoading ? 'true' : 'false'}, 
          hasCity={selectedCity ? 'true' : 'false'}, categories_count={categories.length}
        </Alert>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedCity 
          ? `Доступные категории услуг в городе ${selectedCity.name} (${categories.length})`
          : 'Сначала выберите город, чтобы увидеть доступные категории услуг'
        }
      </Typography>

      {/* Отображение категорий */}
      {selectedCity && (
        <>
          {categories.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              В выбранном городе пока нет доступных категорий услуг. Попробуйте выбрать другой город.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: formData.service_category_id === category.id 
                        ? 'primary.main' 
                        : 'transparent',
                      backgroundColor: formData.service_category_id === category.id 
                        ? 'primary.50' 
                        : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {category.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {category.service_points_count && (
                          <Chip 
                            size="small" 
                            label={`${category.service_points_count} точек`}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {category.services_count && (
                          <Chip 
                            size="small" 
                            label={`${category.services_count} услуг`}
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {!selectedCity && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Сначала выберите город для отображения доступных категорий услуг
        </Alert>
      )}
      
      {selectedCity && formData.service_category_id && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Категория услуг выбрана. Переход к выбору сервисной точки...
        </Alert>
      )}
    </Box>
  );
};

export default CategorySelectionStep; 