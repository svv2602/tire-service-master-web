import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Button, Stack } from '@mui/material';
import Snackbar from './Snackbar';
import { SnackbarProvider, useSnackbar } from './SnackbarContext';

// Определяем мета-информацию для компонента
const meta = {
  title: 'UI/Snackbar',
  component: Snackbar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    ),
  ],
} satisfies Meta<typeof Snackbar>;

export default meta;

// Компонент для демонстрации использования Snackbar
const SnackbarDemo = () => {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  return (
    <Stack spacing={2} direction="row">
      <Button
        variant="contained"
        color="success"
        onClick={() => showSuccess('Операция успешно выполнена!')}
      >
        Success
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => showError('Произошла ошибка!')}
      >
        Error
      </Button>
      <Button
        variant="contained"
        color="warning"
        onClick={() => showWarning('Внимание!')}
      >
        Warning
      </Button>
      <Button
        variant="contained"
        color="info"
        onClick={() => showInfo('Полезная информация')}
      >
        Info
      </Button>
    </Stack>
  );
};

// История с демонстрацией всех типов уведомлений
export const AllTypes: StoryFn = () => <SnackbarDemo />;

// История с длительным отображением
export const LongDuration: StoryFn = () => {
  const { showInfo } = useSnackbar();

  return (
    <Button
      variant="contained"
      onClick={() => showInfo('Это сообщение будет показано 10 секунд', 10000)}
    >
      Show Long Message
    </Button>
  );
};

// История с разными позициями
export const DifferentPositions: StoryFn = () => {
  const { showInfo } = useSnackbar();

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={() =>
          showInfo('Уведомление сверху', undefined, {
            vertical: 'top',
            horizontal: 'center'
          })
        }
      >
        Top Center
      </Button>
      <Button
        variant="contained"
        onClick={() =>
          showInfo('Уведомление справа', undefined, {
            vertical: 'bottom',
            horizontal: 'right'
          })
        }
      >
        Bottom Right
      </Button>
    </Stack>
  );
}; 