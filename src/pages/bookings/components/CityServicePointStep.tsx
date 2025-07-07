// Шаг 2: Выбор города и точки обслуживания (с учетом категории)

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  CircularProgress,
  FormHelperText,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Info as InfoIcon, LocationOn as LocationIcon, CheckCircle as CheckCircleIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Импорт API хуков
import { useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';
import { useGetServicePointsByCategoryQuery } from '../../../api/servicePoints.api';
import { useGetServicePointServicesQuery } from '../../../api/servicePoints.api';
import { useGetServiceCategoryByIdQuery } from '../../../api/serviceCategories.api';
import { useGetServicePointByIdQuery } from '../../../api/servicePoints.api';

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

// Обертка для ServicePointCard с загрузкой полных данных
const ServicePointCardWrapper: React.FC<{
  servicePoint: ServicePoint;
  isSelected: boolean;
  onSelect: (servicePointData: ServicePointData) => void;
  onViewDetails: (servicePointData: ServicePointData) => void;
}> = ({ servicePoint, isSelected, onSelect, onViewDetails }) => {
  // Загружаем полные данные сервисной точки включая фотографии и service_posts
  const { data: fullServicePointData, isLoading } = useGetServicePointByIdQuery(servicePoint.id.toString());
  
  // Преобразуем данные в нужный формат
  const servicePointData = convertServicePointToServicePointData(fullServicePointData || servicePoint);
  
  // Извлекаем уникальные категории из service_posts
  const categories = useMemo(() => {
    if (!fullServicePointData?.service_posts) return [];
    
    const uniqueCategories = new Map();
    fullServicePointData.service_posts.forEach(post => {
      if (post.service_category && !uniqueCategories.has(post.service_category.id)) {
        uniqueCategories.set(post.service_category.id, {
          id: post.service_category.id,
          name: post.service_category.name,
          description: post.service_category.description,
          services_count: post.service_category.services_count || 0
        });
      }
    });
    
    return Array.from(uniqueCategories.values());
  }, [fullServicePointData?.service_posts]);

  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Grid item xs={12} md={6} lg={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6} lg={4}>
      <ServicePointCard
        servicePoint={servicePointData}
        variant="compact"
        isSelected={isSelected}
        onSelect={() => onSelect(servicePointData)}
        onViewDetails={() => onViewDetails(servicePointData)}
        showSelectButton={true}
        showDetailsLink={true}
        categories={categories}
        isLoadingCategories={isLoading}
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
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
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
      errors.push(t('bookingSteps.cityServicePoint.requiredFields.city'));
    }
    
    if (!formData.service_point_id) {
      errors.push(t('bookingSteps.cityServicePoint.requiredFields.servicePoint'));
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
  
  // Обработчик перехода к детальной странице сервисной точки
  const handleViewDetails = (servicePointData: ServicePointData) => {
    // Переход на клиентскую страницу сервисной точки
    navigate(`/client/service-point/${servicePointData.id}`);
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        {t('bookingSteps.cityServicePoint.title')}
      </Typography>
      
      {/* Информация о выбранной категории */}
      {selectedCategory && (
        <Alert 
          severity="info" 
          icon={<CategoryIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>{t('bookingSteps.cityServicePoint.selectedCategory')}</strong> {selectedCategory.name}
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
          {t('bookingSteps.cityServicePoint.prefilledDataNotice')}
        </Alert>
      )}
      
      {/* Уведомление о автоматическом переходе */}
      {isValid && !autoFilledData && (
        <Alert severity="success">
          {t('bookingSteps.cityServicePoint.allFieldsCompleted')}
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
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={isLoadingCities}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('bookingSteps.cityServicePoint.cityLabel')}
                placeholder={`${t('bookingSteps.cityServicePoint.selectCity')} ${t('bookingSteps.cityServicePoint.selectCityPlaceholder')}`}
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
              {t('bookingSteps.cityServicePoint.citiesLoadingError')}
            </FormHelperText>
          )}
        </Grid>

        {/* Точки обслуживания */}
        {selectedCity && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('bookingSteps.cityServicePoint.availableServicePoints', { cityName: selectedCity.name })}
            </Typography>
            
            {isLoadingServicePoints ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {t('bookingSteps.cityServicePoint.loadingServicePoints')}
                </Typography>
              </Box>
            ) : servicePointsError ? (
              <Alert severity="error">
                {t('bookingSteps.cityServicePoint.servicePointsLoadingError')}
              </Alert>
            ) : servicePoints.length === 0 ? (
              <Alert severity="info">
                {t('bookingSteps.cityServicePoint.noServicePointsAvailable')}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {servicePoints.map((servicePoint) => (
                  <ServicePointCardWrapper
                    key={servicePoint.id}
                    servicePoint={servicePoint}
                    isSelected={formData.service_point_id === servicePoint.id}
                    onSelect={handleServicePointSelect}
                    onViewDetails={handleViewDetails}
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
            {t('bookingSteps.cityServicePoint.fillRequiredFields')}
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
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('bookingSteps.cityServicePoint.allFieldsCompleted')}
        </Alert>
      )}
    </Box>
  );
};

export default CityServicePointStep;
