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
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  
  // Функции для получения названий
  const getServicePointName = () => {
    // В реальном приложении здесь будет запрос к API
    return `Точка обслуживания #${formData.service_point_id}`;
  };
  
  const getCityName = () => {
    // В реальном приложении здесь будет запрос к API
    return `Город #${formData.city_id}`;
  };
  
  const getCarTypeName = () => {
    // В реальном приложении здесь будет запрос к API
    return `Тип автомобиля #${formData.car_type_id}`;
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
                  secondary={getServicePointName()}
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
                  <CheckIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Номер"
                  secondary={formData.license_plate}
                />
              </ListItem>
              
              {formData.car_brand && (
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="action" />
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
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Важная информация:
        </Typography>
        <Box component="ul" sx={{ mt: 0, pl: 2.5 }}>
          <Box component="li" sx={{ mb: 0.5 }}>После подтверждения записи вам будет отправлено SMS с деталями</Box>
          <Box component="li" sx={{ mb: 0.5 }}>Рекомендуем прибыть за 5-10 минут до назначенного времени</Box>
          <Box component="li" sx={{ mb: 0.5 }}>При необходимости изменения времени звоните заранее</Box>
          <Box component="li" sx={{ mb: 0.5 }}>Стоимость услуг может отличаться от предварительной</Box>
        </Box>
      </Alert>
      
      {/* Согласие с условиями */}
      <Paper sx={{ ...getCardStyles(theme), p: 2, mt: 3, bgcolor: 'success.50' }}>
        <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon />
          Нажимая "Подтвердить бронирование", вы соглашаетесь с условиями предоставления услуг
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReviewStep;
