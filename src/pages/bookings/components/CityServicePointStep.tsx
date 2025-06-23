// Шаг 1: Выбор города и точки обслуживания

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Autocomplete,
  TextField,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { Info as InfoIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт API хуков
import { useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';
import { useSearchServicePointsQuery } from '../../../api/servicePoints.api';
import { useGetServicePointServicesQuery } from '../../../api/servicePoints.api';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';
import { City, ServicePoint } from '../../../types/models';

// Импорт компонента карточки
import { ServicePointCard, ServicePointData } from '../../../components/ui/ServicePointCard';

interface CityServicePointStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

// Функция конвертации ServicePoint в ServicePointData
const convertServicePointToServicePointData = (servicePoint: ServicePoint): ServicePointData => {
  return {
    id: servicePoint.id,
    name: servicePoint.name,
    address: servicePoint.address,
    description: servicePoint.description,
    city: servicePoint.city ? {
      id: servicePoint.city.id,
      name: servicePoint.city.name,
      region: servicePoint.city.region?.name || ''
    } : undefined,
    partner: servicePoint.partner,
    contact_phone: servicePoint.contact_phone,
    average_rating: (servicePoint as any).average_rating,
    reviews_count: (servicePoint as any).reviews_count,
    work_status: servicePoint.work_status,
    is_active: servicePoint.is_active,
    photos: servicePoint.photos?.map(photo => ({
      ...photo,
      sort_order: photo.sort_order || 0
    }))
  };
};

// Компонент-обертка для карточки с хуками
const ServicePointCardWrapper: React.FC<{
  servicePoint: ServicePoint;
  isSelected: boolean;
  onSelect: (servicePointData: ServicePointData) => void;
}> = ({ servicePoint, isSelected, onSelect }) => {
  // Загрузка услуг для данной точки обслуживания
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicePointServicesQuery(servicePoint.id.toString());
  const services = (servicesData as any)?.data || [];

  return (
    <Grid item xs={12} md={6} lg={4}>
      <ServicePointCard
        servicePoint={convertServicePointToServicePointData(servicePoint)}
        isSelected={isSelected}
        onSelect={onSelect}
        showSelectButton={true}
        services={services}
        isLoadingServices={isLoadingServices}
        variant="compact"
      />
    </Grid>
  );
};

const CityServicePointStep: React.FC<CityServicePointStepProps> = ({
  formData,
  setFormData,
  isValid,
}) => {
  const theme = useTheme();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [autoFilledData, setAutoFilledData] = useState(false);
  
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
        
        // Если город и сервисная точка уже выбраны при первой загрузке,
        // считаем, что данные были предзаполнены
        if (formData.service_point_id && !autoFilledData) {
          setAutoFilledData(true);
        }
      }
    }
  }, [formData.city_id, formData.service_point_id, cities, autoFilledData]);
  
  // Обработчик выбора города
  const handleCityChange = (city: City | null) => {
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      city_id: city?.id || null,
      service_point_id: null, // Сбрасываем выбранную точку обслуживания
    }));
    
    // Если пользователь изменил город, значит данные больше не предзаполнены
    setAutoFilledData(false);
  };
  
  // Обработчик выбора точки обслуживания
  const handleServicePointSelect = (servicePointData: ServicePointData) => {
    setFormData(prev => ({
      ...prev,
      service_point_id: servicePointData.id,
    }));
    
    // Если пользователь выбрал точку обслуживания вручную, значит данные больше не предзаполнены
    setAutoFilledData(false);
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Выберите город и точку обслуживания
      </Typography>
      
      {/* Уведомление о предзаполненных данных */}
      {autoFilledData && isValid && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 3 }}
        >
          Город и сервисная точка уже выбраны на основе вашего предыдущего выбора. Вы можете изменить их или перейти к следующему шагу.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Выбор города */}
        <Grid item xs={12}>
          <Autocomplete
            value={selectedCity}
            onChange={(_, newValue) => handleCityChange(newValue)}
            options={cities}
            getOptionLabel={(option) => option.name}
            loading={isLoadingCities}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Город"
                placeholder="Выберите город"
                error={!formData.city_id && !isLoadingCities}
                helperText={!formData.city_id && !isLoadingCities ? 'Выберите город для продолжения' : ''}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingCities ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                {option.name}
              </Box>
            )}
          />
          
          {citiesError && (
            <FormHelperText error>
              Ошибка загрузки городов. Попробуйте обновить страницу.
            </FormHelperText>
          )}
        </Grid>

        {/* Точки обслуживания */}
        {selectedCity && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Доступные точки обслуживания в г. {selectedCity.name}
            </Typography>
            
            {isLoadingServicePoints ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Загрузка точек обслуживания...
                </Typography>
              </Box>
            ) : servicePointsError ? (
              <Alert severity="error">
                Ошибка загрузки точек обслуживания. Попробуйте выбрать другой город.
              </Alert>
            ) : servicePoints.length === 0 ? (
              <Alert severity="info">
                В выбранном городе нет доступных точек обслуживания.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {servicePoints.map((servicePoint) => (
                  <ServicePointCardWrapper
                    key={servicePoint.id}
                    servicePoint={servicePoint}
                    isSelected={formData.service_point_id === servicePoint.id}
                    onSelect={handleServicePointSelect}
                  />
                ))}
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
      
      {/* Валидация */}
      {!formData.city_id && selectedCity === null && (
        <FormHelperText error sx={{ mt: 2 }}>
          Выберите город для продолжения
        </FormHelperText>
      )}
      
      {formData.city_id && !formData.service_point_id && servicePoints.length > 0 && (
        <FormHelperText error sx={{ mt: 2 }}>
          Выберите точку обслуживания для продолжения
        </FormHelperText>
      )}
      
      {/* Подтверждение выбора */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Город и точка обслуживания выбраны. Теперь можно перейти к выбору даты и времени.
        </Alert>
      )}
    </Box>
  );
};

export default CityServicePointStep;
