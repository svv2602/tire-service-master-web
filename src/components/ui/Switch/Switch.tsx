import React from 'react';
import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
  FormControlLabelProps,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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
const StyledSwitch = styled(MuiSwitch, {
  // Исключаем кастомные пропы из передачи в DOM
  shouldForwardProp: (prop) => prop !== 'customSize',
})<{ customSize?: 'small' | 'medium' | 'large' }>(({ theme, customSize = 'medium' }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
      transition: tokens.transitions.duration.normal,
      '&.Mui-checked': {
        transform: `translateX(${size.width - size.thumbSize - 4}px)`,
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#1976d2', // Яркий синий цвет
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#1976d2', // Яркий синий цвет для фокуса
        border: `6px solid ${themeColors.backgroundPrimary}`,
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.mode === 'dark' ? themeColors.borderPrimary : theme.palette.grey[400],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'dark' ? 0.4 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: size.thumbSize,
      height: size.thumbSize,
      boxShadow: tokens.shadows.sm,
      transition: tokens.transitions.duration.normal,
    },
    '& .MuiSwitch-track': {
      borderRadius: size.trackHeight / 2,
      backgroundColor: theme.palette.mode === 'dark' ? themeColors.borderPrimary : theme.palette.grey[400],
      opacity: 1,
      transition: tokens.transitions.duration.normal,
    },
  };
});

/** Стилизованный компонент FormControlLabel */
const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    margin: 0,
    marginRight: tokens.spacing.md,
    userSelect: 'none',
    
    '& .MuiFormControlLabel-label': {
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textPrimary,
      transition: tokens.transitions.duration.normal,
    },
    
    '&.Mui-disabled': {
      '& .MuiFormControlLabel-label': {
        color: themeColors.textSecondary,
        opacity: 0.6,
      },
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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
      <StyledFormControlLabel
        control={switchElement}
        label={label}
        labelPlacement={labelPlacement}
        disabled={disabled}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontSize: size === 'small' ? tokens.typography.fontSize.xs : 
                    size === 'large' ? tokens.typography.fontSize.md : 
                    tokens.typography.fontSize.sm,
          },
        }}
      />
    );
  }

  return switchElement;
};

export default Switch; 