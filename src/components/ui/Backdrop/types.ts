import { BackdropProps as MuiBackdropProps } from '@mui/material/Backdrop';
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

/**
 * Пропсы компонента Backdrop
 */
export interface BackdropProps extends Omit<MuiBackdropProps, 'children'> {
  /**
   * Флаг открытия Backdrop
   */
  open: boolean;
  
  /**
   * Обработчик закрытия
   */
  onClose?: () => void;
  
  /**
   * Текстовое сообщение для отображения
   */
  message?: string;
  
  /**
   * Показывать ли спиннер
   * @default true
   */
  spinner?: boolean;
  
  /**
   * Пользовательский контент
   */
  customContent?: ReactNode;
  
  /**
   * Дополнительные стили
   */
  sx?: SxProps<Theme>;
} 