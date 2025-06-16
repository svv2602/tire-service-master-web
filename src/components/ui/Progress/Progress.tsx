import React from 'react';
import {
  CircularProgress as MuiCircularProgress,
  LinearProgress as MuiLinearProgress,
  Box,
  Typography,
  styled,
} from '@mui/material';

export interface ProgressProps {
  /** Тип индикатора прогресса */
  variant?: 'circular' | 'linear';
  /** Цвет индикатора */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  /** Значение прогресса (от 0 до 100) */
  value?: number;
  /** Размер кругового индикатора */
  size?: number;
  /** Толщина линии */
  thickness?: number;
  /** Показать текст с процентами */
  showLabel?: boolean;
  /** Показать текст с процентами (алиас для showLabel) */
  showValue?: boolean;
  /** Текст метки (если не задан, показывается процент) */
  label?: string;
  /** Неопределенный прогресс */
  indeterminate?: boolean;
  /** Кастомные стили */
  sx?: Record<string, any>;
}

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ProgressLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '0.875rem',
}));

const CircularProgressWithLabel = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const CircularProgressLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontSize: '0.75rem',
  fontWeight: 500,
}));

const LinearProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const LinearProgressLabelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

/**
 * Компонент Progress - индикатор прогресса для отображения состояния загрузки или выполнения операции
 * 
 * @example
 * <Progress variant="circular" value={75} showLabel />
 * <Progress variant="linear" value={50} showValue color="secondary" />
 */
export const Progress: React.FC<ProgressProps> = ({
  variant = 'circular',
  color = 'primary',
  value = 0,
  size = 40,
  thickness = 3.6,
  showLabel = false,
  showValue = false,
  label,
  indeterminate = false,
  sx,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const displayValue = Math.round(normalizedValue);
  const displayLabel = label || `${displayValue}%`;
  // Используем showLabel или showValue
  const shouldShowLabel = showLabel || showValue;

  if (variant === 'circular') {
    return (
      <ProgressContainer sx={sx}>
        {indeterminate ? (
          <MuiCircularProgress
            color={color}
            size={size}
            thickness={thickness}
          />
        ) : (
          <CircularProgressWithLabel>
            <MuiCircularProgress
              variant="determinate"
              value={normalizedValue}
              color={color}
              size={size}
              thickness={thickness}
            />
            {shouldShowLabel && (
              <CircularProgressLabel>
                {displayLabel}
              </CircularProgressLabel>
            )}
          </CircularProgressWithLabel>
        )}
        {label && <ProgressLabel color="text.secondary">{label}</ProgressLabel>}
      </ProgressContainer>
    );
  }

  return (
    <LinearProgressContainer sx={sx}>
      {shouldShowLabel && (
        <LinearProgressLabelContainer>
          <Typography variant="caption" color="text.secondary">
            {label || 'Прогресс'}
          </Typography>
          {!indeterminate && (
            <Typography variant="caption" color="text.secondary">
              {displayValue}%
            </Typography>
          )}
        </LinearProgressLabelContainer>
      )}
      <MuiLinearProgress
        variant={indeterminate ? 'indeterminate' : 'determinate'}
        value={normalizedValue}
        color={color}
      />
    </LinearProgressContainer>
  );
};

export default Progress;