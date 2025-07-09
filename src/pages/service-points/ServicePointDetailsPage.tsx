import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetServicePointByIdQuery,
  useGetServicePointServicesQuery,
  useGetServicePointPhotosQuery,
  useGetScheduleQuery,
  useGetPartnerByIdQuery,
  useGetCityByIdQuery,
  useGetRegionByIdQuery,
  useGetServicePointBasicInfoQuery,
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
import { ServicePointService, WorkingHours } from '../../types/models';
import { Service } from '../../types/service';
import { useGetServicesQuery } from '../../api/servicesList.api';
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
import { Partner } from '../../types/models';
import { useTranslation } from 'react-i18next';

const getDayName = (day: number, t: any): string => {
  return t(`forms.servicePoints.getDayName.${day}`);
};

const ServicePointDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: basicInfo } = useGetServicePointBasicInfoQuery(id || '', {
    skip: !id
  });

  const { data: servicePoint, isLoading: servicePointLoading } = useGetServicePointByIdQuery(
    { 
      partner_id: basicInfo?.partner_id || 0,
      id: id || ''
    },
    {
      skip: !id || !basicInfo?.partner_id
    }
  );

  const { data: servicePointServices, isLoading: servicesLoading } = useGetServicePointServicesQuery(id || '');

  const { data: allServices } = useGetServicesQuery({});

  const { data: photos, isLoading: photosLoading } = useGetServicePointPhotosQuery(id || '');

  const { data: schedule, isLoading: scheduleLoading } = useGetScheduleQuery({
    service_point_id: id || '',
    date: new Date().toISOString().split('T')[0]
  }, {
    skip: !id
  });

  const { data: partner, isLoading: partnerLoading } = useGetPartnerByIdQuery(servicePoint?.partner_id || 0, {
    skip: !servicePoint?.partner_id,
  });

  const { data: city, isLoading: cityLoading } = useGetCityByIdQuery(servicePoint?.city_id || 0, {
    skip: !servicePoint?.city_id,
  });

  const { data: region, isLoading: regionLoading } = useGetRegionByIdQuery(city?.data?.region_id || 0, {
    skip: !city?.data?.region_id,
  });

  const servicesMap = React.useMemo(() => {
    if (!allServices?.data) return new Map<number, Service>();
    return new Map(allServices.data.map((service: Service) => [service.id, service]));
  }, [allServices?.data]);

  const servicePointServicesData = servicePointServices || [];

  if (servicePointLoading || servicesLoading || photosLoading || scheduleLoading || partnerLoading || cityLoading || regionLoading) {
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
          {t('forms.servicePoints.messages.notFound')}
        </Typography>
      </Box>
    );
  }

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
                label={city.data?.name || t('servicePoints.unknownCity')}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {partner && (
        <>
          <Typography variant="h6" gutterBottom>
            {t('servicePoints.partnerInfo')}:
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
                {t('servicePoints.phone')}: {partner.user?.phone || t('servicePoints.notSpecified')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('servicePoints.email')}: {partner.user?.email || t('servicePoints.notSpecified')}
              </Typography>
              {partner.contact_person && (
                <Typography variant="body2" color="text.secondary">
                  {t('servicePoints.contactPerson')}: {partner.contact_person}
                </Typography>
              )}
            </CardContent>
          </Card>
          <Divider sx={{ mb: 4 }} />
        </>
      )}

      {photos && photos.data && photos.data.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            {t('servicePoints.photos')}:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {photos.data.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.description || t('servicePoints.servicePointPhoto')}
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
            {t('servicePoints.scheduleFor')} {new Date().toLocaleDateString('ru-RU', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}:
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('servicePoints.dayOfWeek')}</TableCell>
                  <TableCell>{t('servicePoints.workingHours')}</TableCell>
                  <TableCell>{t('servicePoints.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((workingDay: WorkingHours, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{getDayName(index, t)}</TableCell>
                    <TableCell>
                      {workingDay.is_working_day 
                        ? `${workingDay.start} - ${workingDay.end}`
                        : t('servicePoints.dayOff')
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={workingDay.is_working_day ? t('servicePoints.workingDay') : t('servicePoints.dayOff')} 
                        color={workingDay.is_working_day ? 'success' : 'default'} 
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
        {t('servicePoints.services')}:
      </Typography>
      {servicePointServicesData.length > 0 ? (
        <Grid container spacing={2}>
          {servicePointServicesData.map((service: ServicePointService) => {
            const serviceDetails = servicesMap.get(service.service_id);
            return (
              <Grid item xs={12} sm={6} md={4} key={service.service_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {serviceDetails?.name || t('servicePoints.service')}
                    </Typography>
                    {serviceDetails?.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {serviceDetails.description}
                      </Typography>
                    )}
                    <Typography variant="body1" color="primary">
                      {service.price || t('servicePoints.priceOnRequest')} {t('servicePoints.ruble')}
                    </Typography>
                    {service.duration && (
                      <Typography variant="body2" color="text.secondary">
                        {t('servicePoints.duration')}: {service.duration} {t('servicePoints.minutes')}
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
          {t('servicePoints.noServicesFound')}
        </Typography>
      )}
    </Box>
  );
};

export default ServicePointDetailsPage;
