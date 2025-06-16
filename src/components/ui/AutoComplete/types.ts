import { SxProps, TextFieldProps, AutocompleteProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

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
export interface AutoCompleteProps {
  /**
   * Список опций для выбора
   */
  options?: AutoCompleteOption[];
  
  /**
   * Выбранное значение
   */
  value: AutoCompleteOption | null;
  
  /**
   * Обработчик изменения значения
   */
  onChange: (value: AutoCompleteOption | null) => void;
  
  /**
   * Текст плейсхолдера
   */
  placeholder?: string;
  
  /**
   * Метка (label) для поля
   */
  label?: string;
  
  /**
   * Функция для асинхронного поиска опций
   */
  onSearch?: (query: string) => Promise<AutoCompleteOption[]>;
  
  /**
   * Задержка для debounce при поиске (в мс)
   */
  debounceMs?: number;
  
  /**
   * Минимальная длина строки для начала поиска
   */
  minSearchLength?: number;
  
  /**
   * Текст при отсутствии опций
   */
  noOptionsText?: string;
  
  /**
   * Текст при загрузке опций
   */
  loadingText?: string;
  
  /**
   * Дополнительные пропсы для TextField
   */
  TextFieldProps?: Partial<TextFieldProps>;
  
  /**
   * Дополнительные пропсы для Autocomplete
   */
  AutocompleteProps?: Partial<Omit<AutocompleteProps<any, false, false, false>, 
    'options' | 'value' | 'onChange' | 'renderInput'>>;
  
  /**
   * Стили через SX API
   */
  sx?: SxProps<Theme>;
} 