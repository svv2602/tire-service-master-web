import React from 'react';
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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

// Стилизованный чекбокс
const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: tokens.spacing.xs,
    transition: tokens.transitions.duration.normal,
    
    '&:hover': {
      backgroundColor: 'transparent',
    },
    
    '&.Mui-checked': {
      color: themeColors.primary,
    },
    
    '&.MuiCheckbox-colorPrimary.Mui-checked': {
      color: themeColors.primary,
    },
    
    '&.MuiCheckbox-colorSecondary.Mui-checked': {
      color: theme.palette.secondary.main,
    },
    
    '&.MuiCheckbox-colorError.Mui-checked': {
      color: themeColors.error,
    },
    
    '&.MuiCheckbox-colorWarning.Mui-checked': {
      color: theme.palette.warning.main,
    },
    
    '&.MuiCheckbox-colorInfo.Mui-checked': {
      color: theme.palette.info.main,
    },
    
    '&.MuiCheckbox-colorSuccess.Mui-checked': {
      color: theme.palette.success.main,
    },
  };
});

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    margin: 0,
    marginRight: tokens.spacing.md,
    userSelect: 'none',
    
    '& .MuiFormControlLabel-label': {
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textPrimary,
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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  if (label) {
    return (
      <StyledFormControlLabel
        control={
          <StyledCheckbox
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
    <StyledCheckbox
      checked={checked}
      onChange={handleChange}
      size={size}
      color={color}
      {...props}
    />
  );
};

export default Checkbox; 