import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

export const TimePickerSection: React.FC = () => {
  const [time1, setTime1] = useState<Date | null>(new Date());
  const [time2, setTime2] = useState<Date | null>(new Date());
  const [time3, setTime3] = useState<Date | null>(new Date());

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        TimePicker
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
              Базовый выбор времени
            </Typography>
            <TimePicker
              label="Выберите время"
              value={time1}
              onChange={(newValue) => setTime1(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 1 }
                }
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Выбранное время: {time1?.toLocaleTimeString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
              С 24-часовым форматом
            </Typography>
            <TimePicker
              label="24-часовой формат"
              value={time2}
              onChange={(newValue) => setTime2(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 1 }
                }
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Выбранное время: {time2?.toLocaleTimeString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
              С минутным шагом
            </Typography>
            <TimePicker
              label="Шаг 15 минут"
              value={time3}
              onChange={(newValue) => setTime3(newValue)}
              minutesStep={15}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 1 }
                }
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Выбранное время: {time3?.toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
};

export default TimePickerSection;