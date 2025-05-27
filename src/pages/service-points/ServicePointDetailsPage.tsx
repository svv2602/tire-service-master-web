import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServicePointByIdQuery,
  useGetServicePointServicesQuery,
  useGetServicesQuery,
  useGetServicePointPhotosQuery,
  useGetScheduleQuery,
  useGetPartnerByIdQuery,
  useGetCityByIdQuery,
  useGetRegionByIdQuery,
} from '../../api';
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import { ServicePointService } from '../../types/service';
import { TimeSlot, Schedule } from '../../types/schedule';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ServicePoint } from '../../types/models';
import { Partner } from '../../types/partner';

const getDayName = (day: number): string => {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[day];
};

const ServicePointDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(id || '');

  const { data: servicePointServices, isLoading: servicesLoading } = useGetServicePointServicesQuery(id || '');

  const { data: allServices, isLoading: allServicesLoading } = useGetServicesQuery();

  const { data: photos, isLoading: photosLoading } = useGetServicePointPhotosQuery(id || '');

  const { data: schedule, isLoading: scheduleLoading } = useGetScheduleQuery({
    service_point_id: id || '',
    date: new Date().toISOString().split('T')[0] // Текущая дата в формате YYYY-MM-DD
  }, { skip: !id });

  const { data: partner, isLoading: partnerLoading } = useGetPartnerByIdQuery(servicePoint?.partner_id.toString() || '', {
    skip: !servicePoint?.partner_id,
  });

  const { data: city, isLoading: cityLoading } = useGetCityByIdQuery(servicePoint?.city_id?.toString() || '', {
    skip: !servicePoint?.city_id,
  });

  const { data: region, isLoading: regionLoading } = useGetRegionByIdQuery(city?.region_id?.toString() || '', {
    skip: !city?.region_id,
  });

  if (servicePointLoading || servicesLoading || allServicesLoading || photosLoading || scheduleLoading || partnerLoading || cityLoading || regionLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!servicePoint) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Сервисная точка не найдена
        </Typography>
      </Box>
    );
  }

  const servicePointServicesData = servicePointServices?.data || [];
  const servicesMap = new Map(allServices?.map(service => [service.id, service]) || []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {servicePoint.name}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" paragraph>
          {servicePoint.address}
        </Typography>
        {(city || region) && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {region && (
              <Chip
                label={region.name}
                color="primary"
                variant="outlined"
              />
            )}
            {city && (
              <Chip
                label={city.name}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {servicePoint.working_hours && typeof servicePoint.working_hours === 'object' && (
        <>
          <Typography variant="h6" gutterBottom>
            Режим работы:
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>День недели</TableCell>
                  <TableCell>Время работы</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(servicePoint.working_hours as Record<string, { start: string; end: string }>).map(([day, hours]) => (
                  <TableRow key={day}>
                    <TableCell>{getDayName(Number(day))}</TableCell>
                    <TableCell>
                      {hours.start} - {hours.end}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {servicePoint.working_hours && typeof servicePoint.working_hours === 'string' && (
        <>
          <Typography variant="h6" gutterBottom>
            Режим работы:
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {servicePoint.working_hours}
          </Typography>
        </>
      )}

      {partner && (
        <>
          <Typography variant="h6" gutterBottom>
            Информация о партнере:
          </Typography>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {partner.company_name}
              </Typography>
              <Typography variant="body1" paragraph>
                {partner.company_description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Телефон: {partner.user?.phone || 'Не указан'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {partner.user?.email || 'Не указан'}
              </Typography>
              {partner.contact_person && (
                <Typography variant="body2" color="text.secondary">
                  Контактное лицо: {partner.contact_person}
                </Typography>
              )}
            </CardContent>
          </Card>
          <Divider sx={{ mb: 4 }} />
        </>
      )}

      {photos && photos.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Фотографии:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.description || 'Фото сервисной точки'}
                  />
                  {photo.description && (
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {photo.description}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {schedule && schedule.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Расписание на {schedule[0]?.date ? format(new Date(schedule[0].date), 'd MMMM yyyy', { locale: ru }) : new Date().toLocaleDateString('ru-RU')}:
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Время</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule[0]?.slots?.map((slot: TimeSlot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      {format(new Date(`2000-01-01T${slot.startTime}`), 'HH:mm')} - {format(new Date(`2000-01-01T${slot.endTime}`), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={slot.isAvailable ? 'Доступно' : 'Занято'} 
                        color={slot.isAvailable ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Typography variant="h6" gutterBottom>
        Услуги:
      </Typography>
      {servicePointServicesData.length > 0 ? (
        <Grid container spacing={2}>
          {servicePointServicesData.map((service: ServicePointService) => {
            const serviceDetails = servicesMap.get(service.serviceId);
            return (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {serviceDetails?.name || 'Услуга'}
                    </Typography>
                    {serviceDetails?.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {serviceDetails.description}
                      </Typography>
                    )}
                    <Typography variant="body1" color="primary">
                      {service.price || serviceDetails?.price || 'Цена по запросу'} руб.
                    </Typography>
                    {serviceDetails?.duration && (
                      <Typography variant="body2" color="text.secondary">
                        Длительность: {serviceDetails.duration} мин.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Нет доступных услуг
        </Typography>
      )}
    </Box>
  );
};

export default ServicePointDetailsPage; 
