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
import { useGetServiceByIdQuery } from '../../../api/services.api';

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
      return servicePointData.name || `Точка обслуживания #${formData.service_point_id}`;
    }
    return `Точка обслуживания #${formData.service_point_id}`;
  };
  
  const getServicePointAddress = () => {
    if (servicePointData && cityData) {
      // API возвращает данные в формате { data: City }
      const cityName = cityData.data?.name || (cityData as any).name;
      return `${cityName}, ${servicePointData.address}`;
    }
    return servicePointData?.address || '';
  };
  
  const getServicePointPhone = () => {
    return servicePointData?.phone || '';
  };
  
  const getCityName = () => {
    if (cityLoading) {
      return 'Загрузка...';
    }
    if (cityError) {
      return `Город #${formData.city_id} (ошибка загрузки)`;
    }
    if (cityData) {
      // API возвращает данные в формате { data: City }
      return cityData.data?.name || (cityData as any).name || `Город #${formData.city_id}`;
    }
    return `Город #${formData.city_id}`;
  };
  
  const getCarTypeName = () => {
    if (carTypeData) {
      return carTypeData.name || `Тип автомобиля #${formData.car_type_id}`;
    }
    return `Тип автомобиля #${formData.car_type_id}`;
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
    const { data: serviceData, isLoading } = useGetServiceByIdQuery(service.service_id, {
      skip: !service.service_id
    });

    const serviceName = serviceData?.name || `Услуга #${service.service_id}`;
    
    return (
      <ListItem key={service.service_id}>
        <ListItemIcon>
          <ServiceIcon color="action" />
        </ListItemIcon>
        <ListItemText
          primary={isLoading ? 'Загрузка...' : serviceName}
          secondary={`${service.price} ₴ × ${service.quantity} = ${service.price * service.quantity} ₴`}
        />
      </ListItem>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Подтверждение записи
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Проверьте все данные перед подтверждением записи. Вы сможете изменить информацию, 
        вернувшись к предыдущим шагам.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Информация о записи */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Детали записи
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Город"
                  secondary={getCityName()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Точка обслуживания"
                  secondary={getServicePointName()}
                />
              </ListItem>
              
              {getServicePointAddress() && (
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Адрес"
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
                    primary="Телефон"
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
                  secondary={`${formatBookingDate()} в ${formData.start_time}`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* {t('bookingSteps.review.contactInfo')} */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              {t('bookingSteps.review.contactInfo')}
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
                        primary="Имя"
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
                        primary="Телефон"
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
                        primary="Email"
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
                        primary="Имя"
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
                        primary="Телефон"
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
                        primary="Email"
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
                    primary="t('bookingSteps.review.contactInfo') не указана"
                    secondary="Вернитесь к шагу `${t('bookingSteps.review.contactInfo')}` для заполнения данных"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* {t('bookingSteps.review.carInfo')} */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon color="primary" />
              Автомобиль
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CarIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Тип автомобиля"
                  secondary={getCarTypeName()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CarIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Номер"
                  secondary={formData.license_plate}
                />
              </ListItem>
              
              {formData.car_brand && (
                <ListItem>
                  <ListItemIcon>
                    <CarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Марка и модель"
                    secondary={`${formData.car_brand} ${formData.car_model}`.trim()}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* {t('bookingSteps.review.services')} */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ServiceIcon color="primary" />
              {t('bookingSteps.review.services')}
            </Typography>
            
            {formData.services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('bookingSteps.review.services')} не выбраны. Вы сможете обсудить их с мастером на месте.
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
                    label={`${calculateTotalPrice()} ₴`}
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
                Комментарий
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
        📧 Настройки уведомлений
        <FormControlLabel
          control={
            <Checkbox
              checked={true}
              color="primary"
            />
          }
          label="Получать SMS и email уведомления о статусе записи"
          sx={{ mt: 1, display: 'block' }}
        />
      </Alert>
      
      {/* Согласие с условиями */}
      <Alert severity="info" sx={{ mt: 3 }}>
        🔒 Нажимая "t('bookingSteps.review.confirm')", вы соглашаетесь с условиями предоставления услуг
      </Alert>
    </Box>
  );
};

export default ReviewStep;
