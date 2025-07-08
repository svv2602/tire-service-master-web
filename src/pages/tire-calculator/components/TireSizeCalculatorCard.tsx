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
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Straighten as RulerIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface TireCalculationResult {
  width: number;
  profile: number;
  diameter: number;
  calculatedDiameter: number;
  deviation: number;
}

const TireSizeCalculatorCard: React.FC = (props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [targetDiameter, setTargetDiameter] = useState<number>(650);
  const [rimDiameter, setRimDiameter] = useState<number>(16);
  const [results, setResults] = useState<TireCalculationResult[]>([]);

  // Популярные ширины шин (исключаем кратные 10)
  const popularWidths = [
    165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335, 345, 355
  ];

  // Популярные профили
  const popularProfiles = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];

  const calculateTireSizes = useCallback(() => {
    const newResults: TireCalculationResult[] = [];
    
    popularWidths.forEach(width => {
      popularProfiles.forEach(profile => {
        // Расчет диаметра шины
        const sidewallHeight = (width * profile) / 100;
        const calculatedDiameter = (rimDiameter * 25.4) + (2 * sidewallHeight);
        
        // Расчет отклонения от целевого диаметра
        const deviation = Math.abs(calculatedDiameter - targetDiameter);
        const deviationPercent = (deviation / targetDiameter) * 100;
        
        // Добавляем только размеры с отклонением менее 3%
        if (deviationPercent <= 3) {
          newResults.push({
            width,
            profile,
            diameter: rimDiameter,
            calculatedDiameter,
            deviation: deviationPercent
          });
        }
      });
    });

    // Сортируем по отклонению
    newResults.sort((a, b) => a.deviation - b.deviation);
    
    // Берем первые 10 результатов
    setResults(newResults.slice(0, 10));
  }, [targetDiameter, rimDiameter]);

  const handleReset = () => {
    setTargetDiameter(650);
    setRimDiameter(16);
    setResults([]);
  };

  const getDeviationColor = (deviation: number) => {
    if (deviation <= 1) return 'success';
    if (deviation <= 2) return 'warning';
    return 'info';
  };

  const getDeviationText = (deviation: number) => {
    if (deviation <= 1) return t('tireCalculator.recommendation');
    if (deviation <= 2) return t('tireCalculator.attention_required');
    return t('tireCalculator.check_compatibility');
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RulerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="h3">
            {t('tireCalculator.sizeCalculator.title', 'Подбор размера по диаметру')}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('tireCalculator.find_tire_sizes_description')}
        </Typography>

        <Grid container spacing={3}>
          {/* Параметры поиска */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {t('tireCalculator.search_parameters')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('tireCalculator.target_diameter_label')}
                  type="number"
                  value={targetDiameter}
                  onChange={(e) => setTargetDiameter(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>{t('tireCalculator.mm_unit')}</Typography>
                  }}
                  helperText={t('tireCalculator.target_diameter_helper_text')}
                  fullWidth
                />
                
                <TextField
                  label={t('tireCalculator.rim_diameter_label')}
                  type="number"
                  value={rimDiameter}
                  onChange={(e) => setRimDiameter(parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>{t('tireCalculator.inches_unit')}</Typography>
                  }}
                  helperText={t('tireCalculator.rim_diameter_helper_text')}
                  fullWidth
                />
              </Box>
            </Paper>
          </Grid>

          {/* Информация */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {t('tireCalculator.information')}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                • {t('tireCalculator.search_based_on_popular_sizes')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • {t('tireCalculator.show_sizes_with_up_to_3_deviation')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • {t('tireCalculator.results_sorted_by_accuracy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {t('tireCalculator.recommend_selecting_sizes_with_up_to_1_deviation')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Кнопки управления */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={calculateTireSizes}
            startIcon={<CalculateIcon />}
            sx={{ flex: 1 }}
          >
            {t('tireCalculator.find_sizes_button')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RefreshIcon />}
          >
            {t('tireCalculator.reset_button')}
          </Button>
        </Box>

        {/* Результаты */}
        {results.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('tireCalculator.found_sizes', { count: results.length })}
            </Typography>
            
            <List sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 1 }}>
              {results.map((result, index) => (
                <ListItem key={index} sx={{ borderBottom: index < results.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 120 }}>
                          {result.width}/{result.profile} R{result.diameter}
                        </Typography>
                        <Chip
                          label={getDeviationText(result.deviation)}
                          color={getDeviationColor(result.deviation)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('tireCalculator.diameter')}: {result.calculatedDiameter.toFixed(1)} {t('tireCalculator.mm_unit')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('tireCalculator.deviation')}: {result.deviation.toFixed(2)}% {t('tireCalculator.from_target')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {results.length === 0 && targetDiameter > 0 && rimDiameter > 0 && (
          <Alert severity="info">
            <Typography variant="body2">
              {t('tireCalculator.no_sizes_found_message')}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TireSizeCalculatorCard;
