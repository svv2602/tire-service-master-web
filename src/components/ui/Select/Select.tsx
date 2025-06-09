import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  styled
} from '@mui/material';

/** Опция для селекта */
export interface SelectOption {
  /** Значение */
  value: string | number;
  /** Лейбл */
  label: string;
  /** Отключена ли опция */
  disabled?: boolean;
}

/** Пропсы селекта */
export interface SelectProps extends Omit<MuiSelectProps, 'onChange'> {
  /** Опции */
  options?: SelectOption[];
  /** Лейбл */
  label?: string;
  /** Текст подсказки */
  helperText?: string;
  /** Колбэк изменения значения */
  onChange?: (value: string | number) => void;
  /** Размер */
  size?: 'small' | 'medium';
  /** Ошибка */
  error?: boolean;
  /** Текст ошибки */
  errorText?: string;
  /** Полная ширина */
  fullWidth?: boolean;
  /** Дочерние элементы (альтернатива options) */
  children?: React.ReactNode;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, 12px) scale(1)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
  '& .MuiSelect-select': {
    padding: '12px 14px',
  },
}));

/**
 * Компонент выпадающего списка
 * 
 * @example
 * <Select
 *   label="Выберите опцию"
 *   options={[
 *     { value: 'option1', label: 'Опция 1' },
 *     { value: 'option2', label: 'Опция 2' },
 *   ]}
 *   value={value}
 *   onChange={setValue}
 * />
 */
export const Select: React.FC<SelectProps> = ({
  options,
  label,
  helperText,
  value,
  onChange,
  size = 'medium',
  error = false,
  errorText,
  fullWidth = false,
  children,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange?.(event.target.value as string | number);
  };

  const id = React.useId();
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;

  return (
    <StyledFormControl
      fullWidth={fullWidth}
      error={error}
      size={size}
    >
      {label && (
        <InputLabel id={labelId}>{label}</InputLabel>
      )}
      <MuiSelect
        labelId={labelId}
        value={value}
        onChange={handleChange as any}
        label={label}
        {...props}
      >
        {children || options?.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {(helperText || errorText) && (
        <FormHelperText id={helperId}>
          {error ? errorText : helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default Select; 