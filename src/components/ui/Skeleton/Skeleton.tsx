import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ANIMATIONS } from '../../../styles/theme';

/** Пропсы скелетона */
export interface SkeletonProps extends MuiSkeletonProps {
  /** Тип скелетона */
  variant?: 'text' | 'rectangular' | 'circular';
  /** Использовать пульсирующую анимацию */
  pulse?: boolean;
  /** Использовать волновую анимацию */
  wave?: boolean;
  /** Ширина */
  width?: number | string;
  /** Высота */
  height?: number | string;
}

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

const waveAnimation = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
`;

const StyledSkeleton = styled(MuiSkeleton)<SkeletonProps>(({ pulse, wave }) => ({
  backgroundColor: pulse || wave
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)',
  '&::after': {
    background: pulse || wave
      ? `linear-gradient(90deg, transparent, ${pulse || wave ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}, transparent)`
      : undefined,
  },
  animation: pulse 
    ? `${pulseAnimation} 1.5s ease-in-out 0.5s infinite`
    : wave
      ? `${waveAnimation} 1.6s linear 0.5s infinite`
      : undefined,
}));

/**
 * Компонент для отображения загрузки контента
 * 
 * @example
 * // Текстовый скелетон
 * <Skeleton variant="text" width={200} />
 * 
 * // Прямоугольный скелетон
 * <Skeleton variant="rectangular" width={300} height={200} />
 * 
 * // Круглый скелетон
 * <Skeleton variant="circular" width={40} height={40} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  pulse = false,
  wave = false,
  animation = 'pulse',
  width,
  height,
  ...props
}) => {
  return (
    <StyledSkeleton
      variant={variant}
      pulse={pulse}
      wave={wave}
      animation={animation}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Skeleton;