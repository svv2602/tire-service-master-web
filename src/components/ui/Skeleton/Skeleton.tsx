import React from 'react';
import {
  Skeleton as MuiSkeleton,
  SkeletonProps as MuiSkeletonProps,
  styled,
  useTheme,
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

export interface SkeletonProps extends MuiSkeletonProps {
  /** Вариант скелетона */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  /** Ширина */
  width?: number | string;
  /** Высота */
  height?: number | string;
  /** Радиус скругления для варианта 'rounded' */
  borderRadius?: number | string;
  /** Анимация */
  animation?: 'pulse' | 'wave' | false;
  /** Кастомные стили */
  sx?: Record<string, any>;
}

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: theme.palette.mode === 'dark' 
      ? themeColors.backgroundSecondary 
      : themeColors.backgroundLight,
    transition: tokens.transitions.duration.normal,
    
    '&.MuiSkeleton-text': {
      borderRadius: tokens.borderRadius.sm,
      transform: 'scale(1, 0.8)',
      marginTop: tokens.spacing.xs,
      marginBottom: tokens.spacing.xs,
    },
    
    '&.MuiSkeleton-circular': {
      borderRadius: '50%',
    },
    
    '&.MuiSkeleton-rectangular': {
      borderRadius: tokens.borderRadius.none,
    },
    
    '&.MuiSkeleton-rounded': {
      borderRadius: tokens.borderRadius.md,
    },
    
    '&.MuiSkeleton-wave::after': {
      background: `linear-gradient(90deg, transparent, ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'}, transparent)`,
    },
  };
});

/**
 * Компонент Skeleton - заполнитель для отображения во время загрузки контента
 * 
 * @example
 * <Skeleton variant="text" width={200} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * <Skeleton variant="circular" width={50} height={50} />
 * <Skeleton variant="rounded" width={300} height={200} borderRadius={16} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  borderRadius,
  animation = 'pulse',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  // Для варианта "rounded" используем "rectangular" с кастомным классом
  const actualVariant = variant === 'rounded' ? 'rectangular' : variant;
  const className = variant === 'rounded' ? 'MuiSkeleton-rounded' : undefined;

  // Определяем borderRadius в зависимости от варианта и переданного значения
  let finalBorderRadius = borderRadius;
  
  if (borderRadius === undefined) {
    if (variant === 'rounded') {
      finalBorderRadius = tokens.borderRadius.md;
    } else if (variant === 'circular') {
      finalBorderRadius = '50%';
    } else if (variant === 'text') {
      finalBorderRadius = tokens.borderRadius.sm;
    }
  }

  // Добавляем borderRadius в sx, если он определен
  const updatedSx = finalBorderRadius !== undefined 
    ? { ...sx, borderRadius: finalBorderRadius } 
    : sx;

  return (
    <StyledSkeleton
      variant={actualVariant}
      width={width}
      height={height}
      animation={animation}
      className={className}
      sx={updatedSx}
      {...props}
    />
  );
};

export default Skeleton;