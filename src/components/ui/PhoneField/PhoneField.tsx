import React, { useRef } from 'react';
import { IMaskInput } from 'react-imask';
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

// Компонент маски для IMaskInput
interface CustomMaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PhoneMask = React.forwardRef<HTMLInputElement, CustomMaskProps>(
  function PhoneMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="+38 (000) 000-00-00"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  },
);

/**
 * Поле ввода телефона с маской +38 (0ХХ) ХХХ-ХХ-ХХ
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  showIcon = true,
  label = 'Телефон',
  required = false,
  helperText = 'Формат: +38 (0ХХ)ХХХ-ХХ-ХХ',
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
    <TextField
      {...props}
      type="tel"
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
      InputProps={{
        ...props.InputProps,
        inputComponent: PhoneMask as any,
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