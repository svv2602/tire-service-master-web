// Шаг 6: Подтверждение и обзор данных

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Импорт типов - используем any для совместимости
import { getCardStyles } from '../../../styles/components';

// Импорт API хуков
import { useGetCityByIdQuery } from '../../../api/cities.api';
import { useGetServicePointBasicInfoQuery } from '../../../api/servicePoints.api';
import { useGetCarTypeByIdQuery } from '../../../api/carTypes.api';
// import { useGetServiceByIdQuery } from '../../../api/services.api'; // Не потрібно - використовуємо service.name

interface ReviewStepProps {
  formData: any; // Используем any для совместимости с локальным BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  isValid,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Для локализации названий на уровне компонента
  const getLocalizedCityName = (cityData: any) => {
    if (!cityData) return '';
    const city = cityData.data || cityData;
    const currentLocale = localStorage.getItem('i18nextLng') || 'ru';
    
    if (currentLocale === 'uk') {
      return city.name_uk || city.name_ru || city.name || '';
    }
    return city.name_ru || city.name_uk || city.name || '';
  };
  
  // API запросы для получения названий
  const { data: cityData, isLoading: cityLoading, error: cityError } = useGetCityByIdQuery(formData.city_id || 0, {
    skip: !formData.city_id
  });
  
  const { data: servicePointData } = useGetServicePointBasicInfoQuery(
    formData.service_point_id?.toString() || '', 
    {
      skip: !formData.service_point_id
    }
  );
  
  const { data: carTypeData } = useGetCarTypeByIdQuery(
    formData.car_type_id?.toString() || '', 
    {
      skip: !formData.car_type_id
    }
  );
  
  // Функции для получения названий
  const getServicePointName = () => {
    if (servicePointData) {
      return servicePointData.name || `${t('bookingSteps.review.servicePoint')} #${formData.service_point_id}`;
    }
    return `${t('bookingSteps.review.servicePoint')} #${formData.service_point_id}`;
  };
  
  const getServicePointAddress = () => {
    if (servicePointData && cityData) {
      // API возвращает данные в формате { data: City }
      const cityName = getLocalizedCityName(cityData);
      return `${cityName}, ${servicePointData.address}`;
    }
    return servicePointData?.address || '';
  };
  
  const getServicePointPhone = () => {
    return servicePointData?.phone || '';
  };
  
  const getCityName = () => {
    if (cityLoading) {
      return t('bookingSteps.review.loadingCity');
    }
    if (cityError) {
      return `${t('bookingSteps.review.city')} #${formData.city_id} (${t('bookingSteps.review.cityLoadError')})`;
    }
    if (cityData) {
      // API возвращает данные в формате { data: City }
      return getLocalizedCityName(cityData) || `${t('bookingSteps.review.city')} #${formData.city_id}`;
    }
    return `${t('bookingSteps.review.city')} #${formData.city_id}`;
  };
  
  const getCarTypeName = () => {
    if (carTypeData) {
      return carTypeData.name || `${t('bookingSteps.review.carType')} #${formData.car_type_id}`;
    }
    return `${t('bookingSteps.review.carType')} #${formData.car_type_id}`;
  };
  
  // Подсчет общей стоимости услуг
  const calculateTotalPrice = () => {
    return formData.services.reduce((total: number, service: any) => {
      return total + (service.price * service.quantity);
    }, 0);
  };
  
  // Форматирование даты
  const formatBookingDate = () => {
    if (!formData.booking_date) return '';
    try {
      const date = parseISO(formData.booking_date);
      return format(date, 'dd MMMM yyyy, EEEE', { locale: ru });
    } catch (error) {
      return formData.booking_date;
    }
  };
  
