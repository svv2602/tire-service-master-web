import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import { useTranslation } from 'react-i18next';

/** Опция для селекта */
export interface SelectOption {
  /** Значение */
  value: string | number;
  /** Лейбл */
  label: string;
  /** Отключена ли опция */
  disabled?: boolean;
}

/** Пропсы селекта */
export interface SelectProps extends Omit<MuiSelectProps, 'onChange'> {
  /** Опции */
  options?: SelectOption[];
  /** Лейбл */
  label?: string;
  /** Текст подсказки */
  helperText?: string;
  /** Колбэк изменения значения */
  onChange?: (value: string | number) => void;
  /** Размер */
  size?: 'small' | 'medium';
  /** Ошибка */
  error?: boolean;
  /** Текст ошибки */
  errorText?: string;
  /** Полная ширина */
  fullWidth?: boolean;
  /** Дочерние элементы (альтернатива options) */
  children?: React.ReactNode;
}

const StyledFormControl = styled(FormControl)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    marginBottom: tokens.spacing.sm,
    
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 12px) scale(1)',
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textSecondary,
      
      '&.Mui-focused': {
        color: themeColors.primary,
        transform: 'translate(14px, -9px) scale(0.75)',
      },
      
      '&.MuiFormLabel-filled': {
        transform: 'translate(14px, -9px) scale(0.75)',
      },
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
    
    '& .MuiSelect-select': {
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textPrimary,
      backgroundColor: themeColors.backgroundField,
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiOutlinedInput-root': {
      borderRadius: tokens.borderRadius.md,
      
      '& fieldset': {
        borderColor: themeColors.borderPrimary,
        transition: tokens.transitions.duration.normal,
      },
      
      '&:hover fieldset': {
        borderColor: themeColors.borderHover,
      },
      
      '&.Mui-focused fieldset': {
        borderColor: themeColors.primary,
        borderWidth: 1,
      },
      
      '&.Mui-error fieldset': {
        borderColor: themeColors.error,
      },
    },
    
    '& .MuiFormHelperText-root': {
      fontSize: tokens.typography.fontSize.xs,
      fontFamily: tokens.typography.fontFamily,
      marginLeft: tokens.spacing.sm,
      marginTop: tokens.spacing.xs,
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
    
    '& .MuiMenuItem-root': {
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      
      '&:hover': {
        backgroundColor: themeColors.backgroundHover,
      },
      
      '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(25, 118, 210, 0.15)'
          : 'rgba(25, 118, 210, 0.08)',
        
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.25)'
            : 'rgba(25, 118, 210, 0.12)',
        },
      },
    },
  };
});

/**
 * Компонент выпадающего списка
 * 
 * @example
 * <Select
 *   label="Выберите опцию"
 *   options={[
 *     { value: 'option1', label: 'Опция 1' },
 *     { value: 'option2', label: 'Опция 2' },
 *   ]}
 *   value={value}
 *   onChange={setValue}
 * />
 */
export const Select: React.FC<SelectProps> = ({
  options,
  label,
  helperText,
  value,
  onChange,
  size = 'medium',
  error = false,
  errorText,
  fullWidth = false,
  children,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  const { t } = useTranslation();
  
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange?.(event.target.value as string | number);
  };

  const id = React.useId();
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;

  return (
    <StyledFormControl
      fullWidth={fullWidth}
      error={error}
      size={size}
    >
      {label && (
        <InputLabel id={labelId}>{t(label)}</InputLabel>
      )}
      <MuiSelect
        labelId={labelId}
        value={value}
        onChange={handleChange as any}
        label={label ? t(label) : undefined}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: themeColors.backgroundCard,
              boxShadow: tokens.shadows.md,
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${themeColors.borderPrimary}`,
              marginTop: tokens.spacing.xs,
            }
          }
        }}
        {...props}
      >
        {/* Опция по умолчанию */}
        {(!props.multiple && (value === undefined || value === '' || value === null) && !children) && (
          <MenuItem value="" disabled>
            {t('select.placeholder')}
          </MenuItem>
        )}
        {children || options?.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {t(option.label)}
          </MenuItem>
        ))}
      </MuiSelect>
      {(helperText || errorText) && (
        <FormHelperText id={helperId}>
          {error ? t(errorText || '') : t(helperText || '')}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default Select; 