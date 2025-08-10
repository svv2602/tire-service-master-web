import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface SafeDatePickerProps {
  /**
   * Значение даты в формате строки YYYY-MM-DD
   */
  value: string | null;
  
  /**
   * Обработчик изменения даты
   * @param dateString - дата в формате YYYY-MM-DD или пустая строка
   */
  onChange: (dateString: string) => void;
  
  /**
   * Показать ошибку
   */
  error?: boolean;
  
  /**
   * Текст ошибки
   */
  helperText?: string;
  
  /**
   * Метка поля
   */
  label?: string;
  
  /**
   * Дополнительные пропсы для DatePicker
   */
  slotProps?: any;
}

/**
 * Безопасный DatePicker компонент с обработкой некорректных дат
 * 
 * Предотвращает ошибки "Invalid time value" при ручном вводе дат
 * Автоматически конвертирует Date в строку формата YYYY-MM-DD
 */
const SafeDatePicker: React.FC<SafeDatePickerProps> = ({
  value,
  onChange,
  error,
  helperText,
  label,
  slotProps,
}) => {
  // Безопасное преобразование строки в Date
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  }, [value]);

  // Безопасный обработчик изменения
  const handleChange = React.useCallback((date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      // Корректная дата - конвертируем в строку
      onChange(date.toISOString().split('T')[0]);
    } else {
      // Некорректная дата или null - передаем пустую строку
      onChange('');
    }
  }, [onChange]);

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleChange}
      slotProps={{
        ...slotProps,
        textField: {
          ...slotProps?.textField,
          error,
          helperText,
          fullWidth: true,
        },
      }}
    />
  );
};

export default SafeDatePicker;