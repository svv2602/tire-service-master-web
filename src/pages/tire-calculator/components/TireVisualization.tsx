import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme
} from '@mui/material';
import { TireAlternative } from '../../../types/tire-calculator';

interface TireVisualizationProps {
  originalDiameter: number;
  alternatives: TireAlternative[];
}

const TireVisualization: React.FC<TireVisualizationProps> = ({
  originalDiameter,
  alternatives
}) => {
  const theme = useTheme();

  // Функция для рендеринга круга шины
  const renderTireCircle = (diameter: number, isOriginal: boolean = false, label: string = '') => {
    const maxDiameter = Math.max(originalDiameter, ...alternatives.map(a => a.calculatedDiameter));
    const minDiameter = Math.min(originalDiameter, ...alternatives.map(a => a.calculatedDiameter));
    const range = maxDiameter - minDiameter;
    
    // Нормализуем размер для отображения (минимум 80px, максимум 120px)
    const normalizedSize = range > 0 
      ? 80 + ((diameter - minDiameter) / range) * 40
      : 100;

    const color = isOriginal 
      ? theme.palette.primary.main
      : theme.palette.secondary.main;

    return (
      <Box
        sx={{
          width: normalizedSize,
          height: normalizedSize,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          position: 'relative',
          bgcolor: isOriginal 
            ? theme.palette.primary.main + '10'
            : theme.palette.secondary.main + '10'
        }}
      >
        {/* Внутренний круг диска */}
        <Box
          sx={{
            width: normalizedSize * 0.6,
            height: normalizedSize * 0.6,
            borderRadius: '50%',
            bgcolor: theme.palette.grey[300],
            border: `2px solid ${theme.palette.grey[500]}`
          }}
        />
        
        {/* Метка размера */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            color: color,
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  const getDeviationColor = (deviationPercent: number) => {
    const absDeviation = Math.abs(deviationPercent);
    if (absDeviation <= 1) return 'success';
    if (absDeviation <= 3) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Визуальное сравнение размеров
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Сравнение общих диаметров шин. Синий круг - исходная шина, фиолетовые - альтернативы.
      </Typography>

      <Grid container spacing={3} alignItems="center">
        {/* Исходная шина */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              border: `2px solid ${theme.palette.primary.main}`,
              bgcolor: theme.palette.primary.main + '05'
            }}
          >
            <CardContent sx={{ pb: '16px !important' }}>
              {renderTireCircle(originalDiameter, true, `${originalDiameter.toFixed(1)} мм`)}
              <Typography variant="subtitle2" sx={{ mt: 3, fontWeight: 'bold' }}>
                Исходная шина
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Базовый размер
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Альтернативные размеры */}
        {alternatives.slice(0, 4).map((alternative, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent sx={{ pb: '16px !important' }}>
                {renderTireCircle(
                  alternative.calculatedDiameter, 
                  false, 
                  `${alternative.calculatedDiameter.toFixed(1)} мм`
                )}
                
                <Typography variant="subtitle2" sx={{ mt: 3, fontWeight: 'bold' }}>
                  {alternative.size}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${alternative.deviationPercent > 0 ? '+' : ''}${alternative.deviationPercent.toFixed(1)}%`}
                    size="small"
                    color={getDeviationColor(alternative.deviationPercent)}
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {alternative.deviationMm > 0 ? '+' : ''}{alternative.deviationMm.toFixed(1)} мм
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Дополнительная информация */}
      <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Примечание:</strong> Размеры кругов пропорциональны реальным диаметрам шин. 
          Изменение диаметра влияет на клиренс автомобиля, точность спидометра и работу электронных систем.
        </Typography>
      </Box>
    </Box>
  );
};

export default TireVisualization;
