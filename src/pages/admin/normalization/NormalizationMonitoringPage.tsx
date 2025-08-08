import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PlayArrow as RunIcon,
  Assessment as StatsIcon,
  AutoFixHigh as NormalizationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  List as ListIcon,
  FindInPage as AnalysisIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';
import DataQualityDashboard from '../../../components/admin/DataQualityDashboard';
import {
  useGetNormalizationStatsQuery,
  useRunNormalizationMutation,
} from '../../../api/normalization.api';

interface DataQualityMetrics {
  totalProducts: number;
  brandCoverage: number;
  countryCoverage: number;
  modelCoverage: number;
  qualityScoreCoverage: number;
  lastUpdate: string;
}

interface NormalizationStats {
  totalCountries: number;
  totalBrands: number;
  totalModels: number;
  activeCountries: number;
  activeBrands: number;
  activeModels: number;
}

const NormalizationMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);



  const [lastNormalizationRun, setLastNormalizationRun] = useState<string | null>(null);

  // API хуки
  const {
    data: statsData,
    isLoading,
    refetch,
  } = useGetNormalizationStatsQuery();

  const [runNormalization, { isLoading: isNormalizing }] = useRunNormalizationMutation();

  // Преобразование данных API в формат компонента
  const metrics: DataQualityMetrics = statsData ? {
    totalProducts: statsData.total_products,
    brandCoverage: statsData.brand_coverage,
    countryCoverage: statsData.country_coverage,
    modelCoverage: statsData.model_coverage,
    qualityScoreCoverage: statsData.quality_score_coverage,
    lastUpdate: statsData.last_update,
  } : {
    totalProducts: 0,
    brandCoverage: 0,
    countryCoverage: 0,
    modelCoverage: 0,
    qualityScoreCoverage: 0,
    lastUpdate: new Date().toISOString(),
  };

  const normalizationStats: NormalizationStats = statsData?.reference_data ? {
    totalCountries: statsData.reference_data.countries_count,
    totalBrands: statsData.reference_data.brands_count,
    totalModels: statsData.reference_data.models_count,
    activeCountries: statsData.reference_data.countries_count,
    activeBrands: statsData.reference_data.brands_count,
    activeModels: statsData.reference_data.models_count,
  } : {
    totalCountries: 0,
    totalBrands: 0,
    totalModels: 0,
    activeCountries: 0,
    activeBrands: 0,
    activeModels: 0,
  };

  const handleRefresh = async () => {
    refetch();
  };

  const handleRunNormalization = async () => {
    try {
      setLastNormalizationRun(new Date().toISOString());
      const result = await runNormalization({}).unwrap();
      
      if (result.success) {
        // Обновляем данные после успешной нормализации
        refetch();
      }
    } catch (error) {
      console.error('Ошибка нормализации:', error);
    }
  };

  const getOverallQuality = () => {
    const overall = (metrics.brandCoverage + metrics.countryCoverage + metrics.modelCoverage) / 3;
    if (overall >= 95) return { level: 'excellent', color: 'success', icon: <CheckCircleIcon /> };
    if (overall >= 85) return { level: 'good', color: 'primary', icon: <CheckCircleIcon /> };
    if (overall >= 70) return { level: 'average', color: 'warning', icon: <WarningIcon /> };
    return { level: 'poor', color: 'error', icon: <ErrorIcon /> };
  };

  const overallQuality = getOverallQuality();

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок страницы */}
        <Box sx={tablePageStyles.headerContainer}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin')}
              sx={{ mb: 1 }}
            >
              Назад к дашборду
            </Button>
            <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
              <NormalizationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Мониторинг нормализации
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Контроль качества данных и управление процессами нормализации
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <Chip 
              label={`Общее качество: ${overallQuality.level}`}
              color={overallQuality.color as any}
              icon={overallQuality.icon}
              sx={{ mr: 1 }}
            />
            <Tooltip title="Обновить данные">
              <IconButton onClick={handleRefresh} disabled={isLoading} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<AnalysisIcon />}
              onClick={() => navigate('/admin/normalization/analysis')}
              color="warning"
              sx={{ mr: 1 }}
            >
              🔍 Анализ проблем
            </Button>
            <Button
              variant="outlined"
              startIcon={<ListIcon />}
              onClick={() => navigate('/admin/normalization/unprocessed')}
              sx={{ mr: 1 }}
            >
              Просмотр данных
            </Button>
            <Button
              variant="contained"
              startIcon={<RunIcon />}
              onClick={handleRunNormalization}
              disabled={isLoading || isNormalizing}
              color="primary"
            >
              {isNormalizing ? 'Нормализация...' : 'Запустить нормализацию'}
            </Button>
          </Box>
        </Box>

        {/* Уведомления о последнем запуске */}
        {lastNormalizationRun && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Нормализация запущена: {new Date(lastNormalizationRun).toLocaleString('ru-RU')}
            {isLoading && ' - выполняется...'}
          </Alert>
        )}

        {/* Информация о проблемных данных */}
        {(metrics.brandCoverage < 100 || metrics.countryCoverage < 100 || metrics.modelCoverage < 100) && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              🚨 Обнаружены проблемы с качеством данных:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 1, mt: 1 }}>
              {metrics.brandCoverage < 100 && (
                <li>
                  <Typography variant="body2">
                    <strong>Бренды:</strong> Проверьте корректность названий брендов в прайсах поставщиков
                  </Typography>
                </li>
              )}
              {metrics.countryCoverage < 100 && (
                <li>
                  <Typography variant="body2">
                    <strong>Страны:</strong> Проверьте корректность названий стран в прайсах поставщиков  
                  </Typography>
                </li>
              )}
              {metrics.modelCoverage < 100 && (
                <li>
                  <Typography variant="body2">
                    <strong>Модели:</strong> Проверьте корректность названий моделей в прайсах поставщиков
                  </Typography>
                </li>
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              💡 <strong>Решение:</strong> Нажмите кнопку <strong>"🔍 Анализ проблем"</strong> выше, чтобы увидеть конкретные проблемные записи и исправить их.
            </Typography>
          </Alert>
        )}

        {/* Панель качества данных */}
        <DataQualityDashboard 
          metrics={metrics}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Статистика справочников */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <StatsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Статистика справочников
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {normalizationStats.totalCountries}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Стран производства
                  </Typography>
                  <Typography variant="caption" display="block">
                    {normalizationStats.activeCountries} активных
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {normalizationStats.totalBrands}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Брендов шин
                  </Typography>
                  <Typography variant="caption" display="block">
                    {normalizationStats.activeBrands} активных
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {normalizationStats.totalModels}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Моделей шин
                  </Typography>
                  <Typography variant="caption" display="block">
                    {normalizationStats.activeModels} активных
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/admin/countries')}
                  sx={{ height: 56 }}
                >
                  Управление странами
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/admin/tire-brands')}
                  sx={{ height: 56 }}
                >
                  Управление брендами
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/admin/tire-models')}
                  sx={{ height: 56 }}
                >
                  Управление моделями
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/admin/suppliers')}
                  sx={{ height: 56 }}
                >
                  Поставщики
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Информация о системе */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация о системе нормализации
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <strong>Автоматическая нормализация:</strong> Включена при загрузке прайсов
              </Typography>
              <Typography variant="body2">
                <strong>Последняя проверка:</strong> {new Date(metrics.lastUpdate).toLocaleString('ru-RU')}
              </Typography>
              <Typography variant="body2">
                <strong>Алгоритм поиска:</strong> Нормализация названий + поиск по алиасам
              </Typography>
              <Typography variant="body2">
                <strong>Поддерживаемые языки:</strong> Русский, Украинский, Английский
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminPageWrapper>
  );
};

export default NormalizationMonitoringPage;