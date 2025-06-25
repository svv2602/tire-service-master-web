import React from 'react';
import InputMask from 'react-input-mask';
import { TextField, TextFieldProps } from '../TextField';
import { InputAdornment } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import { formatPhoneNumber } from '../../../utils/validation';

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
  helperText = 'Формат: +380XXXXXXXXX',
  error = false,
  onBlur,
  ...props
}) => {
  // Обработчик изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    onChange(formattedValue);
  };

  return (
    <InputMask
      mask="+380 (99) 999-99-99"
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
    >
      {(inputProps: any) => (
        <TextField
          {...props}
          {...inputProps}
          type="tel"
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...props.InputProps,
            startAdornment: showIcon ? (
              <InputAdornment position="start">
                <PhoneIcon color={error ? 'error' : 'action'} />
              </InputAdornment>
            ) : null,
          }}
        />
      )}
    </InputMask>
  );
};

export default PhoneField; 