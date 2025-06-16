import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Alert, AlertProps } from './Alert';
import { Box, Button } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined', 'info', 'success', 'warning', 'error'],
      defaultValue: 'standard',
    },
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      defaultValue: 'info',
    },
    closable: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const Template: Story<AlertProps> = (args) => <Alert {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  children: 'Это стандартное оповещение',
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Заголовок оповещения',
  children: 'Текст оповещения с заголовком',
};

// Варианты severity
export const Info = Template.bind({});
Info.args = {
  severity: 'info',
  children: 'Информационное оповещение',
};

export const Success = Template.bind({});
Success.args = {
  severity: 'success',
  children: 'Успешное действие',
};

export const Warning = Template.bind({});
Warning.args = {
  severity: 'warning',
  children: 'Предупреждение',
};

export const Error = Template.bind({});
Error.args = {
  severity: 'error',
  children: 'Ошибка',
};

// Варианты отображения
export const Standard = Template.bind({});
Standard.args = {
  variant: 'standard',
  severity: 'info',
  children: 'Стандартный вариант оповещения',
};

export const Filled = Template.bind({});
Filled.args = {
  variant: 'filled',
  severity: 'info',
  children: 'Заполненный вариант оповещения',
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
  severity: 'info',
  children: 'Контурный вариант оповещения',
};

// Закрываемый алерт
export const Closable = () => {
  const [open, setOpen] = useState(true);
  const [alertHistory, setAlertHistory] = useState<string[]>([]);

  const handleClose = () => {
    setOpen(false);
    setAlertHistory(prev => [...prev, 'Оповещение было закрыто']);
  };

  const handleReset = () => {
    setOpen(true);
    setAlertHistory([]);
  };

  return (
    <div>
      {open ? (
        <Alert
          severity="info"
          closable
          onClose={handleClose}
        >
          Нажмите на крестик, чтобы закрыть это оповещение
        </Alert>
      ) : (
        <Button 
          variant="outlined" 
          onClick={handleReset}
          sx={{ mt: 2 }}
        >
          Показать снова
        </Button>
      )}
      
      {alertHistory.length > 0 && (
        <Box sx={{ mt: 2, color: 'gray' }}>
          {alertHistory.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </Box>
      )}
    </div>
  );
};

// С действиями
export const WithActions = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const actions = [
    {
      label: 'Ок',
      onClick: () => setMessages(prev => [...prev, 'Нажата кнопка "Ок"']),
    },
    {
      label: 'Отмена',
      onClick: () => setMessages(prev => [...prev, 'Нажата кнопка "Отмена"']),
    },
  ];

  return (
    <div>
      <Alert
        severity="warning"
        title="Требуется подтверждение"
        actions={actions}
      >
        Оповещение с кнопками действий
      </Alert>
      
      {messages.length > 0 && (
        <Box sx={{ mt: 2, color: 'gray' }}>
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </Box>
      )}
    </div>
  );
};

// Длинный текст
export const LongText = Template.bind({});
LongText.args = {
  severity: 'info',
  title: 'Оповещение с длинным текстом',
  children: `Это оповещение содержит длинный текст, чтобы продемонстрировать, как компонент 
  обрабатывает большие объемы контента. В реальных приложениях оповещения могут содержать 
  подробные инструкции, описания ошибок или другую важную информацию, которую необходимо 
  донести до пользователя. Компонент должен корректно отображать такой контент, сохраняя 
  читаемость и эстетичный внешний вид.`,
};

// Комбинация всех типов
export const AllTypes = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
    <Alert severity="info">Информационное оповещение</Alert>
    <Alert severity="success">Успешное действие</Alert>
    <Alert severity="warning">Предупреждение</Alert>
    <Alert severity="error">Ошибка</Alert>
  </Box>
); 