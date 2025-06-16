import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Snackbar from './Snackbar';
import { SnackbarProps } from './types';
import { SnackbarProvider, useSnackbar } from './SnackbarContext';
import { Box, Button, Stack, Typography, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Grid, Switch, Slider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export default {
  title: 'UI/Snackbar',
  component: Snackbar,
  parameters: {
    docs: {
      description: {
        component: 'Компонент уведомлений для отображения коротких сообщений пользователю.',
      },
    },
  },
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    ),
  ],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Тип уведомления',
    },
    anchorOrigin: {
      control: 'object',
      description: 'Позиция на экране',
    },
    autoHideDuration: {
      control: 'number',
      description: 'Время автоскрытия в миллисекундах',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Показать ли кнопку закрытия',
    },
  },
} as Meta;

// Компонент для демонстрации использования Snackbar
const SnackbarDemo = () => {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Типы уведомлений
      </Typography>
      <Stack spacing={2} direction="row" flexWrap="wrap">
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => showSuccess('Операция успешно выполнена!')}
        >
          Success
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<ErrorIcon />}
          onClick={() => showError('Произошла ошибка!')}
        >
          Error
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<WarningIcon />}
          onClick={() => showWarning('Внимание!')}
        >
          Warning
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<InfoIcon />}
          onClick={() => showInfo('Полезная информация')}
        >
          Info
        </Button>
      </Stack>
    </Box>
  );
};

// История с демонстрацией всех типов уведомлений
export const AllTypes = () => <SnackbarDemo />;

// История с длительным отображением
export const DurationExample = () => {
  const { showInfo } = useSnackbar();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Длительность отображения
      </Typography>
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          onClick={() => showInfo('Стандартное уведомление (6 секунд)', 6000)}
        >
          Стандартная длительность
        </Button>
        <Button
          variant="contained"
          onClick={() => showInfo('Долгое уведомление (10 секунд)', 10000)}
        >
          Долгое уведомление
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => showInfo('Короткое уведомление (2 секунды)', 2000)}
        >
          Короткое уведомление
        </Button>
      </Stack>
    </Box>
  );
};

// История с разными позициями
export const PositionExample = () => {
  const { showInfo } = useSnackbar();

  const positions = [
    { vertical: 'top', horizontal: 'left', label: 'Верхний левый' },
    { vertical: 'top', horizontal: 'center', label: 'Верхний центр' },
    { vertical: 'top', horizontal: 'right', label: 'Верхний правый' },
    { vertical: 'bottom', horizontal: 'left', label: 'Нижний левый' },
    { vertical: 'bottom', horizontal: 'center', label: 'Нижний центр' },
    { vertical: 'bottom', horizontal: 'right', label: 'Нижний правый' },
  ] as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Позиции уведомлений
      </Typography>
      <Grid container spacing={2}>
        {positions.map((position, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() =>
                showInfo(`Уведомление ${position.label}`, undefined, {
                  vertical: position.vertical,
                  horizontal: position.horizontal,
                })
              }
            >
              {position.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Интерактивный пример с конструктором уведомлений
export const CustomSnackbarBuilder = () => {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();
  const [message, setMessage] = useState('Текст уведомления');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [duration, setDuration] = useState(6000);
  const [position, setPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right',
  } as const);

  const showSnackbar = () => {
    switch (severity) {
      case 'success':
        showSuccess(message, duration, position);
        break;
      case 'error':
        showError(message, duration, position);
        break;
      case 'warning':
        showWarning(message, duration, position);
        break;
      case 'info':
        showInfo(message, duration, position);
        break;
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Конструктор уведомлений
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Текст уведомления"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
        />

        <FormControl component="fieldset">
          <FormLabel component="legend">Тип уведомления</FormLabel>
          <RadioGroup
            row
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
          >
            <FormControlLabel value="success" control={<Radio />} label="Success" />
            <FormControlLabel value="error" control={<Radio />} label="Error" />
            <FormControlLabel value="warning" control={<Radio />} label="Warning" />
            <FormControlLabel value="info" control={<Radio />} label="Info" />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Длительность (мс)</FormLabel>
          <Stack direction="row" spacing={2} alignItems="center">
            <Slider
              value={duration}
              onChange={(_, value) => setDuration(value as number)}
              min={1000}
              max={10000}
              step={1000}
              marks={[
                { value: 1000, label: '1с' },
                { value: 5000, label: '5с' },
                { value: 10000, label: '10с' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value / 1000}с`}
            />
          </Stack>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Позиция</FormLabel>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mt: 1 }}>
            {[
              { v: 'top', h: 'left', label: '↖' },
              { v: 'top', h: 'center', label: '↑' },
              { v: 'top', h: 'right', label: '↗' },
              { v: 'bottom', h: 'left', label: '↙' },
              { v: 'bottom', h: 'center', label: '↓' },
              { v: 'bottom', h: 'right', label: '↘' },
            ].map((pos) => (
              <Button
                key={`${pos.v}-${pos.h}`}
                variant={
                  position.vertical === pos.v && position.horizontal === pos.h
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => setPosition({ vertical: pos.v as any, horizontal: pos.h as any })}
                sx={{ minWidth: '60px', height: '60px', fontSize: '24px' }}
              >
                {pos.label}
              </Button>
            ))}
          </Box>
        </FormControl>

        <Button
          variant="contained"
          color={severity}
          size="large"
          onClick={showSnackbar}
          sx={{ mt: 2 }}
        >
          Показать уведомление
        </Button>
      </Box>
    </Paper>
  );
};

// Практические примеры использования
export const PracticalExamples = () => {
  const { showSuccess, showError, showInfo } = useSnackbar();
  
  return (
    <Stack spacing={4}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Форма входа
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" type="email" />
          <TextField label="Пароль" type="password" />
          <Button 
            variant="contained" 
            onClick={() => showSuccess('Вы успешно вошли в систему!')}
          >
            Войти
          </Button>
        </Box>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Список задач
        </Typography>
        <Stack spacing={1}>
          {['Завершить проект', 'Отправить отчет', 'Подготовить презентацию'].map((task, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>{task}</Typography>
              <Box>
                <Button 
                  size="small" 
                  onClick={() => showSuccess(`Задача "${task}" выполнена!`)}
                >
                  Выполнить
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => showError(`Задача "${task}" удалена!`)}
                >
                  Удалить
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Настройки
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel 
            control={<Switch />} 
            label="Уведомления по email" 
            onChange={() => showInfo('Настройки сохранены')}
          />
          <FormControlLabel 
            control={<Switch />} 
            label="Темная тема" 
            onChange={() => showInfo('Настройки сохранены')}
          />
          <Button 
            variant="contained" 
            onClick={() => showSuccess('Все настройки сохранены!')}
          >
            Сохранить все настройки
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
