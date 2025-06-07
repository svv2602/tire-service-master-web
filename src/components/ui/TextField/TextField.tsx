import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ANIMATIONS } from '../../../styles/theme';

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

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: ANIMATIONS.transition.medium,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    }
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)',
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)',
  },
  
  '& .MuiInputBase-input': {
    color: theme.palette.mode === 'dark'
      ? '#ffffff'
      : '#000000',
  },
}));

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