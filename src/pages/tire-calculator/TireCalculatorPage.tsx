import React, { useState, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  Divider,
  Chip,
  Paper,
  Grid,
  Container
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  TireSize, 
  TireCalculatorResult, 
  TireSearchParams,
  TIRE_CONSTANTS
} from '../../types/tire-calculator';
import { calculateTireAlternatives, validateTireSize } from '../../utils/tire-calculator';
import { getTablePageStyles } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';
import TireInputForm from './components/TireInputForm';
import TireResultsTable from './components/TireResultsTable';
import SpeedometerImpactCard from './components/SpeedometerImpactCard';
import TireConverterCard from './components/TireConverterCard';
import TireSizeCalculatorCard from './components/TireSizeCalculatorCard';
import { useTranslation } from 'react-i18next';

// SEO импорты
import { SEOHead } from '../../components/common/SEOHead';
import { useSEO } from '../../hooks/useSEO';
import { Fade } from '@mui/material';

const TireCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { useSEOFromAPI } = useSEO();
  
  // SEO конфигурация из API
  const seoConfig = useSEOFromAPI('calculator');

  // Состояния для калькулятора
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Референс для прокрутки к результатам
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Состояния компонента
  const [originalTire, setOriginalTire] = useState<TireSize>({
    width: 205,
    profile: 55,
    diameter: 16,
    loadIndex: 91,
    speedIndex: 'V'
  });
  
  const [searchParams, setSearchParams] = useState<TireSearchParams>({
    originalSize: originalTire,
    maxDeviationPercent: TIRE_CONSTANTS.RECOMMENDED_DEVIATION_PERCENT,
    allowedWidthRange: 20,
    allowedDiameterRange: 1
  });
  
  const [calculatorResult, setCalculatorResult] = useState<TireCalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Обработчик изменения исходного размера шины
  const handleTireSizeChange = useCallback((newSize: TireSize) => {
    setOriginalTire(newSize);
    setSearchParams(prev => ({
      ...prev,
      originalSize: newSize
    }));
    
    // Валидация нового размера
    const validation = validateTireSize(newSize);
    setValidationErrors(validation.errors);
  }, []);

  // Обработчик изменения параметров поиска
  const handleSearchParamsChange = useCallback((newParams: Partial<TireSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);

  // Обработчик расчета альтернативных размеров
  const handleCalculate = useCallback(async () => {
    if (validationErrors.length > 0) {
      return;
    }

    setIsCalculating(true);
    
    try {
      // Имитируем асинхронную операцию для показа загрузки
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = calculateTireAlternatives(searchParams);
      setCalculatorResult(result);
      
      // ✅ Прокрутка к результатам с задержкой для обновления DOM
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при расчете альтернативных размеров:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [searchParams, validationErrors]);

  // Обработчик сброса результатов
  const handleReset = useCallback(() => {
    setCalculatorResult(null);
    setValidationErrors([]);
    setOriginalTire({
      width: 205,
      profile: 55,
      diameter: 16,
      loadIndex: 91,
      speedIndex: 'V'
    });
    setSearchParams({
      originalSize: {
        width: 205,
        profile: 55,
        diameter: 16,
        loadIndex: 91,
        speedIndex: 'V'
      },
      maxDeviationPercent: TIRE_CONSTANTS.RECOMMENDED_DEVIATION_PERCENT,
      allowedWidthRange: 20,
      allowedDiameterRange: 1
    });
  }, []);

  return (
    <ClientLayout>
      <SEOHead {...seoConfig} />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Верхняя панель */}
        <Paper elevation={2} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Изображение слева */}
            <Box
              component="img"
              src="/image_app/img_calc.jpg"
              alt={t('tireCalculator.title')}
              sx={{
                width: { xs: 80, sm: 120, md: 150 },
                height: { xs: 80, sm: 120, md: 150 },
                borderRadius: 2,
                objectFit: 'cover',
                backgroundColor: 'transparent',
                flexShrink: 0
              }}
            />
            
            {/* Контент справа */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Основной заголовок */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalculateIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.primary.main, 
                    mr: 2 
                  }} 
                />
                <Box>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.5
                    }}
                  >
                    {t('tireCalculator.title')}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    {t('tireCalculator.subtitle')}
                  </Typography>
                </Box>
              </Box>

              {/* Описание возможностей */}
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                {t('tireCalculator.description')}
              </Typography>

              {/* Информационные карточки */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t('tireCalculator.info.recommended')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t('tireCalculator.info.attention')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="info" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t('tireCalculator.info.check')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t('tireCalculator.info.speedometer')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>

        {/* Предупреждения о валидации */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('tireCalculator.validation.errors')}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  <Typography variant="body2">{error}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Форма ввода параметров */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TireInputForm
              originalTire={originalTire}
              searchParams={searchParams}
              onTireSizeChange={handleTireSizeChange}
              onSearchParamsChange={handleSearchParamsChange}
              onCalculate={handleCalculate}
              onReset={handleReset}
              isCalculating={isCalculating}
              hasValidationErrors={validationErrors.length > 0}
            />
          </CardContent>
        </Card>

        {/* Результаты расчета */}
        {calculatorResult && (
          <Fade in timeout={500}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('tireCalculator.result.originalTire')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`${t('tireCalculator.result.finalSize')}: ${calculatorResult.searchParams.originalSize.width}/${calculatorResult.searchParams.originalSize.profile} R${calculatorResult.searchParams.originalSize.diameter}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${t('tireCalculator.fields.diameter')}: ${calculatorResult.originalDiameter.toFixed(1)} мм`}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {t('tireCalculator.result.found')}: <strong>{calculatorResult.totalFound}</strong>
                  {calculatorResult.totalFound > calculatorResult.alternatives.length && (
                    <span> ({t('common.shownFirst', { count: calculatorResult.alternatives.length })})</span>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Таблица результатов */}
        {calculatorResult && (
          <Card sx={{ mb: 3 }} ref={resultRef}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('tireCalculator.result.alternatives')}
              </Typography>
              <TireResultsTable 
                alternatives={calculatorResult.alternatives}
                originalDiameter={calculatorResult.originalDiameter}
              />
            </CardContent>
          </Card>
        )}

        {/* Влияние на спидометр */}
        {calculatorResult && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('tireCalculator.result.speedometerImpact')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {calculatorResult.alternatives.slice(0, 5).map((alt, index) => (
                  <SpeedometerImpactCard 
                    key={index}
                    alternative={alt}
                    originalDiameter={calculatorResult.originalDiameter}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Дополнительные калькуляторы */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        <Typography variant="h4" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
          {t('tireCalculator.additionalCalculators')}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TireConverterCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <TireSizeCalculatorCard />
          </Grid>
        </Grid>

        {/* Важная информация */}
        <Card sx={{ mt: 4, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ℹ️ {t('tireCalculator.important.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>{t('tireCalculator.important.deviation')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>{t('tireCalculator.important.indexes')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>{t('tireCalculator.important.rimWidth')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>{t('tireCalculator.important.compatibility')}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ClientLayout>
  );
};

export default TireCalculatorPage;
