import { SliderProps as MuiSliderProps } from '@mui/material/Slider';

/**
 * Пропсы компонента Slider
 */
export interface SliderProps extends Omit<MuiSliderProps, 'value' | 'onChange'> {
  /**
   * Значение слайдера
   * Для range slider это массив из двух чисел [min, max]
   * Для обычного слайдера это число
   */
  value: number | number[];

  /**
   * Callback при изменении значения
   * @param value - новое значение
   * @param thumb - индекс ползунка (для range slider)
   */
  onChange?: (value: number | number[], thumb?: number) => void;

  /**
   * Минимальное значение
   * @default 0
   */
  min?: number;

  /**
   * Максимальное значение
   * @default 100
   */
  max?: number;

  /**
   * Шаг изменения значения
   * @default 1
   */
  step?: number;

  /**
   * Отображать метки со значениями
   * @default false
   */
  showMarks?: boolean;

  /**
   * Кастомные метки
   * { value: number, label: string }[]
   */
  marks?: { value: number; label: string }[];

  /**
   * Отображать текущее значение над ползунком
   * @default false
   */
  showValue?: boolean;

  /**
   * Формат отображения значения
   * @param value - текущее значение
   * @returns отформатированное значение
   */
  valueFormatter?: (value: number) => string;

  /**
   * Размер слайдера
   * @default 'medium'
   */
  size?: 'small' | 'medium';

  /**
   * Цвет слайдера
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  /**
   * Ориентация слайдера
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Отключен ли слайдер
   * @default false
   */
  disabled?: boolean;

  /**
   * Дополнительные стили
   */
  sx?: Record<string, any>;
} 