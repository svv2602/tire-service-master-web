import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Public as CountryIcon,
  Translate as BrandIcon,
  DirectionsCar as ModelIcon,
  Star as QualityIcon,
} from '@mui/icons-material';

interface DataQualityMetrics {
  totalProducts: number;
  brandCoverage: number;
  countryCoverage: number;
  modelCoverage: number;
  qualityScoreCoverage: number;
  lastUpdate: string;
}

interface DataQualityDashboardProps {
  metrics: DataQualityMetrics;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  metrics,
  onRefresh,
  isLoading = false
}) => {
  const getQualityLevel = (percentage: number) => {
    if (percentage >= 95) return { level: 'excellent', color: 'success', label: 'Отлично' };
    if (percentage >= 85) return { level: 'good', color: 'primary', label: 'Хорошо' };
    if (percentage >= 70) return { level: 'average', color: 'warning', label: 'Средне' };
    return { level: 'poor', color: 'error', label: 'Требует внимания' };
  };

  const brandQuality = getQualityLevel(metrics.brandCoverage);
  const countryQuality = getQualityLevel(metrics.countryCoverage);
  const modelQuality = getQualityLevel(metrics.modelCoverage);
  const overallQuality = getQualityLevel(
    (metrics.brandCoverage + metrics.countryCoverage + metrics.modelCoverage) / 3
  );

  const MetricCard: React.FC<{
    title: string;
    percentage: number;
    icon: React.ReactNode;
    color: string;
    description: string;
  }> = ({ title, percentage, icon, color, description }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
            {title}
          </Typography>
          <Chip 
            label={`${percentage.toFixed(1)}%`}
            color={color as any}
            size="small"
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={percentage}
          sx={{ 
            height: 8, 
            borderRadius: 1,
            mb: 1,
            backgroundColor: `${color}.100`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            }
          }}
        />
        
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {Math.round((percentage / 100) * metrics.totalProducts).toLocaleString()} из {metrics.totalProducts.toLocaleString()} товаров
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Заголовок панели */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <QualityIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5">
            Качество данных
          </Typography>
          <Chip 
            label={overallQuality.label}
            color={overallQuality.color as any}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Tooltip title="Обновить данные">
          <IconButton 
            onClick={onRefresh}
            disabled={isLoading}
            color="primary"
          >
            <RefreshIcon sx={{ 
              animation: isLoading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              }
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Общий статус */}
      {overallQuality.level === 'poor' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Требуется внимание:</strong> Низкое качество нормализации данных. 
            Рекомендуется запустить процедуру нормализации или обновить справочники.
          </Typography>
        </Alert>
      )}

      {overallQuality.level === 'excellent' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Отличное качество данных!</strong> Система нормализации работает эффективно.
          </Typography>
        </Alert>
      )}

      {/* Метрики по категориям */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Бренды"
            percentage={metrics.brandCoverage}
            icon={<BrandIcon sx={{ color: 'info.main' }} />}
            color="info"
            description="Товары с привязанными брендами"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Страны"
            percentage={metrics.countryCoverage}
            icon={<CountryIcon sx={{ color: 'success.main' }} />}
            color="success"
            description="Товары с определенной страной производства"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Модели"
            percentage={metrics.modelCoverage}
            icon={<ModelIcon sx={{ color: 'warning.main' }} />}
            color="warning"
            description="Товары с привязанными моделями"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Рейтинги"
            percentage={metrics.qualityScoreCoverage}
            icon={<QualityIcon sx={{ color: 'primary.main' }} />}
            color="primary"
            description="Товары с рассчитанными рейтингами"
          />
        </Grid>
      </Grid>

      {/* Рекомендации */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Рекомендации по улучшению
          </Typography>
          
          <Grid container spacing={2}>
            {metrics.brandCoverage < 95 && (
              <Grid item xs={12} sm={6}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    <strong>Бренды:</strong> Добавьте алиасы для не найденных брендов в справочник
                  </Typography>
                </Alert>
              </Grid>
            )}
            
            {metrics.countryCoverage < 85 && (
              <Grid item xs={12} sm={6}>
                <Alert severity="warning" variant="outlined">
                  <Typography variant="body2">
                    <strong>Страны:</strong> Проверьте корректность названий стран в прайсах поставщиков
                  </Typography>
                </Alert>
              </Grid>
            )}
            
            {metrics.modelCoverage < 90 && (
              <Grid item xs={12} sm={6}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    <strong>Модели:</strong> Запустите создание недостающих моделей шин
                  </Typography>
                </Alert>
              </Grid>
            )}
            
            {overallQuality.level === 'excellent' && (
              <Grid item xs={12}>
                <Alert severity="success" variant="outlined">
                  <Typography variant="body2">
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
                    Все показатели в норме. Система работает оптимально!
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Последнее обновление */}
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Последнее обновление: {new Date(metrics.lastUpdate).toLocaleString('ru-RU')}
        </Typography>
      </Box>
    </Box>
  );
};

export default DataQualityDashboard;