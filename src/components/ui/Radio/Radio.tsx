import React from 'react';
import {
  Radio as MuiRadio,
  RadioProps as MuiRadioProps,
  FormControlLabel,
  FormControlLabelProps,
  RadioGroup,
  FormControl,
  FormLabel,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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

// Стилизованный компонент FormControl
const StyledFormControl = styled(FormControl)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    marginBottom: tokens.spacing.md,
    
    '& .MuiFormLabel-root': {
      marginBottom: tokens.spacing.sm,
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textSecondary,
      
      '&.Mui-focused': {
        color: themeColors.primary,
      },
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
  };
});

// Стилизованный компонент Radio
const StyledRadio = styled(MuiRadio)(({ theme }) => {
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
    
    '&.MuiRadio-colorPrimary.Mui-checked': {
      color: themeColors.primary,
    },
    
    '&.MuiRadio-colorSecondary.Mui-checked': {
      color: theme.palette.secondary.main,
    },
    
    '&.MuiRadio-colorError.Mui-checked': {
      color: themeColors.error,
    },
    
    '&.MuiRadio-colorWarning.Mui-checked': {
      color: theme.palette.warning.main,
    },
    
    '&.MuiRadio-colorInfo.Mui-checked': {
      color: theme.palette.info.main,
    },
    
    '&.MuiRadio-colorSuccess.Mui-checked': {
      color: theme.palette.success.main,
    },
  };
});

// Стилизованный компонент FormControlLabel
const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    margin: 0,
    marginRight: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
        sx={{
          gap: tokens.spacing.xs,
        }}
      >
        {options.map((option) => (
          <StyledFormControlLabel
            key={option.value}
            value={option.value}
            control={
              <StyledRadio
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