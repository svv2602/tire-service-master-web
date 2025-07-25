import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as OperatorIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Компоненты
import { ServicePointSelector } from '../ServicePointSelector';
import { useOperatorServicePoint } from '../../../hooks/useOperatorServicePoint';

export interface OperatorServicePointSwitcherProps {
  variant?: 'card' | 'inline' | 'compact';
  showStats?: boolean;
  onPointChange?: (pointId: number | null) => void;
}

export const OperatorServicePointSwitcher: React.FC<OperatorServicePointSwitcherProps> = ({
  variant = 'card',
  showStats = true,
  onPointChange,
}) => {
  const {
    servicePoints,
    selectedPointId,
    setSelectedPointId,
    selectedPoint,
    isLoading,
    error,
    hasMultiplePoints,
    isOperator,
  } = useOperatorServicePoint();

  // Обработчик изменения точки
  const handlePointChange = (pointId: number | null) => {
    setSelectedPointId(pointId);
    onPointChange?.(pointId);
  };

  // Если пользователь не оператор
  if (!isOperator) {
    return null;
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Загрузка сервисных точек...
        </Typography>
      </Box>
    );
  }

  // Ошибка загрузки
  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки сервисных точек. Попробуйте обновить страницу.
      </Alert>
    );
  }

  // Нет доступных точек
  if (servicePoints.length === 0) {
    return (
      <Alert severity="warning" icon={<BusinessIcon />}>
        <Typography variant="body2" fontWeight="bold">
          Нет назначенных сервисных точек
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Обратитесь к администратору для назначения на сервисные точки.
        </Typography>
      </Alert>
    );
  }

  // Компактный вариант (только селект)
  if (variant === 'compact') {
    return (
      <ServicePointSelector
        servicePoints={servicePoints}
        selectedPointId={selectedPointId}
        onPointChange={handlePointChange}
        label="Рабочая точка"
        placeholder="Выберите точку"
        size="small"
        showPartnerName={false}
      />
    );
  }

  // Инлайн вариант (селект с мини-статистикой)
  if (variant === 'inline') {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Box flex={1}>
          <ServicePointSelector
            servicePoints={servicePoints}
            selectedPointId={selectedPointId}
            onPointChange={handlePointChange}
            label="Рабочая точка"
            placeholder="Выберите точку"
            size="small"
            showPartnerName={false}
          />
        </Box>
        
        {selectedPoint && showStats && (
          <Box display="flex" gap={1}>
            <Chip
              icon={<LocationIcon />}
              label={selectedPoint.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>
    );
  }

  // Карточный вариант (по умолчанию)
  return (
    <Card>
      <CardContent>
        {/* Заголовок */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <OperatorIcon color="primary" />
          <Typography variant="h6">
            Рабочая точка
          </Typography>
          {hasMultiplePoints && (
            <Chip
              label={`${servicePoints.length} точек`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        {/* Селектор точки */}
        <Box mb={showStats ? 2 : 0}>
          <ServicePointSelector
            servicePoints={servicePoints}
            selectedPointId={selectedPointId}
            onPointChange={handlePointChange}
            label="Выберите точку для работы"
            placeholder="Все доступные точки"
            showPartnerName={true}
          />
        </Box>

        {/* Статистика и информация */}
        {showStats && selectedPoint && (
          <Box>
            {/* Информация о выбранной точке */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'primary.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.200',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LocationIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedPoint.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={1}>
                📍 {selectedPoint.address}
              </Typography>
              
              {selectedPoint.partner_name && (
                <Typography variant="caption" color="text.secondary">
                  Партнер: {selectedPoint.partner_name}
                </Typography>
              )}
              
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label="Активна"
                  size="small"
                  color="success"
                  variant="filled"
                />
                <Chip
                  label="Работает"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Подсказка для множественных точек */}
        {hasMultiplePoints && !selectedPoint && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              💡 Выберите сервисную точку для фильтрации данных. 
              Вы будете видеть только бронирования и клиентов выбранной точки.
            </Typography>
          </Alert>
        )}

        {/* Подсказка для одной точки */}
        {!hasMultiplePoints && selectedPoint && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ Вы работаете с единственной назначенной точкой.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 