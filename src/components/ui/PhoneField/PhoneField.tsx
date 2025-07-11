import React, { useRef, useEffect, useState } from 'react';
import { TextField, TextFieldProps } from '../TextField';
import { InputAdornment } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
 * Исправлена проблема с курсором - используется внутреннее состояние
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  showIcon = true,
  label,
  required = false,
  helperText,
  error = false,
  placeholder,
  onBlur,
  ...props
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value || '+38 ');
  
  // Синхронизируем внутреннее состояние с внешним value
  useEffect(() => {
    setInternalValue(value || '+38 ');
  }, [value]);
  
  // Функция для форматирования номера телефона
  const formatPhoneNumber = (input: string): string => {
    // Убираем все кроме цифр и +
    let digitsOnly = input.replace(/[^\d+]/g, '');
    
    // Обработка различных форматов ввода
    if (digitsOnly.startsWith('+')) {
      digitsOnly = digitsOnly.substring(1); // убираем +
    }
    
    // Автоматически добавляем 38 если начинается с 0
    if (digitsOnly.match(/^0/)) {
      digitsOnly = '38' + digitsOnly;
    }
    
    // Если поле пустое или только вводится, показываем +38
    if (digitsOnly.length === 0) {
      return '+38 ';
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
      formatted = input; // Пустое значение
    }
    
    return formatted;
  };

  // Обработчик изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Форматируем значение
    const formatted = formatPhoneNumber(inputValue);
    
    // Обновляем внутреннее состояние
    setInternalValue(formatted);
    
    // Вызываем onChange с отформатированным значением
    onChange(formatted);
  };

  // Обработчик фокуса - устанавливаем курсор после +38
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.value === '+38 ') {
      // Устанавливаем курсор после "+38 "
      setTimeout(() => {
        input.setSelectionRange(4, 4);
      }, 0);
    }
  };

  return (
    <TextField
      {...props}
      type="tel"
      label={label || t('phoneField.label')}
      required={required}
      error={error}
      helperText={helperText || t('phoneField.helperText')}
      placeholder={placeholder || t('phoneField.placeholder', '+38 (067) 123-45-67')}
      value={internalValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={onBlur}
      InputProps={{
        ...props.InputProps,
        inputRef: inputRef,
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