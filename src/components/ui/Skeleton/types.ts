import { SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';

/**
 * Пропсы для компонента Skeleton
 */
export interface SkeletonProps extends Omit<MuiSkeletonProps, 'variant' | 'animation'> {
  /**
   * Вариант отображения
   * @default 'text'
   */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';

  /**
   * Тип анимации
   * @default 'pulse'
   */
  animation?: false | 'pulse' | 'wave';

  /**
   * Высота для rectangular и rounded вариантов
   */
  height?: number | string;

  /**
   * Ширина компонента
   */
  width?: number | string;

  /**
   * Радиус скругления для rounded варианта
   * @default 8
   */
  borderRadius?: number;
} 