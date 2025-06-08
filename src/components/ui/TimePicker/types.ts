import { TimePickerProps as MuiTimePickerProps } from '@mui/x-date-pickers/TimePicker';
import { TextFieldProps } from '@mui/material/TextField';

/**
 * Пропсы компонента TimePicker
 */
export interface TimePickerProps extends Omit<MuiTimePickerProps<any>, 'renderInput' | 'value' | 'onChange'> {
  /**
   * Выбранное время
   */
  value: Date | null;

  /**
   * Callback при изменении времени
   * @param date - новое значение времени
   */
  onChange: (date: Date | null) => void;

  /**
   * Формат отображения времени
   * @default 'HH:mm'
   */
  format?: string;

  /**
   * Минимальное доступное время
   */
  minTime?: Date;

  /**
   * Максимальное доступное время
   */
  maxTime?: Date;

  /**
   * Шаг в минутах для выбора времени
   * @default 1
   */
  minutesStep?: number;

  /**
   * Показывать ли секунды
   * @default false
   */
  showSeconds?: boolean;

  /**
   * Использовать 12-часовой формат
   * @default false
   */
  ampm?: boolean;

  /**
   * Отключен ли компонент
   * @default false
   */
  disabled?: boolean;

  /**
   * Только для чтения
   * @default false
   */
  readOnly?: boolean;

  /**
   * Размер поля ввода
   * @default 'medium'
   */
  size?: 'small' | 'medium';

  /**
   * Пропсы для TextField
   */
  textFieldProps?: Partial<TextFieldProps>;

  /**
   * Placeholder для поля ввода
   */
  placeholder?: string;

  /**
   * Текст ошибки
   */
  error?: boolean;

  /**
   * Текст подсказки об ошибке
   */
  helperText?: string;

  /**
   * Label для поля ввода
   */
  label?: string;

  /**
   * Дополнительные стили
   */
  sx?: Record<string, any>;
} 