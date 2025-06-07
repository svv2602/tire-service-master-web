import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '../../../../components/ui/DatePicker';

const DatePickerSection = () => {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Выбор даты (DatePicker)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовый выбор даты
          </Typography>
          <DatePicker
            label="Выберите дату"
            value={date}
            onChange={setDate}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            С ограничением дат
          </Typography>
          <DatePicker
            label="Выберите дату"
            value={date}
            onChange={setDate}
            minDate={new Date('2024-01-01')}
            maxDate={new Date('2024-12-31')}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            С ошибкой
          </Typography>
          <DatePicker
            label="Выберите дату"
            value={date}
            onChange={setDate}
            error
            helperText="Некорректная дата"
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Отключенный
          </Typography>
          <DatePicker
            label="Выберите дату"
            value={date}
            onChange={setDate}
            disabled
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DatePickerSection; 