import { DividerProps as MuiDividerProps } from '@mui/material/Divider';

/**
 * Пропсы для компонента Divider
 */
export interface DividerProps extends MuiDividerProps {
  /**
   * Текст разделителя
   */
  text?: string;
  
  /**
   * Отступы для текста
   */
  textPadding?: number | string;
} 