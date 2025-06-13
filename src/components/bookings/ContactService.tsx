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
  const { t } = useTranslation();
  
  // Запрос на получение данных о сервисной точке
  const { data: servicePoint, isLoading, isError } = useGetServicePointByIdQuery(String(servicePointId));

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Контактная информация')}
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
          {t('Контактная информация')}
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('Не удалось загрузить контактную информацию')}
        </Alert>
      </Paper>
    );
  }

  // Преобразуем рабочие часы в строку для отображения
  const formatWorkingHours = (workingHours: any): string => {
    if (!workingHours) return 'Информация отсутствует';
    
    try {
      if (typeof workingHours === 'string') {
        return workingHours;
      }
      
      // Предполагаем, что workingHours - это объект с днями недели
      const daysTranslation: Record<string, string> = {
        monday: 'Понедельник',
        tuesday: 'Вторник',
        wednesday: 'Среда',
        thursday: 'Четверг',
        friday: 'Пятница',
        saturday: 'Суббота',
        sunday: 'Воскресенье'
      };
      
      return Object.entries(workingHours)
        .map(([day, hours]) => {
          if (!hours || (hours as any).closed) return `${daysTranslation[day]}: Выходной`;
          return `${daysTranslation[day]}: ${(hours as any).start || ''} - ${(hours as any).end || ''}`;
        })
        .join('\n');
    } catch (error) {
      console.error('Ошибка форматирования рабочих часов:', error);
      return 'Информация отсутствует';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('Контактная информация')}
      </Typography>
      
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          {servicePoint.name || t('Шиномонтажный сервис')}
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
                {t('Часы работы')}:
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
          {t('Позвонить в сервис')}
        </Button>
        
        {servicePoint.email && (
          <Button 
            variant="outlined" 
            fullWidth
            href={`mailto:${servicePoint.email}`}
            startIcon={<EmailIcon />}
            sx={{ mt: 1 }}
          >
            {t('Написать на почту')}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ContactService; 