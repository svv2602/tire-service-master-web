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
import { ServicePoint } from '../types/models';

interface ServicePointDetailsProps {
  servicePoint: ServicePoint;
}

// Вспомогательные функции
const formatWorkingHours = (workingHours: string | Record<string, { start: string; end: string }>): string => {
  if (typeof workingHours === 'string') {
    try {
      const hours = JSON.parse(workingHours);
      return Object.entries(hours).map(([day, time]) => `${day}: ${time}`).join(', ');
    } catch {
      return workingHours;
    }
  } else if (typeof workingHours === 'object') {
    return Object.entries(workingHours).map(([day, time]) => `${day}: ${time.start}-${time.end}`).join(', ');
  }
  return 'Не указано';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationIcon color="action" />
              <Typography>
                {servicePoint.address}
                {servicePoint.city && `, ${servicePoint.city.name}`}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PhoneIcon color="action" />
              <Typography>{servicePoint.phone}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmailIcon color="action" />
              <Typography>{servicePoint.email}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ScheduleIcon color="action" />
              <Typography>Режим работы: {formatWorkingHours(servicePoint.working_hours)}</Typography>
            </Box>
            
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