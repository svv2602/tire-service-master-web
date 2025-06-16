import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Scrollbar, ScrollbarProps } from './Scrollbar';
import { 
  Box, 
  Typography, 
  Paper, 
  Switch, 
  FormControlLabel,
  ThemeProvider,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/Scrollbar',
  component: Scrollbar,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Scrollbar - кастомная полоса прокрутки с поддержкой темной темы и токенов дизайн-системы.',
      },
    },
  },
} as Meta;

const Template: Story<ScrollbarProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Пример компонента Scrollbar
          </Typography>
          <Typography variant="body2" gutterBottom>
            Прокрутите вниз, чтобы увидеть кастомный скроллбар
          </Typography>
        </Paper>
        
        <Scrollbar {...args}>
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 30 }).map((_, index) => (
              <Typography key={index} paragraph>
                Параграф {index + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, 
                quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies.
              </Typography>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </ThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  maxHeight: 300,
};

export const WithList: Story<ScrollbarProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Скроллбар со списком
          </Typography>
        </Paper>
        
        <Scrollbar {...args}>
          <List>
            {Array.from({ length: 50 }).map((_, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={`Элемент списка ${index + 1}`} 
                    secondary={`Дополнительная информация для элемента ${index + 1}`} 
                  />
                </ListItem>
                {index < 49 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Scrollbar>
      </Box>
    </ThemeProvider>
  );
};

WithList.args = {
  maxHeight: 400,
};

export const ShortContent: Story<ScrollbarProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Короткий контент (без скроллбара)
          </Typography>
        </Paper>
        
        <Scrollbar {...args}>
          <Box sx={{ p: 2 }}>
            <Typography paragraph>
              Этот контент недостаточно длинный, чтобы вызвать появление скроллбара.
            </Typography>
            <Typography paragraph>
              Скроллбар появится только если контент превысит заданную максимальную высоту.
            </Typography>
          </Box>
        </Scrollbar>
      </Box>
    </ThemeProvider>
  );
};

ShortContent.args = {
  maxHeight: 300,
};