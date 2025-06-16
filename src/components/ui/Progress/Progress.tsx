import React from 'react';
import {
  CircularProgress as MuiCircularProgress,
  LinearProgress as MuiLinearProgress,
  Box,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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

const ProgressContainer = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
});

const ProgressLabel = styled(Typography)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    marginTop: tokens.spacing.md,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    color: themeColors.textSecondary,
  };
});

const CircularProgressWithLabel = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
});

const CircularProgressLabel = styled(Typography)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    position: 'absolute',
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    fontFamily: tokens.typography.fontFamily,
    color: themeColors.textPrimary,
  };
});

const LinearProgressContainer = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  };
});

const LinearProgressLabelContainer = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
});

// Стилизованный круговой прогресс
const StyledCircularProgress = styled(MuiCircularProgress)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    transition: tokens.transitions.duration.normal,
    
    '&.MuiCircularProgress-colorPrimary': {
      color: themeColors.primary,
    },
    
    '&.MuiCircularProgress-colorSecondary': {
      color: theme.palette.secondary.main,
    },
    
    '&.MuiCircularProgress-colorError': {
      color: themeColors.error,
    },
    
    '&.MuiCircularProgress-colorInfo': {
      color: theme.palette.info.main,
    },
    
    '&.MuiCircularProgress-colorSuccess': {
      color: theme.palette.success.main,
    },
    
    '&.MuiCircularProgress-colorWarning': {
      color: theme.palette.warning.main,
    },
  };
});

// Стилизованный линейный прогресс
const StyledLinearProgress = styled(MuiLinearProgress)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    height: 6,
    borderRadius: tokens.borderRadius.pill,
    backgroundColor: theme.palette.mode === 'dark' 
      ? themeColors.backgroundSecondary 
      : themeColors.backgroundLight,
    transition: tokens.transitions.duration.normal,
    
    '& .MuiLinearProgress-bar': {
      borderRadius: tokens.borderRadius.pill,
      transition: tokens.transitions.duration.normal,
    },
    
    '&.MuiLinearProgress-colorPrimary': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: themeColors.primary,
      },
    },
    
    '&.MuiLinearProgress-colorSecondary': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
    
    '&.MuiLinearProgress-colorError': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: themeColors.error,
      },
    },
    
    '&.MuiLinearProgress-colorInfo': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette.info.main,
      },
    },
    
    '&.MuiLinearProgress-colorSuccess': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette.success.main,
      },
    },
    
    '&.MuiLinearProgress-colorWarning': {
      '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette.warning.main,
      },
    },
  };
});

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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const displayValue = Math.round(normalizedValue);
  const displayLabel = label || `${displayValue}%`;
  // Используем showLabel или showValue
  const shouldShowLabel = showLabel || showValue;

  if (variant === 'circular') {
    return (
      <ProgressContainer sx={sx}>
        {indeterminate ? (
          <StyledCircularProgress
            color={color}
            size={size}
            thickness={thickness}
          />
        ) : (
          <CircularProgressWithLabel>
            <StyledCircularProgress
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
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: tokens.typography.fontSize.xs,
              fontFamily: tokens.typography.fontFamily,
              color: themeColors.textSecondary
            }}
          >
            {label || 'Прогресс'}
          </Typography>
          {!indeterminate && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily,
                color: themeColors.textSecondary
              }}
            >
              {displayValue}%
            </Typography>
          )}
        </LinearProgressLabelContainer>
      )}
      <StyledLinearProgress
        variant={indeterminate ? 'indeterminate' : 'determinate'}
        value={normalizedValue}
        color={color}
      />
    </LinearProgressContainer>
  );
};

export default Progress;