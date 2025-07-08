import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid,
  useTheme
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { TireAlternative } from '../../../types/tire-calculator';
import { calculateSpeedometerImpact } from '../../../utils/tire-calculator';
import { useTranslation } from 'react-i18next';

interface SpeedometerImpactCardProps {
  alternative: TireAlternative;
  originalDiameter: number;
}

const SpeedometerImpactCard: React.FC<SpeedometerImpactCardProps> = ({
  alternative,
  originalDiameter
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const impact = calculateSpeedometerImpact(originalDiameter, alternative.calculatedDiameter);

  const getTrendIcon = () => {
    if (Math.abs(impact.deviationPercent) < 0.5) {
      return <TrendingFlatIcon color="success" />;
    } else if (impact.deviationPercent > 0) {
      return <TrendingUpIcon color="warning" />;
    } else {
      return <TrendingDownIcon color="error" />;
    }
  };

  const getImpactColor = () => {
    const absDeviation = Math.abs(impact.deviationPercent);
    if (absDeviation < 0.5) return 'success';
    if (absDeviation < 2) return 'warning';
    return 'error';
  };

  const getProgressValue = () => {
    // Нормализуем значение для прогресс-бара (-5% до +5%)
    const normalized = ((impact.deviationPercent + 5) / 10) * 100;
    return Math.max(0, Math.min(100, normalized));
  };

  return (
    <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Размер шины */}
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon color="action" />
              <Typography variant="subtitle2" fontWeight="bold">
                {alternative.size}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('tireCalculator.diameter')}: {alternative.calculatedDiameter.toFixed(1)} мм
            </Typography>
          </Grid>

          {/* Отклонение */}
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getTrendIcon()}
              <Chip
                label={`${impact.deviationPercent > 0 ? '+' : ''}${impact.deviationPercent.toFixed(2)}%`}
                size="small"
                color={getImpactColor()}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Визуализация отклонения */}
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('tireCalculator.speedometer_deviation')}
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette[getImpactColor()].main,
                    borderRadius: 4
                  }
                }}
              />
              {/* Центральная отметка (0%) */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: theme.palette.text.secondary,
                  transform: 'translateX(-50%)'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">-5%</Typography>
              <Typography variant="caption" color="text.secondary">0%</Typography>
              <Typography variant="caption" color="text.secondary">+5%</Typography>
            </Box>
          </Grid>

          {/* Практическое влияние */}
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="medium">
              {t('tireCalculator.at_speed', { speed: 100, real: impact.realSpeed.toFixed(1) })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {/* Локализуем описание влияния на спидометр */}
              {impact.description === 'Влияние на спидометр минимальное'
                ? t('tireCalculator.speedometer_impact_minimal')
                : impact.description.includes('меньше реальной скорости')
                  ? t('tireCalculator.speedometer_impact_less', { value: Math.abs(impact.deviationKmh).toFixed(1) })
                  : impact.description.includes('больше реальной скорости')
                    ? t('tireCalculator.speedometer_impact_more', { value: Math.abs(impact.deviationKmh).toFixed(1) })
                    : impact.description}
            </Typography>
            
            {/* Дополнительные скорости */}
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[60, 80, 120].map(speed => {
                const speedImpact = calculateSpeedometerImpact(originalDiameter, alternative.calculatedDiameter, speed);
                return (
                  <Chip
                    key={speed}
                    label={`${speed}→${speedImpact.realSpeed.toFixed(0)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Предупреждения */}
        {alternative.warnings.length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: theme.palette.warning.light + '20', borderRadius: 1 }}>
            <Typography variant="caption" color="warning.dark">
              ⚠️ {alternative.warnings.join('; ')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeedometerImpactCard;
