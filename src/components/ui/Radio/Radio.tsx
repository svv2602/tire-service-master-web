import React from 'react';
import {
  Radio as MuiRadio,
  RadioProps as MuiRadioProps,
  FormControlLabel,
  FormControlLabelProps,
  RadioGroup,
  FormControl,
  FormLabel,
  styled
} from '@mui/material';

/** Опция для радио группы */
export interface RadioOption {
  /** Значение */
  value: string;
  /** Лейбл */
  label: string;
  /** Отключена ли опция */
  disabled?: boolean;
}

/** Пропсы радио кнопки */
export interface RadioProps extends Omit<MuiRadioProps, 'onChange'> {
  /** Опции */
  options: RadioOption[];
  /** Заголовок группы */
  label?: string;
  /** Значение */
  value?: string;
  /** Колбэк изменения значения */
  onChange?: (value: string) => void;
  /** Размер */
  size?: 'small' | 'medium';
  /** Цвет */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Расположение опций */
  row?: boolean;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiFormLabel-root': {
    marginBottom: theme.spacing(1),
  },
  '& .MuiRadio-root': {
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

/**
 * Компонент радио-кнопок
 * 
 * @example
 * <Radio
 *   label="Выберите опцию"
 *   options={[
 *     { value: 'option1', label: 'Опция 1' },
 *     { value: 'option2', label: 'Опция 2' },
 *   ]}
 *   value={value}
 *   onChange={setValue}
 * />
 */
export const Radio: React.FC<RadioProps> = ({
  options,
  label,
  value,
  onChange,
  size = 'medium',
  color = 'primary',
  row = false,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <StyledFormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup
        value={value}
        onChange={handleChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <MuiRadio
                size={size}
                color={color}
                {...props}
              />
            }
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
    </StyledFormControl>
  );
};

export default Radio; 