import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Stepper, StepperProps, StepItem } from './Stepper';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  FormControlLabel, 
  Switch, 
  ThemeProvider, 
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox
} from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Stepper - пошаговый интерфейс для отображения прогресса через последовательность логических шагов. Обновлен для поддержки токенов дизайн-системы и темной темы.',
      },
    },
  },
} as Meta;

const Template: Story<StepperProps> = (args) => {
  const [activeStep, setActiveStep] = useState(0);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3 }}>
          <Stepper
            {...args}
            activeStep={activeStep}
            onStepChange={handleStepChange}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

// Пример с вертикальным степпером
export const Vertical = Template.bind({});
Vertical.args = {
  orientation: 'vertical',
  steps: [
    {
      label: 'Основная информация',
      description: 'Введите основные данные',
      content: (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Имя"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
          />
        </Box>
      ),
    },
    {
      label: 'Дополнительные сведения',
      description: 'Заполните дополнительную информацию',
      content: (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Телефон"
            fullWidth
            margin="normal"
          />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Предпочтительный способ связи</FormLabel>
            <RadioGroup defaultValue="email">
              <FormControlLabel value="email" control={<Radio />} label="Email" />
              <FormControlLabel value="phone" control={<Radio />} label="Телефон" />
            </RadioGroup>
          </FormControl>
        </Box>
      ),
    },
    {
      label: 'Завершение',
      content: (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Все данные заполнены. Проверьте информацию и нажмите "Отправить".
          </Typography>
          <FormControlLabel
            control={<Checkbox />}
            label="Я согласен с условиями использования"
          />
        </Box>
      ),
    },
  ],
};

// Пример с горизонтальным степпером
export const Horizontal = Template.bind({});
Horizontal.args = {
  orientation: 'horizontal',
  steps: [
    {
      label: 'Шаг 1',
      content: (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Содержимое первого шага
          </Typography>
          <TextField
            label="Поле ввода"
            fullWidth
            margin="normal"
          />
        </Box>
      ),
    },
    {
      label: 'Шаг 2',
      content: (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Содержимое второго шага
          </Typography>
          <FormControlLabel
            control={<Checkbox />}
            label="Опция 1"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Опция 2"
          />
        </Box>
      ),
    },
    {
      label: 'Шаг 3',
      content: (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Завершающий шаг
          </Typography>
          <Button variant="contained" color="primary">
            Завершить
          </Button>
        </Box>
      ),
    },
  ],
};

// Пример с опциональными шагами
export const WithOptionalSteps = Template.bind({});
WithOptionalSteps.args = {
  orientation: 'vertical',
  steps: [
    {
      label: 'Обязательный шаг',
      description: 'Этот шаг необходимо заполнить',
      content: (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Имя"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            required
          />
        </Box>
      ),
    },
    {
      label: 'Опциональный шаг',
      description: 'Этот шаг можно пропустить',
      optional: true,
      content: (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Дополнительная информация"
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </Box>
      ),
    },
    {
      label: 'Завершение',
      content: (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Все готово!
          </Typography>
          <Button variant="contained" color="primary">
            Отправить
          </Button>
        </Box>
      ),
    },
  ],
};

// Пример с отключенным степпером
export const Disabled = Template.bind({});
Disabled.args = {
  ...Vertical.args,
  disabled: true,
};