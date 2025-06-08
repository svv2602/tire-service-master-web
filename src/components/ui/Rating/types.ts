import { RatingProps as MuiRatingProps } from '@mui/material/Rating';

/**
 * Пропсы компонента Rating
 */
export interface RatingProps extends Omit<MuiRatingProps, 'value' | 'onChange'> {
  /**
   * Текущее значение рейтинга
   */
  value?: number | null;
  
  /**
   * Callback при изменении значения
   * @param value - новое значение рейтинга
   */
  onChange?: (value: number | null) => void;
  
  /**
   * Максимальное значение рейтинга
   * @default 5
   */
  max?: number;
  
  /**
   * Размер иконок
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Только для чтения
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Отключено
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Точность (шаг) рейтинга
   * @default 1
   */
  precision?: number;
  
  /**
   * Подпись под рейтингом
   */
  label?: string;
  
  /**
   * Вспомогательный текст
   */
  helperText?: string;
  
  /**
   * Состояние ошибки
   * @default false
   */
  error?: boolean;
} 