import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { TimePicker } from './TimePicker';
import { TimePickerProps } from './types';
import { Stack, Box, Typography, Paper, Button } from '@mui/material';
import { format, addHours, setHours, setMinutes } from 'date-fns';

export default {
  title: 'UI/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Компонент для выбора времени с различными форматами и ограничениями.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    error: {
      control: 'boolean',
      defaultValue: false,
    },
    showSeconds: {
      control: 'boolean',
      defaultValue: false,
    },
    ampm: {
      control: 'boolean',
      defaultValue: false,
    },
    minutesStep: {
      control: 'number',
      defaultValue: 1,
    },
  },
} as Meta;

// Компонент-обертка для демонстрации
const Template: Story<TimePickerProps> = (args) => {
  const [value, setValue] = useState<Date | null>(args.value ?? null);

  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 300 }}>
      <TimePicker {...args} value={value} onChange={handleChange} />
    </Box>
  );
};

/**
 * Базовый пример использования TimePicker
 */
export const Basic = Template.bind({});
Basic.args = {
  label: 'Выберите время',
};

/**
 * TimePicker с отображением секунд
 */
export const WithSeconds = Template.bind({});
WithSeconds.args = {
  label: 'Время с секундами',
  showSeconds: true,
  format: 'HH:mm:ss',
};

/**
 * TimePicker в 12-часовом формате
 */
export const WithAMPM = Template.bind({});
WithAMPM.args = {
  label: '12-часовой формат',
  ampm: true,
  format: 'hh:mm a',
};

/**
 * TimePicker с шагом в 5 минут
 */
export const WithStep = Template.bind({});
WithStep.args = {
  label: 'Шаг 5 минут',
  minutesStep: 5,
};

/**
 * TimePicker с ограничением времени
 */
export const WithMinMax = Template.bind({});
WithMinMax.args = {
  label: 'Рабочие часы',
  minTime: new Date(2024, 0, 1, 9, 0), // 9:00
  maxTime: new Date(2024, 0, 1, 18, 0), // 18:00
  helperText: 'Доступно с 9:00 до 18:00',
};

/**
 * TimePicker в состоянии ошибки
 */
export const WithError = Template.bind({});
WithError.args = {
  label: 'Время с ошибкой',
  error: true,
  helperText: 'Обязательное поле',
};

/**
 * Отключенный TimePicker
 */
export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Недоступно',
  disabled: true,
  value: new Date(2024, 0, 1, 12, 0), // 12:00
};

// Дополнительные примеры

/**
 * Различные форматы времени
 */
export const TimeFormats = () => {
  const [time, setTime] = useState<Date | null>(new Date());
  
  return (
    <Stack spacing={3} sx={{ width: 300 }}>
      <TimePicker
        label="24-часовой формат"
        value={time}
        onChange={setTime}
        format="HH:mm"
      />
      
      <TimePicker
        label="12-часовой формат"
        value={time}
        onChange={setTime}
        ampm={true}
        format="hh:mm a"
      />
      
      <TimePicker
        label="С секундами"
        value={time}
        onChange={setTime}
        showSeconds={true}
        format="HH:mm:ss"
      />
    </Stack>
  );
};

/**
 * Интерактивный пример с расписанием
 */
export const ScheduleExample = () => {
  const now = new Date();
  const [startTime, setStartTime] = useState<Date | null>(
    setHours(setMinutes(now, 0), 9) // 9:00
  );
  const [endTime, setEndTime] = useState<Date | null>(
    setHours(setMinutes(now, 0), 18) // 18:00
  );
  
  const formatTimeToString = (date: Date | null) => {
    if (!date) return 'Не выбрано';
    return format(date, 'HH:mm');
  };
  
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    
    // Разница в минутах
    const diffTime = endTime.getTime() - startTime.getTime();
    const diffMinutes = Math.round(diffTime / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return { hours, minutes };
  };
  
  const duration = calculateDuration();
  const hasValidTimes = startTime !== null && endTime !== null;
  const hasError = hasValidTimes && startTime >= endTime;
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Планирование встречи
      </Typography>
      
      <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3 }}>
        <TimePicker
          label="Время начала"
          value={startTime}
          onChange={setStartTime}
          minutesStep={15}
          format="HH:mm"
        />
        
        <TimePicker
          label="Время окончания"
          value={endTime}
          onChange={setEndTime}
          minutesStep={15}
          format="HH:mm"
          error={hasError}
          helperText={hasError
            ? "Время окончания должно быть позже времени начала" 
            : ""}
        />
      </Stack>
      
      <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>Начало:</strong> {formatTimeToString(startTime)}
        </Typography>
        <Typography variant="body2">
          <strong>Окончание:</strong> {formatTimeToString(endTime)}
        </Typography>
        {duration && hasValidTimes && !hasError && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Продолжительность:</strong> {duration.hours} ч {duration.minutes} мин
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 