import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Card } from '../../../../components/ui/Card';

export const TimePickerSection: React.FC = () => {
  const [value1, setValue1] = useState<Date | null>(new Date());
  const [value2, setValue2] = useState<Date | null>(new Date());
  const [value3, setValue3] = useState<Date | null>(new Date());

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        TimePicker
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <Card title="Примеры выбора времени">
          <Grid container spacing={4}>
            {/* Базовый TimePicker */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Базовый выбор времени</Typography>
              <TimePicker
                label="Выберите время"
                value={value1}
                onChange={(newValue) => setValue1(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>

            {/* TimePicker с 24-часовым форматом */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>24-часовой формат</Typography>
              <TimePicker
                label="24-часовой формат"
                value={value2}
                onChange={(newValue) => setValue2(newValue)}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>

            {/* TimePicker с шагом */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>С шагом в 5 минут</Typography>
              <TimePicker
                label="Выберите время"
                value={value3}
                onChange={(newValue) => setValue3(newValue)}
                minutesStep={5}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>

            {/* Отключенный TimePicker */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Отключенный выбор времени</Typography>
              <TimePicker
                label="Отключено"
                value={value1}
                onChange={(newValue) => setValue1(newValue)}
                disabled
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Card>
      </LocalizationProvider>
    </Box>
  );
};

export default TimePickerSection;