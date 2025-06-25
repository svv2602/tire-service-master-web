import React from 'react';
import InputMask from 'react-input-mask';
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
 * Поле ввода телефона с маской +38 (___) ___-__-__
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  showIcon = true,
  label = 'Телефон',
  required = false,
  helperText = 'Формат: +38 (067) 123-45-67',
  placeholder = '+38 (___) ___-__-__',
  ...props
}) => {
  // Обработчик изменения значения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // Валидация телефона
  const validatePhone = (value: string): boolean => {
    const phoneDigits = value.replace(/[^\d]/g, '');
    return phoneDigits.length === 12; // 38 + 10 цифр номера
  };

  return (
    <InputMask
      mask="+38 (999) 999-99-99"
      value={value}
      onChange={handleChange}
      maskChar="_"
    >
      {(inputProps: any) => (
        <TextField
          {...inputProps}
          {...props}
          label={label}
          required={required}
          placeholder={placeholder}
          helperText={helperText}
          error={props.error || (value && !validatePhone(value))}
          InputProps={{
            ...props.InputProps,
            startAdornment: showIcon ? (
              <InputAdornment position="start">
                <PhoneIcon color="action" />
              </InputAdornment>
            ) : props.InputProps?.startAdornment,
          }}
        />
      )}
    </InputMask>
  );
};

export default PhoneField; 