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
  // Force update: transparent background for all text fields in ALL states
  
  return {
    '& .MuiOutlinedInput-root': {
      transition: tokens.transitions.duration.normal,
      backgroundColor: 'transparent !important',
      borderRadius: tokens.borderRadius.md,
      
      // Убираем заливку во всех состояниях
      '&': {
        backgroundColor: 'transparent !important',
      },
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
      '&.Mui-focused': {
        backgroundColor: 'transparent !important',
      },
      '&.Mui-disabled': {
        backgroundColor: 'transparent !important',
      },
      '&.Mui-error': {
        backgroundColor: 'transparent !important',
      },
      '&.Mui-filled': {
        backgroundColor: 'transparent !important',
      },
      '&:not(.Mui-focused):hover': {
        backgroundColor: 'transparent !important',
      },
      
      // Стили для границ
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
    
    // Дополнительные стили для полного удаления заливки
    '& .MuiInputBase-root': {
      backgroundColor: 'transparent !important',
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
      '&.Mui-focused': {
        backgroundColor: 'transparent !important',
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
      backgroundColor: 'transparent !important',
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