// Шаг 2: Выбор города и точки обслуживания (с учетом категории)

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  CircularProgress,
  FormHelperText,
  Alert,
} from '@mui/material';
import { Info as InfoIcon, LocationOn as LocationIcon, CheckCircle as CheckCircleIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорт API хуков
import { useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';
import { useGetServicePointsByCategoryQuery } from '../../../api/servicePoints.api';
import { useGetServicePointServicesQuery } from '../../../api/servicePoints.api';
import { useGetServiceCategoryByIdQuery } from '../../../api/serviceCategories.api';

// Импорт типов
import { City, ServicePoint } from '../../../types/models';
import { ServicePointCard, ServicePointData } from '../../../components/ui/ServicePointCard';

interface CityServicePointStepProps {
  formData: any; // Используем any для совместимости с разными структурами BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

// Функция конвертации ServicePoint в ServicePointData
const convertServicePointToServicePointData = (servicePoint: ServicePoint): ServicePointData => {
  return {
    id: servicePoint.id,
    name: servicePoint.name,
    address: servicePoint.address || '',
    description: servicePoint.description,
    city: servicePoint.city ? {
      id: servicePoint.city.id,
      name: servicePoint.city.name,
      region: servicePoint.city.region?.name
    } : undefined,
    partner: servicePoint.partner ? {
      id: servicePoint.partner.id,
      name: servicePoint.partner.company_name || servicePoint.partner.name || ''
    } : undefined,
    contact_phone: servicePoint.contact_phone || servicePoint.phone,
    work_status: servicePoint.work_status,
    is_active: servicePoint.is_active,
    photos: servicePoint.photos?.map(photo => ({
      id: photo.id,
      url: photo.url || '',
      description: photo.description,
      is_main: photo.is_main || false,
      sort_order: photo.sort_order || 0
    })) || [],
  };
};

// Обертка для ServicePointCard с загрузкой услуг
const ServicePointCardWrapper: React.FC<{
  servicePoint: ServicePoint;
  isSelected: boolean;
  onSelect: (servicePointData: ServicePointData) => void;
}> = ({ servicePoint, isSelected, onSelect }) => {
  const { data: servicesData } = useGetServicePointServicesQuery(servicePoint.id.toString());
  
  const servicePointData = convertServicePointToServicePointData(servicePoint);
  const services = servicesData || [];

  return (
    <Grid item xs={12} md={6} lg={4}>
      <ServicePointCard
        servicePoint={servicePointData}
        variant="compact"
        isSelected={isSelected}
        onSelect={() => onSelect(servicePointData)}
        showSelectButton={true}
        services={services}
      />
    </Grid>
  );
};

const CityServicePointStep: React.FC<CityServicePointStepProps> = ({
  formData,
  setFormData,
  onNext,
  isValid,
}) => {
  const theme = useTheme();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [autoFilledData, setAutoFilledData] = useState(false);
  
  // Загрузка информации о выбранной категории
  const { data: selectedCategory } = useGetServiceCategoryByIdQuery(
    formData.service_category_id?.toString() || '',
    { skip: !formData.service_category_id }
  );
  
  // Загрузка городов с точками обслуживания
  const { data: citiesData, isLoading: isLoadingCities, error: citiesError } = useGetCitiesWithServicePointsQuery();
  
  // Загрузка точек обслуживания для выбранного города и категории
  const { data: servicePointsData, isLoading: isLoadingServicePoints, error: servicePointsError } = useGetServicePointsByCategoryQuery(
    { 
      categoryId: formData.service_category_id,
      cityId: selectedCity?.id
    },
    { skip: !formData.service_category_id || !selectedCity }
  );
  
  // Получаем списки из данных API с мемоизацией
  const cities = useMemo(() => citiesData?.data || [], [citiesData]);
  const servicePoints = useMemo(() => servicePointsData?.data || [], [servicePointsData]);
  
  // Функция для получения списка незаполненных обязательных полей
  const getRequiredFieldErrors = () => {
    const errors: string[] = [];
    
    if (!formData.city_id) {
      errors.push('Город');
    }
    
    if (!formData.service_point_id) {
      errors.push('Точка обслуживания');
    }
    
    return errors;
  };
  
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
    setFormData((prev: any) => ({
      ...prev,
      city_id: city?.id || null,
      service_point_id: null, // Сбрасываем выбранную точку обслуживания
    }));
    
    // Если пользователь изменил город, значит данные больше не предзаполнены
    setAutoFilledData(false);
  };
  
  // Обработчик выбора точки обслуживания
  const handleServicePointSelect = (servicePointData: ServicePointData) => {
    setFormData((prev: any) => ({
      ...prev,
      service_point_id: servicePointData.id,
    }));
    
    // Если пользователь выбрал точку обслуживания вручную, значит данные больше не предзаполнены
    setAutoFilledData(false);
    
    // Автоматический переход к следующему шагу через небольшую задержку
    // Это позволяет пользователю увидеть, что выбор принят
    setTimeout(() => {
      onNext();
    }, 800);
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Выберите город и точку обслуживания
      </Typography>
      
      {/* Информация о выбранной категории */}
      {selectedCategory && (
        <Alert 
          severity="info" 
          icon={<CategoryIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Выбранная категория:</strong> {selectedCategory.name}
          </Typography>
          {selectedCategory.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedCategory.description}
            </Typography>
          )}
        </Alert>
      )}
      
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
      
      {/* Уведомление о автоматическом переходе */}
      {isValid && !autoFilledData && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ mb: 3 }}
        >
          ✅ Город и точка обслуживания выбраны. Переход к выбору даты и времени через несколько секунд...
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
                label="Город *"
                placeholder="Выберите город для продолжения"
                required
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
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box component="li" key={key} {...otherProps}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  {option.name}
                </Box>
              );
            }}
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
              Доступные точки обслуживания в г. {selectedCity.name} *
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
      
      {/* Уведомление о незаполненных обязательных полях */}
      {(!isValid) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Заполните все обязательные поля:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            {getRequiredFieldErrors().map((field, index) => (
              <Typography variant="body2" component="li" key={index}>
                {field}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}
      
      {/* Информационное сообщение */}
      {(isValid) && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Все обязательные поля заполнены. Можете перейти к следующему шагу.
        </Alert>
      )}
    </Box>
  );
};

export default CityServicePointStep;
