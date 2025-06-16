import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { DatePicker, DatePickerProps } from './DatePicker';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { ru } from 'date-fns/locale';
import { addDays, subDays, format } from 'date-fns';

export default {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component: 'Компонент выбора даты с поддержкой различных форматов и ограничений.',
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
    format: {
      control: 'text',
      defaultValue: 'dd.MM.yyyy',
    },
  },
} as Meta;

const Template: Story<DatePickerProps> = (args) => {
  const [date, setDate] = useState<Date | null>(args.value || null);
  
  return (
    <DatePicker 
      {...args} 
      value={date}
      onChange={(newDate) => setDate(newDate)}
    />
  );
};

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Выберите дату',
};

export const WithValue = Template.bind({});
WithValue.args = {
  label: 'Дата с значением',
  value: new Date(),
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Дата с подсказкой',
  helperText: 'Выберите дату начала',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Дата с ошибкой',
  error: true,
  helperText: 'Пожалуйста, выберите корректную дату',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Отключенный выбор даты',
  disabled: true,
  value: new Date(),
};

// Форматы
export const DifferentFormats = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  
  return (
    <Stack spacing={3} sx={{ maxWidth: 300 }}>
      <DatePicker
        label="Формат DD.MM.YYYY"
        value={date}
        onChange={setDate}
        format="dd.MM.yyyy"
      />
      
      <DatePicker
        label="Формат MM/DD/YYYY"
        value={date}
        onChange={setDate}
        format="MM/dd/yyyy"
      />
      
      <DatePicker
        label="Формат YYYY-MM-DD"
        value={date}
        onChange={setDate}
        format="yyyy-MM-dd"
      />
      
      <DatePicker
        label="С днем недели"
        value={date}
        onChange={setDate}
        format="EEE, dd MMM yyyy"
      />
    </Stack>
  );
};

// С ограничениями
export const WithDateRange = () => {
  const today = new Date();
  const [date, setDate] = useState<Date | null>(today);
  
  return (
    <Stack spacing={3} sx={{ maxWidth: 300 }}>
      <DatePicker
        label="Минимальная дата (сегодня)"
        value={date}
        onChange={setDate}
        minDate={today}
        helperText="Нельзя выбрать дату ранее сегодняшней"
      />
      
      <DatePicker
        label="Максимальная дата (+7 дней)"
        value={date}
        onChange={setDate}
        maxDate={addDays(today, 7)}
        helperText="Нельзя выбрать дату позже 7 дней от сегодня"
      />
      
      <DatePicker
        label="Диапазон дат"
        value={date}
        onChange={setDate}
        minDate={subDays(today, 3)}
        maxDate={addDays(today, 3)}
        helperText="Можно выбрать дату в пределах ±3 дня от сегодня"
      />
    </Stack>
  );
};

// Интерактивный пример
export const DateRangeExample = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    // Если конечная дата раньше начальной, сбрасываем её
    if (date && endDate && date > endDate) {
      setEndDate(null);
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };
  
  const formatDateToString = (date: Date | null) => {
    if (!date) return 'Не выбрана';
    return format(date, 'dd.MM.yyyy');
  };
  
  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    
    // Разница в днях
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const days = calculateDays();
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Выбор периода дат
      </Typography>
      
      <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3 }}>
        <DatePicker
          label="Дата начала"
          value={startDate}
          onChange={handleStartDateChange}
          maxDate={endDate || undefined}
        />
        
        <DatePicker
          label="Дата окончания"
          value={endDate}
          onChange={handleEndDateChange}
          minDate={startDate || undefined}
          disabled={!startDate}
        />
      </Stack>
      
      <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>Дата начала:</strong> {formatDateToString(startDate)}
        </Typography>
        <Typography variant="body2">
          <strong>Дата окончания:</strong> {formatDateToString(endDate)}
        </Typography>
        {days !== null && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Период:</strong> {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 