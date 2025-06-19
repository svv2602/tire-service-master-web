// Шаг 1: Выбор города и точки обслуживания

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт API хуков
import { useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';
import { useSearchServicePointsQuery } from '../../../api/servicePoints.api';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';
import { City, ServicePoint } from '../../../types/models';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface CityServicePointStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const CityServicePointStep: React.FC<CityServicePointStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const theme = useTheme();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  // Загрузка городов с точками обслуживания
  const { data: citiesData, isLoading: isLoadingCities, error: citiesError } = useGetCitiesWithServicePointsQuery();
  
  // Загрузка точек обслуживания для выбранного города
  const { data: servicePointsData, isLoading: isLoadingServicePoints, error: servicePointsError } = useSearchServicePointsQuery(
    { city: selectedCity?.name || '' },
    { skip: !selectedCity }
  );
  
  // Получаем списки из данных API с мемоизацией
  const cities = useMemo(() => citiesData?.data || [], [citiesData]);
  const servicePoints = useMemo(() => servicePointsData?.data || [], [servicePointsData]);
  
  // Устанавливаем выбранный город при изменении formData
  useEffect(() => {
    if (formData.city_id && cities.length > 0) {
      const city = cities.find(c => c.id === formData.city_id);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [formData.city_id, cities]);
  
  // Обработчик выбора города
  const handleCityChange = (city: City | null) => {
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      city_id: city?.id || null,
      service_point_id: null, // Сбрасываем выбранную точку обслуживания
    }));
  };
  
  // Обработчик выбора точки обслуживания
  const handleServicePointSelect = (servicePoint: ServicePoint) => {
    setFormData(prev => ({
      ...prev,
      service_point_id: servicePoint.id,
    }));
  };
  
  // Рендер карточки точки обслуживания
  const renderServicePointCard = (servicePoint: ServicePoint) => {
    const isSelected = formData.service_point_id === servicePoint.id;
    
    return (
      <Card
        key={servicePoint.id}
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
        <CardActionArea onClick={() => handleServicePointSelect(servicePoint)}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {servicePoint.name}
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {servicePoint.address}
              </Typography>
            </Box>
            
            {servicePoint.contact_phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {servicePoint.contact_phone}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {servicePoint.is_active ? 'Работает' : 'Не работает'}
              </Typography>
            </Box>
            
            {servicePoint.partner?.name && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={servicePoint.partner.name}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Выберите город и точку обслуживания
      </Typography>
      
      <Grid container spacing={3}>
        {/* Выбор города */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1. Выберите город
          </Typography>
          
          {citiesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка загрузки городов. Попробуйте обновить страницу.
            </Alert>
          )}
          
          <Autocomplete
            value={selectedCity}
            onChange={(_, value) => handleCityChange(value)}
            options={cities}
            getOptionLabel={(option) => option.name}
            loading={isLoadingCities}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите город"
                placeholder="Начните вводить название города"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingCities && <CircularProgress color="inherit" size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  {option.region?.name && (
                    <Typography variant="caption" color="text.secondary">
                      {option.region.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            noOptionsText="Города не найдены"
            loadingText="Загрузка городов..."
          />
          
          {!formData.city_id && (
            <FormHelperText error>
              Выберите город для продолжения
            </FormHelperText>
          )}
        </Grid>
        
        {/* Выбор точки обслуживания */}
        {selectedCity && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              2. Выберите точку обслуживания
            </Typography>
            
            {servicePointsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Ошибка загрузки точек обслуживания. Попробуйте выбрать город заново.
              </Alert>
            )}
            
            {isLoadingServicePoints ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : servicePoints.length === 0 ? (
              <Alert severity="info">
                В выбранном городе нет доступных точек обслуживания.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {servicePoints.map((servicePoint) => (
                  <Grid item xs={12} sm={6} md={4} key={servicePoint.id}>
                    {renderServicePointCard(servicePoint)}
                  </Grid>
                ))}
              </Grid>
            )}
            
            {!formData.service_point_id && servicePoints.length > 0 && (
              <FormHelperText error sx={{ mt: 1 }}>
                Выберите точку обслуживания для продолжения
              </FormHelperText>
            )}
          </Grid>
        )}
      </Grid>
      
      {/* Информация о следующем шаге */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Город и точка обслуживания выбраны. Теперь можно перейти к выбору даты и времени.
        </Alert>
      )}
    </Box>
  );
};

export default CityServicePointStep;
