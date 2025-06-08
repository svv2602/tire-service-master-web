import { AutocompleteProps as MuiAutocompleteProps } from '@mui/material/Autocomplete';
import { TextFieldProps } from '@mui/material/TextField';

/**
 * Базовый элемент для автодополнения
 */
export interface AutoCompleteOption {
  /**
   * Уникальный идентификатор
   */
  id: string | number;
  
  /**
   * Отображаемый текст
   */
  label: string;
  
  /**
   * Дополнительные данные
   */
  [key: string]: any;
}

/**
 * Пропсы компонента AutoComplete
 */
export interface AutoCompleteProps<T extends AutoCompleteOption = AutoCompleteOption> {
  /**
   * Список опций для выбора
   */
  options: T[];
  
  /**
   * Выбранное значение
   */
  value?: T | null;
  
  /**
   * Callback при изменении значения
   */
  onChange?: (value: T | null) => void;
  
  /**
   * Placeholder для поля ввода
   */
  placeholder?: string;
  
  /**
   * Label для поля ввода
   */
  label?: string;
  
  /**
   * Функция для асинхронного поиска опций
   */
  onSearch?: (query: string) => Promise<T[]>;
  
  /**
   * Задержка перед поиском в мс
   * @default 300
   */
  debounceMs?: number;
  
  /**
   * Минимальное количество символов для начала поиска
   * @default 2
   */
  minSearchLength?: number;
  
  /**
   * Текст при отсутствии опций
   * @default 'Нет доступных вариантов'
   */
  noOptionsText?: string;
  
  /**
   * Текст при загрузке опций
   * @default 'Загрузка...'
   */
  loadingText?: string;
  
  /**
   * Пропсы для TextField
   */
  TextFieldProps?: Partial<TextFieldProps>;
  
  /**
   * Пропсы для MUI Autocomplete
   */
  AutocompleteProps?: Partial<MuiAutocompleteProps<T, false, false, false>>;
  
  /**
   * Дополнительные стили
   */
  sx?: Record<string, any>;
} 