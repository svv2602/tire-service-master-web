import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled, useTheme } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент DatePicker
const StyledDatePicker = styled(MuiDatePicker)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiInputBase-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.md,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: themeColors.backgroundPrimary,
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
      
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.primary,
      },
      
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.primary,
        borderWidth: '2px',
        boxShadow: theme.palette.mode === 'dark' 
          ? `0 0 0 2px ${themeColors.primaryDark}40` 
          : `0 0 0 2px ${themeColors.primaryLight}40`,
      },
      
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.error,
      },
      
      '&.Mui-disabled': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.backgroundSecondary 
          : themeColors.backgroundTertiary,
        opacity: 0.7,
      },
    },
    
    '& .MuiInputLabel-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.md,
      transition: tokens.transitions.duration.normal,
      
      '&.Mui-focused': {
        color: themeColors.primary,
      },
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
    
    '& .MuiFormHelperText-root': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.xs,
      marginTop: tokens.spacing.xxs,
      
      '&.Mui-error': {
        color: themeColors.error,
      },
    },
    
    // Стилизация календаря
    '& .MuiDateCalendar-root': {
      fontFamily: tokens.typography.fontFamily,
      backgroundColor: themeColors.backgroundPrimary,
      borderRadius: tokens.borderRadius.md,
      
      '& .MuiDayCalendar-header': {
        '& .MuiDayCalendar-weekDayLabel': {
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.fontSize.sm,
          color: themeColors.textSecondary,
        },
      },
      
      '& .MuiPickersDay-root': {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize.sm,
        transition: tokens.transitions.duration.fast,
        
        '&.Mui-selected': {
          backgroundColor: themeColors.primary,
          color: '#fff',
          
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? themeColors.primaryDark 
              : themeColors.primaryLight,
          },
        },
        
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
        
        '&.Mui-disabled': {
          color: themeColors.textDisabled,
        },
      },
      
      '& .MuiPickersCalendarHeader-root': {
        '& .MuiPickersCalendarHeader-label': {
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.medium,
        },
      },
    },
    
    // Стилизация кнопок выбора года/месяца
    '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      borderRadius: tokens.borderRadius.sm,
      transition: tokens.transitions.duration.fast,
      
      '&.Mui-selected': {
        backgroundColor: themeColors.primary,
        color: '#fff',
      },
    },
  };
});

export interface DatePickerProps {
  /** Значение даты */
  value: Date | null;
  /** Callback при изменении даты */
  onChange: (date: Date | null) => void;
  /** Label для поля */
  label?: string;
  /** Текст-подсказка */
  helperText?: string;
  /** Флаг ошибки */
  error?: boolean;
  /** Флаг отключения компонента */
  disabled?: boolean;
  /** Минимальная доступная дата */
  minDate?: Date;
  /** Максимальная доступная дата */
  maxDate?: Date;
  /** Формат отображения даты */
  format?: string;
}

/**
 * Компонент выбора даты
 * 
 * @example
 * ```tsx
 * <DatePicker
 *   label="Выберите дату"
 *   value={date}
 *   onChange={handleDateChange}
 *   minDate={new Date()}
 *   format="dd.MM.yyyy"
 * />
 * ```
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  helperText,
  error,
  disabled,
  minDate,
  maxDate,
  format = 'dd.MM.yyyy',
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledDatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        slotProps={{
          textField: {
            helperText,
            error,
            sx: {
              '& .MuiInputBase-root': {
                fontFamily: tokens.typography.fontFamily,
              },
              '& .MuiInputLabel-root': {
                fontFamily: tokens.typography.fontFamily,
              },
              '& .MuiFormHelperText-root': {
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.fontSize.xs,
                marginTop: tokens.spacing.xxs,
              },
            },
          },
          day: {
            sx: {
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.fontSize.sm,
            },
          },
          calendarHeader: {
            sx: {
              '& .MuiPickersCalendarHeader-label': {
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
              },
            },
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DatePicker; 