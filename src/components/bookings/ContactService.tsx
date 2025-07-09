import React from 'react';
import { Paper, Typography, Box, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useGetServicePointByIdQuery } from '../../api/servicePoints.api';
import { useTranslation } from 'react-i18next';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ContactServiceProps {
  servicePointId: string | number;
}

const ContactService: React.FC<ContactServiceProps> = ({ servicePointId }) => {
  const { t } = useTranslation('components');
  
  // Запрос на получение данных о сервисной точке
  const { data: servicePoint, isLoading, isError } = useGetServicePointByIdQuery(String(servicePointId));

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('contactService.title')}
        </Typography>
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress size={30} />
        </Box>
      </Paper>
    );
  }

  if (isError || !servicePoint) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('contactService.title')}
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('contactService.loadError')}
        </Alert>
      </Paper>
    );
  }

  // Преобразуем рабочие часы в строку для отображения
  const formatWorkingHours = (workingHours: any): string => {
    if (!workingHours) return t('contactService.noInfo');
    
    try {
      if (typeof workingHours === 'string') {
        return workingHours;
      }
      
      // Предполагаем, что workingHours - это объект с днями недели
      const daysTranslation: Record<string, string> = {
        monday: t('contactService.days.monday'),
        tuesday: t('contactService.days.tuesday'),
        wednesday: t('contactService.days.wednesday'),
        thursday: t('contactService.days.thursday'),
        friday: t('contactService.days.friday'),
        saturday: t('contactService.days.saturday'),
        sunday: t('contactService.days.sunday')
      };
      
      return Object.entries(workingHours)
        .map(([day, hours]) => {
          if (!hours || (hours as any).closed) return `${daysTranslation[day]}: ${t('contactService.closed')}`;
          return `${daysTranslation[day]}: ${(hours as any).start || ''} - ${(hours as any).end || ''}`;
        })
        .join('\n');
    } catch (error) {
      console.error(t('contactService.formatError'), error);
      return t('contactService.noInfo');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('contactService.title')}
      </Typography>
      
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          {servicePoint.name || t('contactService.defaultServiceName')}
        </Typography>
        
        {servicePoint.address && (
          <Box display="flex" alignItems="flex-start" mb={2}>
            <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
            <Typography variant="body2">
              {servicePoint.address}
            </Typography>
          </Box>
        )}
        
        {servicePoint.phone && (
          <Box display="flex" alignItems="center" mb={2}>
            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              <a href={`tel:${servicePoint.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {servicePoint.phone}
              </a>
            </Typography>
          </Box>
        )}
        
        {servicePoint.email && (
          <Box display="flex" alignItems="center" mb={2}>
            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              <a href={`mailto:${servicePoint.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {servicePoint.email}
              </a>
            </Typography>
          </Box>
        )}
        
        {servicePoint.working_hours && (
          <Box display="flex" alignItems="flex-start" mb={2}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" gutterBottom>
                {t('contactService.workingHours')}:
              </Typography>
              <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                {formatWorkingHours(servicePoint.working_hours)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box mt={2}>
        <Button 
          variant="outlined" 
          fullWidth
          href={`tel:${servicePoint.phone}`}
          startIcon={<PhoneIcon />}
          disabled={!servicePoint.phone}
        >
          {t('contactService.callButton')}
        </Button>
        
        {servicePoint.email && (
          <Button 
            variant="outlined" 
            fullWidth
            href={`mailto:${servicePoint.email}`}
            startIcon={<EmailIcon />}
            sx={{ mt: 1 }}
          >
            {t('contactService.emailButton')}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ContactService; 