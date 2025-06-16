import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

export type TextFieldProps = MuiTextFieldProps & {
  /** Состояние ошибки */
  error?: boolean;
  /** Текст ошибки */
  helperText?: React.ReactNode;
  /** Размер поля */
  size?: 'small' | 'medium';
  /** Вариант отображения */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Растянуть на всю ширину */
  fullWidth?: boolean;
}

const StyledTextField = styled(MuiTextField)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiOutlinedInput-root': {
      transition: tokens.transitions.duration.normal,
      backgroundColor: themeColors.backgroundField,
      borderRadius: tokens.borderRadius.md,
      
      '&:hover': {
        backgroundColor: themeColors.backgroundHover,
      },
      
      '&.Mui-focused': {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      },
      '&:hover fieldset': {
        borderColor: tokens.colors.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: tokens.colors.primary.main,
      },
      '&.Mui-error fieldset': {
        borderColor: tokens.colors.error.main,
      }
    },
    
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: themeColors.borderPrimary,
      borderWidth: '1px',
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiInputLabel-root': {
      color: themeColors.textSecondary,
      fontSize: tokens.typography.fontSize.sm,
      transition: tokens.transitions.duration.normal,
      
      '&.Mui-focused': {
        color: tokens.colors.primary.main,
      },
      '&.Mui-error': {
        color: tokens.colors.error.main,
      }
    },
    
    '& .MuiInputBase-input': {
      color: themeColors.textPrimary,
      fontSize: tokens.typography.fontSize.md,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    },
    
    '& .MuiFormHelperText-root': {
      fontSize: tokens.typography.fontSize.xs,
      marginTop: tokens.spacing.xs,
      
      '&.Mui-error': {
        color: tokens.colors.error.main,
      }
    },
  };
});

/**
 * Кастомный компонент текстового поля
 * 
 * @example
 * <TextField
 *   label="Имя"
 *   value={value}
 *   onChange={handleChange}
 *   error={!!error}
 *   helperText={error}
 * />
 */
export const TextField: React.FC<TextFieldProps> = ({
  error = false,
  helperText,
  size = 'medium',
  variant = 'outlined',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledTextField
      error={error}
      helperText={helperText}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      {...props}
    />
  );
};

export default TextField;