import { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  /** Вариант кнопки */
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  /** Размер кнопки */
  size?: 'small' | 'medium' | 'large';
  /** Полная ширина */
  fullWidth?: boolean;
  /** Состояние загрузки */
  loading?: boolean;
}