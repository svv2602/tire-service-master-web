import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Filter, FilterProps } from './Filter';
import { 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  ThemeProvider,
  useTheme,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/Filter',
  component: Filter,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Filter - фильтр с разворачиваемым содержимым. Обновлен для поддержки токенов дизайн-системы и темной темы.',
      },
    },
  },
} as Meta;

const Template: Story<FilterProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
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
        
        <Filter 
          {...args}
          onApply={() => console.log('Applied filters:', { category, search })}
          onReset={() => {
            setCategory('all');
            setSearch('');
          }}
        >
          <TextField
            label="Поиск"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Введите текст для поиска"
            size="small"
          />
          
          <FormControl fullWidth size="small">
            <InputLabel id="category-label">Категория</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Категория"
            >
              <MenuItem value="all">Все категории</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="inactive">Неактивные</MenuItem>
              <MenuItem value="pending">Ожидающие</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl component="fieldset">
            <FormLabel component="legend">Статус</FormLabel>
            <RadioGroup defaultValue="all">
              <FormControlLabel value="all" control={<Radio />} label="Все" />
              <FormControlLabel value="published" control={<Radio />} label="Опубликованные" />
              <FormControlLabel value="draft" control={<Radio />} label="Черновики" />
            </RadioGroup>
          </FormControl>
          
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Показывать архивные" />
            <FormControlLabel control={<Checkbox />} label="Только избранные" />
          </FormGroup>
        </Filter>
      </Box>
    </ThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Фильтры',
  defaultExpanded: true,
};

export const Collapsed = Template.bind({});
Collapsed.args = {
  title: 'Фильтры',
  defaultExpanded: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  title: 'Фильтры (отключено)',
  defaultExpanded: true,
  disabled: true,
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Расширенный поиск',
  defaultExpanded: true,
};