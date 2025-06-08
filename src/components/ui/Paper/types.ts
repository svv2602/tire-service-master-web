import { PaperProps as MuiPaperProps } from '@mui/material/Paper';

/**
 * Пропсы для компонента Paper
 */
export interface PaperProps extends Omit<MuiPaperProps, 'variant'> {
  /**
   * Вариант отображения
   * @default 'elevated'
   */
  variant?: 'elevated' | 'outlined' | 'flat';

  /**
   * Уровень тени (0-24)
   * @default 1
   */
  elevation?: number;

  /**
   * Отключить отступы
   * @default false
   */
  disablePadding?: boolean;

  /**
   * Закругление углов
   * @default 'medium'
   */
  rounded?: 'none' | 'small' | 'medium' | 'large' | 'full';
} 