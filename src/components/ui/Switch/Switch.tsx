import React from 'react';
import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
  FormControlLabelProps,
  styled
} from '@mui/material';

/** Пропсы переключателя */
export interface SwitchProps extends Omit<MuiSwitchProps, 'size'> {
  /** Подпись переключателя */
  label?: string;
  /** Размер переключателя */
  size?: 'small' | 'medium' | 'large';
  /** Цвет переключателя */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Положение подписи */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  /** Отключен ли переключатель */
  disabled?: boolean;
  /** Состояние переключателя */
  checked?: boolean;
  /** Колбэк изменения состояния */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

/** Стилизованный переключатель */
const StyledSwitch = styled(MuiSwitch)<{ customSize?: 'small' | 'medium' | 'large' }>(({ theme, customSize = 'medium' }) => {
  const sizes = {
    small: {
      width: 34,
      height: 18,
      padding: 0,
      thumbSize: 14,
      trackHeight: 18,
    },
    medium: {
      width: 42,
      height: 22,
      padding: 0,
      thumbSize: 18,
      trackHeight: 22,
    },
    large: {
      width: 50,
      height: 26,
      padding: 0,
      thumbSize: 22,
      trackHeight: 26,
    },
  };

  const size = sizes[customSize];

  return {
    width: size.width,
    height: size.height,
    padding: size.padding,
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: `translateX(${size.width - size.thumbSize - 4}px)`,
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: theme.palette.primary.main,
        border: `6px solid #fff`,
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[400],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: size.thumbSize,
      height: size.thumbSize,
      boxShadow: theme.shadows[2],
      transition: theme.transitions.create(['transform'], {
        duration: theme.transitions.duration.shorter,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: size.trackHeight / 2,
      backgroundColor: theme.palette.grey[400],
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: theme.transitions.duration.shorter,
      }),
    },
  };
});

/**
 * Компонент переключателя
 * 
 * @example
 * <Switch
 *   label="Включить уведомления"
 *   checked={enabled}
 *   onChange={(event, checked) => setEnabled(checked)}
 * />
 */
export const Switch: React.FC<SwitchProps> = ({
  label,
  size = 'medium',
  color = 'primary',
  labelPlacement = 'end',
  disabled = false,
  checked,
  onChange,
  ...props
}) => {
  const switchElement = (
    <StyledSwitch
      customSize={size}
      color={color}
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      {...props}
    />
  );

  if (label) {
    return (
      <FormControlLabel
        control={switchElement}
        label={label}
        labelPlacement={labelPlacement}
        disabled={disabled}
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
            color: disabled ? 'text.disabled' : 'text.primary',
          },
        }}
      />
    );
  }

  return switchElement;
};

export default Switch; 