import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { ServicePoint } from '../types/models';
import { useTranslation } from 'react-i18next';

interface ServicePointMapProps {
  servicePoints: ServicePoint[];
}

const ServicePointMap: React.FC<ServicePointMapProps> = ({ servicePoints }) => {
  const { t } = useTranslation('components');
  
  // Фильтруем только активные сервисные точки
  const activeServicePoints = servicePoints.filter(point => point.is_active);

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {t('servicePointMap.title')}
        </Typography>
        
        {activeServicePoints.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('servicePointMap.noActivePoints')}
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('servicePointMap.foundActivePoints', { count: activeServicePoints.length })}
            </Typography>
            
            {activeServicePoints.map((point) => (
              <Box key={point.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {point.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {point.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('servicePointMap.phone')}: {point.contact_phone}
                </Typography>
                <Chip
                  label={t('servicePointMap.active')}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ServicePointMap; 