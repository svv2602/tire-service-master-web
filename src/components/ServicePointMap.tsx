import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { ServicePoint } from '../types/models';

interface ServicePointMapProps {
  servicePoints: ServicePoint[];
}

const ServicePointMap: React.FC<ServicePointMapProps> = ({ servicePoints }) => {
  // Фильтруем только активные сервисные точки
  const activeServicePoints = servicePoints.filter(point => point.is_active);

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Сервисные точки
        </Typography>
        
        {activeServicePoints.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Нет активных сервисных точек для отображения
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Найдено {activeServicePoints.length} активных точек
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
                  Телефон: {point.phone}
                </Typography>
                <Chip
                  label="Активна"
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