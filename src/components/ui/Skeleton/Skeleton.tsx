import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import { SkeletonProps } from './types';

/**
 * Компонент Skeleton - плейсхолдер для загружаемого контента
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'pulse',
  height,
  width,
  borderRadius = 8,
  sx,
  ...rest
}) => {
  // Определяем базовые стили в зависимости от варианта
  const baseStyles = {
    text: {
      height: height || 20,
      width: width || '100%',
      borderRadius: 4,
    },
    rectangular: {
      height: height || 100,
      width: width || '100%',
      borderRadius: 0,
    },
    circular: {
      height: height || 40,
      width: width || 40,
      borderRadius: '50%',
    },
    rounded: {
      height: height || 100,
      width: width || '100%',
      borderRadius,
    },
  }[variant];

  return (
    <MuiSkeleton
      variant={variant === 'rounded' ? 'rectangular' : variant}
      animation={animation}
      sx={{
        ...baseStyles,
        ...sx,
      }}
      {...rest}
    />
  );
};

export default Skeleton;