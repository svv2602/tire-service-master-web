import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  AutoFixHigh as NormalizationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Storage as DatabaseIcon,
  Translate as BrandIcon,
  Public as CountryIcon,
  DirectionsCar as ModelIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { NormalizationStatistics } from '../../api/suppliers.api';

interface NormalizationStatsProps {
  stats: NormalizationStatistics;
  className?: string;
}

const NormalizationStats: React.FC<NormalizationStatsProps> = ({ stats, className }) => {
  // Расчет процентов
  const brandCoverage = stats.total_products > 0 
    ? Math.round((stats.normalized_brands / stats.total_products) * 100)
    : 0;
  
  const countryCoverage = stats.total_products > 0
    ? Math.round((stats.normalized_countries / stats.total_products) * 100) 
    : 0;
    
  const modelCoverage = stats.total_products > 0
    ? Math.round((stats.normalized_models / stats.total_products) * 100)
    : 0;

  const processingTime = stats.processing_time_ms > 1000 
    ? `${(stats.processing_time_ms / 1000).toFixed(1)}с`
    : `${Math.round(stats.processing_time_ms)}мс`;

  const hasNormalization = stats.normalized_brands > 0 || 
                           stats.normalized_countries > 0 || 
                           stats.normalized_models > 0;

  return (
    <Card className={className} sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <NormalizationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Автоматическая нормализация
          </Typography>
          <Chip 
            label={hasNormalization ? "Выполнена" : "Не требовалась"}
            color={hasNormalization ? "success" : "default"}
            size="small"
            icon={<CheckCircleIcon />}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {stats.summary}
        </Typography>

        {hasNormalization && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {/* Статистика по брендам */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <BrandIcon sx={{ mr: 1, fontSize: 20, color: 'info.main' }} />
                  <Typography variant="body2" fontWeight="medium">
                    Бренды
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="info.main">
                    {stats.normalized_brands}
                  </Typography>
                  {brandCoverage > 0 && (
                    <Chip 
                      label={`+${brandCoverage}%`}
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>

              {/* Статистика по странам */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CountryIcon sx={{ mr: 1, fontSize: 20, color: 'success.main' }} />
                  <Typography variant="body2" fontWeight="medium">
                    Страны
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="success.main">
                    {stats.normalized_countries}
                  </Typography>
                  {countryCoverage > 0 && (
                    <Chip 
                      label={`+${countryCoverage}%`}
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>

              {/* Статистика по моделям */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <ModelIcon sx={{ mr: 1, fontSize: 20, color: 'warning.main' }} />
                  <Typography variant="body2" fontWeight="medium">
                    Модели
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="warning.main">
                    {stats.normalized_models}
                  </Typography>
                  {modelCoverage > 0 && (
                    <Chip 
                      label={`+${modelCoverage}%`}
                      size="small" 
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Общая статистика */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <DatabaseIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Обработано товаров:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {stats.processed.toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Время выполнения:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {processingTime}
              </Typography>
            </Box>
          </Grid>

          {stats.failed > 0 && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="error.main">
                  Ошибок: {stats.failed}
                </Typography>
                {stats.error && (
                  <Tooltip title={stats.error}>
                    <Typography variant="body2" color="error.main" sx={{ cursor: 'pointer' }}>
                      (подробности)
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Прогресс-бар для визуализации покрытия */}
        {hasNormalization && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Покрытие нормализации:
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box flex={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(brandCoverage + countryCoverage + modelCoverage, 100)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {Math.min(brandCoverage + countryCoverage + modelCoverage, 100)}%
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NormalizationStats;