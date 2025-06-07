import React from 'react';
import {
  LinearProgress,
  CircularProgress,
  Box,
  Typography,
  LinearProgressProps,
  CircularProgressProps
} from '@mui/material';

/** Тип прогресса */
export type ProgressVariant = 'linear' | 'circular';

/** Пропсы прогресса */
export interface ProgressProps {
  /** Значение прогресса (0-100) */
  value?: number;
  /** Тип прогресса */
  variant?: ProgressVariant;
  /** Показывать ли значение */
  showValue?: boolean;
  /** Размер */
  size?: number;
  /** Толщина */
  thickness?: number;
  /** Цвет */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /** Высота для линейного прогресса */
  height?: number;
}

/**
 * Компонент индикатора прогресса
 * 
 * @example
 * <Progress
 *   value={75}
 *   variant="linear"
 *   showValue
 *   color="primary"
 * />
 */
export const Progress: React.FC<ProgressProps> = ({
  variant = 'linear',
  value,
  color = 'primary',
  size = 40,
  thickness = 3.6,
  height = 4,
  showValue = false
}) => {
  const isIndeterminate = value === undefined;

  if (variant === 'circular') {
    const circularProps: CircularProgressProps = {
      variant: isIndeterminate ? 'indeterminate' : 'determinate',
      value: value ?? 0,
      color,
      size,
      thickness
    };

    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress {...circularProps} />
        {showValue && !isIndeterminate && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >
              {`${Math.round(value ?? 0)}%`}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const linearProps: LinearProgressProps = {
    variant: isIndeterminate ? 'indeterminate' : 'determinate',
    value: value ?? 0,
    color,
    sx: { height, borderRadius: height / 2 }
  };

  return (
    <Box width="100%" position="relative">
      <LinearProgress {...linearProps} />
      {showValue && !isIndeterminate && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            marginRight: '-40px'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {`${Math.round(value ?? 0)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Progress; 