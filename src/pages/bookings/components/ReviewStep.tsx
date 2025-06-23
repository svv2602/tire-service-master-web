// Шаг 6: Подтверждение и обзор данных

import React from 'react';
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

// Импорт API хуков
import { useGetCityByIdQuery } from '../../../api/cities.api';
import { useGetServicePointBasicInfoQuery } from '../../../api/servicePoints.api';
import { useGetCarTypeByIdQuery } from '../../../api/carTypes.api';

// Импорт типов
import { BookingFormData } from '../NewBookingWithAvailabilityPage';

// Импорт стилей
import { getCardStyles } from '../../../styles/components';

interface ReviewStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  isValid,
}) => {
  const theme = useTheme();
  
  // API запросы для получения данных
  const { data: cityData } = useGetCityByIdQuery(formData.city_id || 0, {
    skip: !formData.city_id
  });
  
  const { data: servicePointData } = useGetServicePointBasicInfoQuery(
    formData.service_point_id?.toString() || '',
    { skip: !formData.service_point_id }
  );
  
  const { data: carTypeData } = useGetCarTypeByIdQuery(
    formData.car_type_id?.toString() || '',
    { skip: !formData.car_type_id }
  );
  
  // Функции для получения названий
  const getServicePointName = () => {
    if (!servicePointData) return 'Загрузка...';
    return servicePointData.name;
  };
  
  const getServicePointAddress = () => {
    if (!servicePointData) return '';
    return servicePointData.address;
  };
  
  const getCityName = () => {
    if (!cityData?.data) return 'Загрузка...';
    return cityData.data.name;
  };
  
  const getCarTypeName = () => {
    if (!carTypeData) return 'Загрузка...';
    return carTypeData.name;
  };
  
  // Подсчет общей стоимости услуг
  const calculateTotalPrice = () => {
    return formData.services.reduce((total, service) => {
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
                  secondary={
                    <Box>
                      <Typography variant="body2" component="div">
                        {getServicePointName()}
                      </Typography>
                      {getServicePointAddress() && (
                        <Typography variant="caption" color="text.secondary" component="div">
                          {getServicePointAddress()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Дата и время"
                  secondary={`${formatBookingDate()} в ${formData.start_time}`}
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
              Контактная информация
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Имя"
                  secondary={formData.client_name}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Телефон"
                  secondary={formData.client_phone}
                />
              </ListItem>
              
              {formData.client_email && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={formData.client_email}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Информация об автомобиле */}
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
        
        {/* Услуги */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...getCardStyles(theme), p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ServiceIcon color="primary" />
              Услуги
            </Typography>
            
            {formData.services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Услуги не выбраны. Вы сможете обсудить их с мастером на месте.
              </Typography>
            ) : (
              <Box>
                <List dense>
                  {formData.services.map((service, index) => (
                    <ListItem key={service.service_id}>
                      <ListItemIcon>
                        <ServiceIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Услуга #${service.service_id}`}
                        secondary={`${service.price} ₴ × ${service.quantity} = ${service.price * service.quantity} ₴`}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Общая стоимость:
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
      
      {/* Важная информация */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        ⚠️ После подтверждения записи вам будет отправлено SMS с деталями
      </Alert>
      
      {/* Согласие с условиями */}
      <Alert severity="info" sx={{ mt: 3 }}>
        🔒 Нажимая "Подтвердить бронирование", вы соглашаетесь с условиями предоставления услуг
      </Alert>
    </Box>
  );
};

export default ReviewStep;
