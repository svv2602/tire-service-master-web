import React from 'react';
import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
  FormControlLabelProps,
  styled
} from '@mui/material';

/** Пропсы переключателя */
export interface SwitchProps extends Omit<MuiSwitchProps, 'onChange'> {
  /** Лейбл */
  label?: string;
  /** Позиция лейбла */
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  /** Колбэк изменения состояния */
  onChange?: (checked: boolean) => void;
  /** Размер */
  size?: 'small' | 'medium';
  /** Цвет */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiSwitch-root': {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 24,
    height: 24,
  },
  '& .MuiSwitch-track': {
    borderRadius: 13,
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
  },
}));

/**
 * Компонент переключателя
 * 
 * @example
 * <Switch
 *   label="Включить уведомления"
 *   checked={checked}
 *   onChange={setChecked}
 *   color="primary"
 * />
 */
export const Switch: React.FC<SwitchProps> = ({
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
          <MuiSwitch
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
    <MuiSwitch
      checked={checked}
      onChange={handleChange}
      size={size}
      color={color}
      {...props}
    />
  );
};

export default Switch; 