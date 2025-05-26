import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ServicePoint } from '../types/models';

interface ServicePointDetailsProps {
  servicePoint: ServicePoint;
}

const getDayName = (dayNumber: number): string => {
  const days = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
  ];
  return days[dayNumber - 1] || '';
};

const ServicePointDetails: React.FC<ServicePointDetailsProps> = ({ servicePoint }) => {
  return (
    <Box>
      {/* Основная информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {servicePoint.name}
              </Typography>
              <Chip
                label={servicePoint.is_active ? 'Активна' : 'Неактивна'}
                color={servicePoint.is_active ? 'success' : 'error'}
                icon={servicePoint.is_active ? <CheckCircleIcon /> : <CancelIcon />}
              />
            </Box>
            {servicePoint.description && (
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {servicePoint.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Адрес"
                    secondary={`${servicePoint.address}, ${servicePoint.city?.name}, ${servicePoint.city?.region?.name}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Контактный телефон"
                    secondary={servicePoint.contact_phone}
                  />
                </ListItem>
              </List>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="warning" />
                  <Typography variant="body1">
                    Рейтинг: <Rating value={servicePoint.rating || 0} readOnly precision={0.5} />
                    ({servicePoint.review_count || 0} отзывов)
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Количество постов: {servicePoint.post_count}
                </Typography>
                <Typography variant="body1">
                  Длительность слота по умолчанию: {servicePoint.default_slot_duration} мин.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* График работы */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon />
          График работы
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>День недели</TableCell>
                <TableCell>Время работы</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicePoint.schedule.map((scheduleItem) => (
                <TableRow key={scheduleItem.day_of_week}>
                  <TableCell>{getDayName(scheduleItem.day_of_week)}</TableCell>
                  <TableCell>
                    {scheduleItem.is_working_day
                      ? `${scheduleItem.start_time} - ${scheduleItem.end_time}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={scheduleItem.is_working_day ? 'Рабочий' : 'Выходной'}
                      color={scheduleItem.is_working_day ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Услуги и цены */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon />
          Услуги и цены
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Услуга</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell align="right">Цена</TableCell>
                <TableCell align="right">Длительность</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicePoint.services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.service?.name}</TableCell>
                  <TableCell>{service.service?.category?.name}</TableCell>
                  <TableCell align="right">{service.price} ₽</TableCell>
                  <TableCell align="right">{service.duration} мин.</TableCell>
                  <TableCell>
                    <Chip
                      label={service.is_available ? 'Доступна' : 'Недоступна'}
                      color={service.is_available ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Фотографии */}
      {servicePoint.photos.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Фотографии
          </Typography>
          <ImageList cols={3} gap={16}>
            {servicePoint.photos.map((photo) => (
              <ImageListItem key={photo.id}>
                <img
                  src={photo.url}
                  alt={photo.description || 'Фото сервисной точки'}
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
                {photo.is_main && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Главное фото
                  </Box>
                )}
              </ImageListItem>
            ))}
          </ImageList>
        </Paper>
      )}

      {/* Отзывы */}
      {servicePoint.reviews.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon />
            Отзывы
          </Typography>
          <List>
            {servicePoint.reviews.map((review) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {review.user?.first_name} {review.user?.last_name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {review.comment}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ServicePointDetails; 