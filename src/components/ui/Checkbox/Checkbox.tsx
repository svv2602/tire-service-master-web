import React from 'react';
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
  styled
} from '@mui/material';

/** Пропсы чекбокса */
export interface CheckboxProps extends Omit<MuiCheckboxProps, 'onChange'> {
  /** Лейбл чекбокса */
  label?: string;
  /** Позиция лейбла */
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  /** Колбэк изменения состояния */
  onChange?: (checked: boolean) => void;
  /** Размер чекбокса */
  size?: 'small' | 'medium';
  /** Цвет чекбокса */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiCheckbox-root': {
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  '& .MuiCheckbox-colorPrimary.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '& .MuiCheckbox-colorSecondary.Mui-checked': {
    color: theme.palette.secondary.main,
  },
}));

/**
 * Компонент чекбокса
 * 
 * @example
 * <Checkbox
 *   label="Выбрать опцию"
 *   checked={checked}
 *   onChange={setChecked}
 *   color="primary"
 * />
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  labelPlacement = 'end',
  onChange,
  checked,
  size = 'medium',
  color = 'primary',
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  if (label) {
    return (
      <StyledFormControlLabel
        control={
          <MuiCheckbox
            checked={checked}
            onChange={handleChange}
            size={size}
            color={color}
            {...props}
          />
        }
        label={label}
        labelPlacement={labelPlacement}
      />
    );
  }

  return (
    <MuiCheckbox
      checked={checked}
      onChange={handleChange}
      size={size}
      color={color}
      {...props}
    />
  );
};

export default Checkbox; 