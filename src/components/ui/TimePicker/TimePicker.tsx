import React from 'react';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { ru } from 'date-fns/locale';
import { TimePickerProps } from './types';

/**
 * Компонент TimePicker - поле для выбора времени
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  format = 'HH:mm',
  minTime,
  maxTime,
  minutesStep = 1,
  showSeconds = false,
  ampm = false,
  disabled = false,
  readOnly = false,
  size = 'medium',
  textFieldProps,
  placeholder,
  error = false,
  helperText,
  label,
  sx,
  ...props
}) => {
  // Формат времени с учетом секунд
  const timeFormat = showSeconds ? `${format}:ss` : format;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <MuiTimePicker
        value={value}
        onChange={onChange}
        ampm={ampm}
        minutesStep={minutesStep}
        minTime={minTime}
        maxTime={maxTime}
        disabled={disabled}
        readOnly={readOnly}
        format={timeFormat}
        slots={{
          textField: TextField,
        }}
        slotProps={{
          textField: {
            ...textFieldProps,
            size,
            placeholder,
            error,
            helperText,
            label,
            sx,
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
}; 