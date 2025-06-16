import React from 'react';
import {
  Skeleton as MuiSkeleton,
  SkeletonProps as MuiSkeletonProps,
  styled,
} from '@mui/material';

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

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  '&.MuiSkeleton-rounded': {
    borderRadius: theme.shape.borderRadius,
  },
}));

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
  // Для варианта "rounded" используем "rectangular" с кастомным классом
  const actualVariant = variant === 'rounded' ? 'rectangular' : variant;
  const className = variant === 'rounded' ? 'MuiSkeleton-rounded' : undefined;

  // Добавляем borderRadius в sx, если он задан
  const updatedSx = borderRadius !== undefined 
    ? { ...sx, borderRadius } 
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