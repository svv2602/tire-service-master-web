import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Comment as CommentIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { getThemeColors } from '../../styles';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetServicePointByIdQuery } from '../../api/servicePoints.api';

interface BookingService {
  service_id: number;
  quantity: number;
  price: number;
}

interface BookingSummaryProps {
  servicePointId: string;
  carInfo: {
    brand: string;
    model: string;
    year: string;
    licensePlate: string;
    carTypeId: number;
  };
  clientInfo: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  bookingDate: Date | null;
  bookingTime: string | null;
  services: BookingService[];
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  servicePointId,
  carInfo,
  clientInfo,
  bookingDate,
  bookingTime,
  services
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  const { data: servicePointData, isLoading: isLoadingServicePoint } = useGetServicePointByIdQuery(
    servicePointId,
    { skip: !servicePointId }
  );
  
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Расчет общей стоимости
  useEffect(() => {
    const sum = services.reduce((acc, service) => acc + (service.price * service.quantity), 0);
    setTotalPrice(sum);
  }, [services]);
  
  // Форматирование телефона для отображения
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone || phone.length < 10) return phone;
    
    return `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8, 10)}`;
  };
  
  // Форматирование даты
  const formatBookingDate = (date: Date | null) => {
    if (!date) return '';
    
    return format(date, 'd MMMM yyyy (EEEE)', { locale: ru });
  };
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: colors.textPrimary }}>
        Подтверждение записи
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: colors.backgroundCard }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle', color: colors.primary }} />
              Сервисный центр
            </Typography>
            
            {isLoadingServicePoint ? (
              <>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  {servicePointData?.name || 'Название не указано'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  {servicePointData?.address || 'Адрес не указан'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {servicePointData?.phone || 'Телефон не указан'}
                </Typography>
              </>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: colors.primary }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Дата
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatBookingDate(bookingDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ mr: 1, color: colors.primary }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Время
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {bookingTime || 'Не выбрано'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: colors.backgroundCard }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
              <CarIcon sx={{ mr: 1, verticalAlign: 'middle', color: colors.primary }} />
              Автомобиль
            </Typography>
            
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary="Марка и модель"
                  secondary={`${carInfo.brand} ${carInfo.model}`}
                  primaryTypographyProps={{ variant: 'body2', color: colors.textSecondary }}
                  secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemText
                  primary="Год выпуска"
                  secondary={carInfo.year}
                  primaryTypographyProps={{ variant: 'body2', color: colors.textSecondary }}
                  secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemText
                  primary="Номер автомобиля"
                  secondary={carInfo.licensePlate}
                  primaryTypographyProps={{ variant: 'body2', color: colors.textSecondary }}
                  secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: colors.backgroundCard }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', color: colors.primary }} />
              Контактные данные
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Имя
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {clientInfo.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Телефон
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatPhoneForDisplay(clientInfo.phone)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {clientInfo.email || '—'}
                </Typography>
              </Grid>
              
              {clientInfo.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Комментарий
                  </Typography>
                  <Typography variant="body1">
                    {clientInfo.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: colors.backgroundCard }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle', color: colors.primary }} />
              Услуги
            </Typography>
            
            {services.length === 0 ? (
              <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                Услуги не выбраны
              </Typography>
            ) : (
              <>
                <List disablePadding>
                  {services.map((service, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      secondaryAction={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {service.price * service.quantity} ₽
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={`Шиномонтаж (${service.quantity} шт.)`}
                        secondary={`${service.price} ₽ × ${service.quantity}`}
                        primaryTypographyProps={{ variant: 'body1' }}
                        secondaryTypographyProps={{ variant: 'body2', color: colors.textSecondary }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Итого:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                    {totalPrice} ₽
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: colors.backgroundSecondary, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Нажимая кнопку "Подтвердить запись", вы соглашаетесь с условиями предоставления услуг.
          После подтверждения записи вы получите SMS с информацией о вашей записи.
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingSummary; 