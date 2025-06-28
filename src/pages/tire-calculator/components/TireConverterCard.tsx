import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface TireSize {
  width: number;
  profile: number;
  diameter: number;
}

interface InchSize {
  overallDiameter: number;
  sectionWidth: number;
  rimDiameter: number;
}

const TireConverterCard: React.FC = () => {
  const theme = useTheme();
  
  const [metricSize, setMetricSize] = useState<TireSize>({ width: 0, profile: 0, diameter: 0 });
  
  const [inchSize, setInchSize] = useState<InchSize>({ overallDiameter: 0, sectionWidth: 0, rimDiameter: 0 });
  
  const [conversionDirection, setConversionDirection] = useState<'metric-to-inch' | 'inch-to-metric'>('metric-to-inch');
  const [result, setResult] = useState<string>('');
  const [recommendationMessage, setRecommendationMessage] = useState<string>('');

  const convertMetricToInch = useCallback(() => {
    if (metricSize.width && metricSize.profile && metricSize.diameter) {
      const sidewallHeight = (metricSize.width * metricSize.profile) / 100;
      const overallDiameter = ((metricSize.diameter * 25.4) + (2 * sidewallHeight)) / 25.4;
      const sectionWidth = metricSize.width / 25.4;
      
      // Рассчитываем общий диаметр в мм для рекомендации
      const overallDiameterMm = Math.round(overallDiameter * 25.4);
      
      setResult(`Дюймовый размер: ${overallDiameter.toFixed(1)}/${sectionWidth.toFixed(1)}R${metricSize.diameter}. Для подбора метрического размера по диаметру колеса используйте целевой диаметр равный ${overallDiameterMm} мм`);
      setConversionDirection('metric-to-inch');
    }
  }, [metricSize]);

  const convertInchToMetric = useCallback(() => {
    if (inchSize.overallDiameter && inchSize.sectionWidth && inchSize.rimDiameter) {
      const width = Math.round(inchSize.sectionWidth * 25.4);
      const sidewallHeight = ((inchSize.overallDiameter - inchSize.rimDiameter) / 2) * 25.4;
      const profile = Math.round((sidewallHeight / width) * 100);
      
      // Рассчитываем общий диаметр в мм для рекомендации
      const overallDiameterMm = Math.round(inchSize.overallDiameter * 25.4);
      
      setResult(`Метрический размер: ${width}/${profile}R${inchSize.rimDiameter}. Для подбора метрического размера по диаметру колеса используйте целевой диаметр равный ${overallDiameterMm} мм`);
      setConversionDirection('inch-to-metric');
    }
  }, [inchSize]);

  const handleCalculate = () => {
    if (conversionDirection === 'metric-to-inch') {
      convertMetricToInch();
    } else {
      convertInchToMetric();
    }
  };

  const handleReset = () => {
    setMetricSize({ width: 0, profile: 0, diameter: 0 });
    setInchSize({ overallDiameter: 0, sectionWidth: 0, rimDiameter: 0 });
    setResult('');
    setRecommendationMessage('');
  };

  const handleSwapDirection = useCallback(() => {
    // Сохраняем текущие значения
    const currentMetric = { ...metricSize };
    const currentInch = { ...inchSize };
    
    // Очищаем результат
    setResult('');
    
    // Если есть данные в метрической системе, конвертируем в дюймовую
    if (currentMetric.width && currentMetric.profile && currentMetric.diameter) {
      const sidewallHeight = (currentMetric.width * currentMetric.profile) / 100;
      const overallDiameter = ((currentMetric.diameter * 25.4) + (2 * sidewallHeight)) / 25.4;
      const sectionWidth = currentMetric.width / 25.4;
      
      // Рассчитываем общий диаметр в мм для рекомендации
      const overallDiameterMm = Math.round(overallDiameter * 25.4);
      
      setInchSize({
        overallDiameter: parseFloat(overallDiameter.toFixed(1)),
        sectionWidth: parseFloat(sectionWidth.toFixed(1)),
        rimDiameter: currentMetric.diameter
      });
      
      setRecommendationMessage(`Для подбора метрического размера по диаметру колеса используйте целевой диаметр равный ${overallDiameterMm} мм`);
    }
    // Если есть данные в дюймовой системе, конвертируем в метрическую
    else if (currentInch.overallDiameter && currentInch.sectionWidth && currentInch.rimDiameter) {
      const width = Math.round(currentInch.sectionWidth * 25.4);
      const sidewallHeight = ((currentInch.overallDiameter - currentInch.rimDiameter) / 2) * 25.4;
      const profile = Math.round((sidewallHeight / width) * 100);
      
      // Рассчитываем общий диаметр в мм для рекомендации
      const overallDiameterMm = Math.round(currentInch.overallDiameter * 25.4);
      
      setMetricSize({
        width: width,
        profile: profile,
        diameter: currentInch.rimDiameter
      });
      
      setRecommendationMessage(`Для подбора метрического размера по диаметру колеса используйте целевой диаметр равный ${overallDiameterMm} мм`);
    }
  }, [metricSize, inchSize]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalculateIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="h3">
            Конвертер размеров шин
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Конвертация между метрической и дюймовой системами измерений
        </Typography>

        <Grid container spacing={2}>
          {/* Метрическая система */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Метрическая система
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Пример: 235/75R16
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    type="number"
                    value={metricSize.width}
                    onChange={(e) => {
                      setMetricSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }));
                      // Обнуляем дюймовые параметры при ручном вводе в метрические
                      setInchSize({ overallDiameter: 0, sectionWidth: 0, rimDiameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">мм</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                  <Typography>/</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={metricSize.profile}
                    onChange={(e) => {
                      setMetricSize(prev => ({ ...prev, profile: parseInt(e.target.value) || 0 }));
                      // Обнуляем дюймовые параметры при ручном вводе в метрические
                      setInchSize({ overallDiameter: 0, sectionWidth: 0, rimDiameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                  <Typography>R</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={metricSize.diameter}
                    onChange={(e) => {
                      setMetricSize(prev => ({ ...prev, diameter: parseInt(e.target.value) || 0 }));
                      // Обнуляем дюймовые параметры при ручном вводе в метрические
                      setInchSize({ overallDiameter: 0, sectionWidth: 0, rimDiameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">"</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Кнопка переключения и рекомендация */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSwapDirection}
                startIcon={<SwapIcon sx={{ transform: 'rotate(90deg)' }} />}
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'scale(1.02)'
                  }
                }}
              >
                Обменять
              </Button>
              
              {recommendationMessage && (
                <Alert severity="info" sx={{ flex: 1, mb: 0 }}>
                  <Typography variant="body2">
                    <strong>Рекомендация:</strong> {recommendationMessage}
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>

          {/* Дюймовая система */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Дюймовая система
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Пример: 30/9.5R16
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    type="number"
                    value={inchSize.overallDiameter}
                    onChange={(e) => {
                      setInchSize(prev => ({ ...prev, overallDiameter: parseFloat(e.target.value) || 0 }));
                      // Обнуляем метрические параметры при ручном вводе в дюймовые
                      setMetricSize({ width: 0, profile: 0, diameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">"</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                  <Typography>/</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={inchSize.sectionWidth}
                    onChange={(e) => {
                      setInchSize(prev => ({ ...prev, sectionWidth: parseFloat(e.target.value) || 0 }));
                      // Обнуляем метрические параметры при ручном вводе в дюймовые
                      setMetricSize({ width: 0, profile: 0, diameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">"</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                  <Typography>R</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={inchSize.rimDiameter}
                    onChange={(e) => {
                      setInchSize(prev => ({ ...prev, rimDiameter: parseInt(e.target.value) || 0 }));
                      // Обнуляем метрические параметры при ручном вводе в дюймовые
                      setMetricSize({ width: 0, profile: 0, diameter: 0 });
                      setResult('');
                      setRecommendationMessage('');
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">"</InputAdornment>
                    }}
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleCalculate}
            startIcon={<CalculateIcon />}
            sx={{ flex: 1 }}
          >
            Рассчитать
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RefreshIcon />}
          >
            Сброс
          </Button>
        </Box>

        {result && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Результат конвертации:</strong> {result}
            </Typography>
          </Alert>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Направление конвертации:</strong> {' '}
            {conversionDirection === 'metric-to-inch' 
              ? 'Метрическая → Дюймовая' 
              : 'Дюймовая → Метрическая'
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TireConverterCard;
