import { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';

/**
 * Пропсы для компонента Drawer
 */
export interface DrawerProps extends Omit<MuiDrawerProps, 'variant'> {
  /**
   * Вариант отображения
   * @default 'temporary'
   */
  variant?: 'temporary' | 'persistent' | 'mini';

  /**
   * Ширина drawer в пикселях
   * @default 240
   */
  width?: number;

  /**
   * Ширина mini-варианта в пикселях
   * @default 56
   */
  miniWidth?: number;

  /**
   * Показывать оверлей при открытии (только для temporary)
   * @default true
   */
  overlay?: boolean;

  /**
   * Callback при клике вне drawer (для закрытия)
   */
  onClickAway?: () => void;

  /**
   * Позиция drawer
   * @default 'left'
   */
  anchor?: 'left' | 'right' | 'top' | 'bottom';
} 