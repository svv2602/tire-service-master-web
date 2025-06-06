import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Rating,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Build as ServiceIcon,
  Photo as PhotoIcon,
} from '@mui/icons-material';
import type { ServicePoint } from '../types/models';
import type { WorkingHoursSchedule, WorkingHours } from '../types/working-hours';
import { FlexBox } from '../components/styled/CommonComponents';

interface ServicePointDetailsProps {
  servicePoint: ServicePoint;
}

type DaysMap = {
  [key: string]: string;
};

// Вспомогательные функции
const formatWorkingHours = (workingHours: WorkingHoursSchedule | undefined): string => {
  if (!workingHours) return 'График работы не указан';

  const days = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  } as const;

  const workingDays = (Object.entries(workingHours) as [keyof WorkingHoursSchedule, WorkingHours][])
    .filter(([_, hours]) => hours.is_working_day)
    .map(([day, hours]) => `${days[day as keyof typeof days]}: ${hours.start}-${hours.end}`)
    .join(', ');

  return workingDays || 'График работы не указан';
};

const formatDate = (date: string): string => {
  const formattedDate = new Date(date).toLocaleDateString();
  return formattedDate.split(',').join(' ');
};

const ServicePointDetails: React.FC<ServicePointDetailsProps> = ({ servicePoint }) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Основная информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {servicePoint.name}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FlexBox alignItems="center" gap={1} my={2}>
              <LocationIcon color="action" />
              <Typography>
                {servicePoint.address}
                {servicePoint.city && `, ${servicePoint.city.name}`}
              </Typography>
            </FlexBox>
            
            <FlexBox alignItems="center" gap={1} my={2}>
              <PhoneIcon color="action" />
              <Typography>{servicePoint.contact_phone}</Typography>
            </FlexBox>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FlexBox alignItems="center" gap={1} my={2}>
              <ScheduleIcon color="action" />
              <Typography>Режим работы: {formatWorkingHours(servicePoint.working_hours)}</Typography>
            </FlexBox>
            
            <Chip
              label={servicePoint.is_active ? 'Активна' : 'Неактивна'}
              color={servicePoint.is_active ? 'success' : 'error'}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Отзывы */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы клиентов
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Отзывы пока не загружены
        </Typography>
      </Paper>
    </Box>
  );
};

export default ServicePointDetails; 