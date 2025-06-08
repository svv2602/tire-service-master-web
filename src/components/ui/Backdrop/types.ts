import { BackdropProps as MuiBackdropProps } from '@mui/material/Backdrop';

/**
 * Пропсы компонента Backdrop
 */
export interface BackdropProps extends Omit<MuiBackdropProps, 'children'> {
  /**
   * Открыт ли компонент
   * @default false
   */
  open: boolean;

  /**
   * Callback при клике по backdrop
   */
  onClose?: () => void;

  /**
   * Содержимое поверх backdrop
   */
  children?: React.ReactNode;

  /**
   * Время анимации в мс
   * @default 225
   */
  transitionDuration?: number;

  /**
   * Показывать ли индикатор загрузки
   * @default false
   */
  loading?: boolean;

  /**
   * Цвет индикатора загрузки
   * @default 'primary'
   */
  loadingColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

  /**
   * Размер индикатора загрузки
   * @default 40
   */
  loadingSize?: number;

  /**
   * Дополнительные стили для backdrop
   */
  sx?: Record<string, any>;
} 