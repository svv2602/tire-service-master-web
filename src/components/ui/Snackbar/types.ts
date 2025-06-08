import { SnackbarProps as MuiSnackbarProps } from '@mui/material/Snackbar';
import { AlertProps } from '@mui/material/Alert';

/**
 * Тип сообщения для уведомления
 */
export type SnackbarMessageType = 'success' | 'error' | 'warning' | 'info';

/**
 * Позиция уведомления
 */
export interface SnackbarPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

/**
 * Интерфейс для сообщения уведомления
 */
export interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarMessageType;
  autoHideDuration?: number;
  position?: SnackbarPosition;
}

/**
 * Пропсы для компонента Snackbar
 */
export interface SnackbarProps extends Omit<MuiSnackbarProps, 'open' | 'message'> {
  message: SnackbarMessage;
  onClose: () => void;
  alertProps?: Partial<AlertProps>;
}

/**
 * Контекст для управления уведомлениями
 */
export interface SnackbarContextValue {
  showMessage: (message: string, type?: SnackbarMessageType, duration?: number, position?: SnackbarPosition) => void;
  showSuccess: (message: string, duration?: number, position?: SnackbarPosition) => void;
  showError: (message: string, duration?: number, position?: SnackbarPosition) => void;
  showWarning: (message: string, duration?: number, position?: SnackbarPosition) => void;
  showInfo: (message: string, duration?: number, position?: SnackbarPosition) => void;
} 