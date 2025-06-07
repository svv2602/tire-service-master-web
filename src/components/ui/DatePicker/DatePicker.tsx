import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// Стилизованный компонент DatePicker
const StyledDatePicker = styled(MuiDatePicker)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

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
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DatePicker; 