  // Компонент для отображения услуги
  const ServiceItem: React.FC<{ service: any }> = ({ service }) => {
    // Используем name из service объекта, который уже содержит правильный перевод
    const serviceName = service.name || `${t('bookingSteps.review.services')} #${service.service_id}`;
    
    return (
      <ListItem key={service.service_id}>
        <ListItemIcon>
          <ServiceIcon color="action" />
        </ListItemIcon>
        <ListItemText
          primary={serviceName}
          secondary={`${service.price} ${t('bookingSteps.review.currency')} × ${service.quantity} = ${service.price * service.quantity} ${t('bookingSteps.review.currency')}`}
        />
      </ListItem>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        {t('bookingSteps.review.title')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('bookingSteps.review.description')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Информация о записи */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              {t('bookingSteps.review.bookingDetails')}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('bookingSteps.review.city')}
                  secondary={getCityName()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('bookingSteps.review.servicePoint')}
                  secondary={getServicePointName()}
                />
              </ListItem>
              
              {getServicePointAddress() && (
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('bookingSteps.review.address')}
                    secondary={getServicePointAddress()}
                  />
                </ListItem>
              )}
              
              {getServicePointPhone() && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('bookingSteps.review.phone')}
                    secondary={getServicePointPhone()}
                  />
                </ListItem>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('bookingSteps.review.dateTime')}
                  secondary={`${formatBookingDate()} ${t('bookingSteps.review.dateTimeSeparator')} ${formData.start_time}`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Контактная информация */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              {t('bookingSteps.review.clientInfo')}
            </Typography>
            
            <List dense>
              {/* ✅ Информация о получателе услуги (для всех типов бронирований) */}
              {formData.service_recipient && (
                <>
                  {/* Имя и фамилия */}
                  {(formData.service_recipient.first_name || formData.service_recipient.last_name) && (
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.name')}
                        secondary={`${formData.service_recipient.first_name || ''}${formData.service_recipient.last_name ? ' ' + formData.service_recipient.last_name : ''}`.trim()}
                      />
                    </ListItem>
                  )}
                  
                  {/* Телефон */}
                  {formData.service_recipient.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.phone')}
                        secondary={formData.service_recipient.phone}
                      />
                    </ListItem>
                  )}
                  
                  {/* Email (если указан) */}
                  {formData.service_recipient.email && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.email')}
                        secondary={formData.service_recipient.email}
                      />
                    </ListItem>
                  )}
                </>
              )}
              
              {/* ✅ Fallback: показываем старую структуру для совместимости */}
              {!formData.service_recipient && formData.client && (
                <>
                  {/* Имя и фамилия */}
                  {formData.client.first_name && (
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.name')}
                        secondary={`${formData.client.first_name}${formData.client.last_name ? ' ' + formData.client.last_name : ''}`}
                      />
                    </ListItem>
                  )}
                  
                  {/* Телефон */}
                  {formData.client.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.phone')}
                        secondary={formData.client.phone}
                      />
                    </ListItem>
                  )}
                  
                  {/* Email (если указан) */}
                  {formData.client.email && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('bookingSteps.review.email')}
                        secondary={formData.client.email}
                      />
                    </ListItem>
                  )}
                </>
              )}
              
              {/* ✅ Сообщение если нет контактной информации */}
              {!formData.service_recipient && !formData.client && (
                <ListItem>
                  <ListItemText
                    primary={`${t('bookingSteps.review.clientInfo')} ${t('bookingSteps.review.noContactInfo')}`}
                    secondary={t('bookingSteps.review.noContactInfoDescription')}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Автомобиль */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon color="primary" />
              {t('bookingSteps.review.carInfo')}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CarIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('bookingSteps.review.carType')}
                  secondary={getCarTypeName()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CarIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('bookingSteps.review.licensePlate')}
                  secondary={formData.license_plate}
                />
              </ListItem>
              
              {formData.car_brand && (
                <ListItem>
                  <ListItemIcon>
                    <CarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('bookingSteps.review.carBrandModel')}
                    secondary={`${formData.car_brand} ${formData.car_model}`.trim()}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Услуги */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ServiceIcon color="primary" />
              {t('bookingSteps.review.services')}
            </Typography>
            
            {formData.services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('bookingSteps.review.services')} {t('bookingSteps.review.noServicesSelected')}
              </Typography>
            ) : (
              <Box>
                <List dense>
                  {formData.services.map((service: any) => (
                    <ServiceItem key={service.service_id} service={service} />
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {t('bookingSteps.review.total')}:
                  </Typography>
                  <Chip
                    label={`${calculateTotalPrice()} ${t('bookingSteps.review.currency')}`}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Комментарий */}
        {formData.notes && (
          <Grid item xs={12}>
            <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon color="primary" />
                {t('bookingSteps.review.comments')}
              </Typography>
              
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formData.notes}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Настройки уведомлений */}
      <Alert severity="info" sx={{ mt: 4 }}>
        📧 {t('bookingSteps.review.notifications')}
        <FormControlLabel
          control={
            <Checkbox
              checked={true}
              color="primary"
            />
          }
          label={t('bookingSteps.review.notificationsText')}
          sx={{ mt: 1, display: 'block' }}
        />
      </Alert>
      
      {/* Согласие с условиями */}
      <Alert severity="info" sx={{ mt: 3 }}>
        🔒 {t('bookingSteps.review.agreement')}
      </Alert>
    </Box>
  );
};

export default ReviewStep;
