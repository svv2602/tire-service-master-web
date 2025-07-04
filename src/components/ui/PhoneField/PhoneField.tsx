import React from 'react';
import { TextField, TextFieldProps } from '../TextField';
import { InputAdornment } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';

export interface PhoneFieldProps extends Omit<TextFieldProps, 'type' | 'value' | 'onChange'> {
  /**
   * Значение поля телефона
   */
  value: string | undefined;
  
  /**
   * Callback при изменении значения
   */
  onChange: (value: string) => void;
  
  /**
   * Показывать ли иконку телефона
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Поле ввода телефона с автоформатированием +38 (0ХХ) ХХХ-ХХ-ХХ
 * Использует ту же логику, что и в UniversalLoginForm
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  showIcon = true,
  label = 'Телефон',
  required = false,
  helperText = 'Формат: +38 (0ХХ)ХХХ-ХХ-ХХ',
  error = false,
  placeholder = '+38 (067) 123-45-67',
  onBlur,
  ...props
}) => {
  // Обработчик изменения значения с автоформатированием (как в UniversalLoginForm)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Автоформатирование с визуальной маской
    let inputValue = e.target.value;
    
    // Убираем все кроме цифр и +
    let digitsOnly = inputValue.replace(/[^\d+]/g, '');
    
    // Обработка различных форматов ввода
    if (digitsOnly.startsWith('+')) {
      digitsOnly = digitsOnly.substring(1); // убираем +
    }
    
    // Автоматически добавляем 38 если начинается с 0
    if (digitsOnly.match(/^0/)) {
      digitsOnly = '38' + digitsOnly;
    }
    
    // Форматируем с маской +38 (0XX) XXX-XX-XX
    let formatted = '';
    if (digitsOnly.length >= 2 && digitsOnly.startsWith('38')) {
      formatted = '+38';
      const remaining = digitsOnly.substring(2);
      
      if (remaining.length > 0) {
        formatted += ' (';
        if (remaining.length <= 3) {
          formatted += remaining;
        } else {
          formatted += remaining.substring(0, 3) + ')';
          const rest = remaining.substring(3);
          
          if (rest.length > 0) {
            formatted += ' ';
            if (rest.length <= 3) {
              formatted += rest;
            } else {
              formatted += rest.substring(0, 3);
              if (rest.length > 3) {
                formatted += '-';
                if (rest.length <= 5) {
                  formatted += rest.substring(3);
                } else {
                  formatted += rest.substring(3, 5);
                  if (rest.length > 5) {
                    formatted += '-' + rest.substring(5, 7);
                  }
                }
              }
            }
          }
        }
      }
    } else if (digitsOnly.length > 0) {
      // Для других форматов оставляем как есть с +
      formatted = '+' + digitsOnly;
    } else {
      formatted = inputValue; // Пустое значение
    }
    
    onChange(formatted);
  };

  return (
    <TextField
      {...props}
      type="tel"
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
      InputProps={{
        ...props.InputProps,
        startAdornment: showIcon ? (
          <InputAdornment position="start">
            <PhoneIcon color={error ? 'error' : 'action'} />
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

export default PhoneField; 