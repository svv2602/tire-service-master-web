import { BadgeProps as MuiBadgeProps } from '@mui/material/Badge';

/**
 * Пропсы для компонента Badge
 */
export interface BadgeProps extends Omit<MuiBadgeProps, 'badgeContent'> {
  /**
   * Содержимое бейджа (число или текст)
   */
  badgeContent?: string | number;
  
  /**
   * Показывать ли бейдж как точку
   */
  dot?: boolean;

  /**
   * Добавить пульсирующую анимацию
   */
  pulse?: boolean;
} 