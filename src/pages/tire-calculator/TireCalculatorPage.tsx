import React, { useState, useCallback } from 'react';
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
import TireVisualization from './components/TireVisualization';
import SpeedometerImpactCard from './components/SpeedometerImpactCard';
import TireConverterCard from './components/TireConverterCard';
import TireSizeCalculatorCard from './components/TireSizeCalculatorCard';

const TireCalculatorPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
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
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Верхняя панель */}
        <Paper 
          elevation={2}
          sx={{ 
            mb: 3, 
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Изображение слева */}
            <Box
              component="img"
              src="/image_app/img_calc.jpg"
              alt="Калькулятор шин"
              sx={{
                width: { xs: 80, sm: 120, md: 150 },
                height: { xs: 80, sm: 120, md: 150 },
                objectFit: 'cover',
                borderRadius: 2,
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
                  Калькулятор шин
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ fontWeight: 400 }}
                >
                  Профессиональный подбор альтернативных размеров шин
                </Typography>
              </Box>
            </Box>

            {/* Описание возможностей */}
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              Найдите совместимые размеры шин с точным расчетом отклонений диаметра, 
              влияния на спидометр и рекомендациями по безопасности
            </Typography>

            {/* Информационные карточки */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>±1%</strong> - Рекомендуется
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>±2%</strong> - Требует внимания
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>±3%</strong> - Проверьте совместимость
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Влияние</strong> на спидометр
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
              Ошибки валидации:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
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
          <>
            {/* Информация об исходной шине */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Исходная шина
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`Размер: ${calculatorResult.searchParams.originalSize.width}/${calculatorResult.searchParams.originalSize.profile} R${calculatorResult.searchParams.originalSize.diameter}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`Диаметр: ${calculatorResult.originalDiameter.toFixed(1)} мм`}
                    color="secondary"
                    variant="outlined"
                  />
                  {calculatorResult.searchParams.originalSize.loadIndex && (
                    <Chip 
                      label={`Нагрузка: ${calculatorResult.searchParams.originalSize.loadIndex}`}
                      variant="outlined"
                    />
                  )}
                  {calculatorResult.searchParams.originalSize.speedIndex && (
                    <Chip 
                      label={`Скорость: ${calculatorResult.searchParams.originalSize.speedIndex}`}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Найдено альтернативных размеров: <strong>{calculatorResult.totalFound}</strong>
                  {calculatorResult.totalFound > calculatorResult.alternatives.length && (
                    <span> (показано первых {calculatorResult.alternatives.length})</span>
                  )}
                </Typography>
              </CardContent>
            </Card>

            {/* Визуализация */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <TireVisualization 
                  originalDiameter={calculatorResult.originalDiameter}
                  alternatives={calculatorResult.alternatives.slice(0, 5)} // Показываем первые 5
                />
              </CardContent>
            </Card>

            {/* Влияние на спидометр для лучших вариантов */}
            {calculatorResult.alternatives.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Влияние на спидометр (первые 3 варианта)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {calculatorResult.alternatives.slice(0, 3).map((alternative, index) => (
                      <SpeedometerImpactCard
                        key={index}
                        alternative={alternative}
                        originalDiameter={calculatorResult.originalDiameter}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Таблица результатов */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Альтернативные размеры
                </Typography>
                <TireResultsTable 
                  alternatives={calculatorResult.alternatives}
                  originalDiameter={calculatorResult.originalDiameter}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Дополнительные калькуляторы */}
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h4" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
          Дополнительные калькуляторы
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Конвертер размеров шин */}
          <Grid item xs={12} lg={6}>
            <TireConverterCard />
          </Grid>

          {/* Подбор размера по диаметру */}
          <Grid item xs={12} lg={6}>
            <TireSizeCalculatorCard />
          </Grid>
        </Grid>

        {/* Информационная карточка */}
        <Card sx={{ mt: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ℹ️ Важная информация
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>Рекомендуемое отклонение диаметра:</strong> не более ±3% для сохранения точности спидометра и работы систем ABS/ESP
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>Индексы нагрузки и скорости:</strong> новые шины должны иметь индексы не ниже оригинальных
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>Ширина диска:</strong> убедитесь, что ваш диск подходит для выбранной ширины шины
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Совместимость с автомобилем:</strong> всегда сверяйтесь с рекомендациями производителя автомобиля
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ClientLayout>
  );
};

export default TireCalculatorPage;
