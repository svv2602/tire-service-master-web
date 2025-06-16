import React, { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react';
import AutoComplete from './AutoComplete';
import { AutoCompleteProps, AutoCompleteOption } from './types';
import { Box, Typography, Paper, Grid, Chip, Avatar, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';

// Моковые данные
const countries: AutoCompleteOption[] = [
  { id: 1, label: 'Россия', code: 'RU', population: '146 млн' },
  { id: 2, label: 'США', code: 'US', population: '331 млн' },
  { id: 3, label: 'Китай', code: 'CN', population: '1.4 млрд' },
  { id: 4, label: 'Япония', code: 'JP', population: '126 млн' },
  { id: 5, label: 'Германия', code: 'DE', population: '83 млн' },
  { id: 6, label: 'Франция', code: 'FR', population: '67 млн' },
  { id: 7, label: 'Великобритания', code: 'GB', population: '67 млн' },
  { id: 8, label: 'Италия', code: 'IT', population: '60 млн' },
  { id: 9, label: 'Бразилия', code: 'BR', population: '212 млн' },
  { id: 10, label: 'Канада', code: 'CA', population: '38 млн' },
];

const cities: AutoCompleteOption[] = [
  { id: 1, label: 'Москва', country: 'Россия', population: '12.6 млн' },
  { id: 2, label: 'Нью-Йорк', country: 'США', population: '8.4 млн' },
  { id: 3, label: 'Токио', country: 'Япония', population: '13.9 млн' },
  { id: 4, label: 'Пекин', country: 'Китай', population: '21.5 млн' },
  { id: 5, label: 'Берлин', country: 'Германия', population: '3.6 млн' },
  { id: 6, label: 'Париж', country: 'Франция', population: '2.2 млн' },
  { id: 7, label: 'Лондон', country: 'Великобритания', population: '8.9 млн' },
  { id: 8, label: 'Рим', country: 'Италия', population: '2.9 млн' },
  { id: 9, label: 'Сан-Паулу', country: 'Бразилия', population: '12.3 млн' },
  { id: 10, label: 'Торонто', country: 'Канада', population: '2.9 млн' },
];

const users: AutoCompleteOption[] = [
  { id: 1, label: 'Иван Петров', email: 'ivan@example.com', role: 'Администратор' },
  { id: 2, label: 'Мария Сидорова', email: 'maria@example.com', role: 'Менеджер' },
  { id: 3, label: 'Алексей Иванов', email: 'alex@example.com', role: 'Пользователь' },
  { id: 4, label: 'Елена Смирнова', email: 'elena@example.com', role: 'Менеджер' },
  { id: 5, label: 'Дмитрий Козлов', email: 'dmitry@example.com', role: 'Администратор' },
];

// Имитация асинхронного поиска
const asyncSearch = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка для демонстрации
  return countries.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase())
  );
};

// Имитация асинхронного поиска городов
const asyncCitySearch = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Задержка для демонстрации
  return cities.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase())
  );
};

// Имитация асинхронного поиска пользователей
const asyncUserSearch = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Задержка для демонстрации
  return users.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase()) ||
    (option.email && option.email.toLowerCase().includes(query.toLowerCase()))
  );
};

export default {
  title: 'UI/AutoComplete',
  component: AutoComplete,
  parameters: {
    docs: {
      description: {
        component: 'Компонент автодополнения с поддержкой асинхронного поиска и кастомизации.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder для поля ввода',
    },
    label: {
      control: 'text',
      description: 'Label для поля ввода',
    },
    debounceMs: {
      control: 'number',
      description: 'Задержка перед поиском в мс',
    },
    minSearchLength: {
      control: 'number',
      description: 'Минимальное количество символов для начала поиска',
    },
  },
} as Meta;

// Базовый пример
export const Default: Story<AutoCompleteProps> = (args) => {
  const [value, setValue] = useState<AutoCompleteOption | null>(null);

  return (
    <Box sx={{ width: 300 }}>
      <AutoComplete
        {...args}
        value={value}
        onChange={setValue}
        placeholder="Выберите страну"
        label="Страна"
      />
      {value && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Выбрано: {value.label}
        </Typography>
      )}
    </Box>
  );
};
Default.args = {
  options: countries,
};

// Пример с асинхронным поиском
export const AsyncSearch: Story<AutoCompleteProps> = (args) => {
  const [value, setValue] = useState<AutoCompleteOption | null>(null);

  return (
    <Box sx={{ width: 300 }}>
      <AutoComplete
        {...args}
        value={value}
        onChange={setValue}
        onSearch={asyncSearch}
        placeholder="Начните вводить название страны"
        label="Поиск стран"
        debounceMs={500}
        minSearchLength={2}
      />
      {value && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Выбрано: {value.label} ({value.code})
        </Typography>
      )}
    </Box>
  );
};
AsyncSearch.args = {
  options: [],
};

// Пример с кастомными текстами
export const CustomTexts: Story<AutoCompleteProps> = (args) => (
  <AutoComplete
    {...args}
    placeholder="Поиск"
    label="Выбор страны"
    noOptionsText="Ничего не найдено"
    loadingText="Подождите..."
  />
);
CustomTexts.args = {
  options: countries,
};

// Пример с ошибкой
export const WithError: Story<AutoCompleteProps> = (args) => (
  <AutoComplete
    {...args}
    placeholder="Выберите страну"
    label="Страна"
    TextFieldProps={{
      error: true,
      helperText: 'Обязательное поле',
    }}
  />
);
WithError.args = {
  options: countries,
};

// Пример с кастомным рендерингом опций
export const CustomOptionRendering = () => {
  const [value, setValue] = useState<AutoCompleteOption | null>(null);

  return (
    <Box sx={{ width: 300 }}>
      <AutoComplete
        options={countries}
        value={value}
        onChange={setValue}
        placeholder="Выберите страну"
        label="Страна"
        AutocompleteProps={{
          renderOption: (props, option) => (
            <li {...props} key={option.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <FlagIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.code} • {option.population}
                  </Typography>
                </Box>
              </Box>
            </li>
          ),
        }}
      />
    </Box>
  );
};

// Пример с каскадным выбором
export const CascadingSelection = () => {
  const [country, setCountry] = useState<AutoCompleteOption | null>(null);
  const [city, setCity] = useState<AutoCompleteOption | null>(null);
  const [filteredCities, setFilteredCities] = useState<AutoCompleteOption[]>([]);
  
  // Фильтрация городов при выборе страны
  useEffect(() => {
    if (country) {
      const filtered = cities.filter(city => city.country === country.label);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
    setCity(null);
  }, [country]);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, width: 400 }}>
      <Typography variant="h6" gutterBottom>
        Выбор местоположения
      </Typography>
      
      <Stack spacing={3}>
        <AutoComplete
          options={countries}
          value={country}
          onChange={setCountry}
          placeholder="Выберите страну"
          label="Страна"
          AutocompleteProps={{
            renderOption: (props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlagIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">{option.label}</Typography>
                </Box>
              </li>
            ),
          }}
        />
        
        <AutoComplete
          options={filteredCities}
          value={city}
          onChange={setCity}
          placeholder={country ? "Выберите город" : "Сначала выберите страну"}
          label="Город"
          TextFieldProps={{
            disabled: !country
          }}
          AutocompleteProps={{
            disabled: !country,
            renderOption: (props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="body1">{option.label}</Typography>
                </Box>
              </li>
            ),
          }}
        />
        
        {country && city && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Страна:</strong> {country.label} ({country.code})
            </Typography>
            <Typography variant="body2">
              <strong>Город:</strong> {city.label} (Население: {city.population})
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

// Пример с множественным выбором пользователей
export const MultipleSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState<AutoCompleteOption[]>([]);
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, width: 500 }}>
      <Typography variant="h6" gutterBottom>
        Выбор пользователей
      </Typography>
      
      <AutoComplete
        options={users}
        value={null}
        onChange={(newValue) => {
          if (newValue && !selectedUsers.some(user => user.id === newValue.id)) {
            setSelectedUsers([...selectedUsers, newValue]);
          }
        }}
        placeholder="Найти пользователя"
        label="Пользователи"
        onSearch={asyncUserSearch}
        debounceMs={300}
        minSearchLength={2}
        AutocompleteProps={{
          renderOption: (props, option) => (
            <li {...props} key={option.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email} • {option.role}
                  </Typography>
                </Box>
              </Box>
            </li>
          ),
        }}
      />
      
      {selectedUsers.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Выбранные пользователи ({selectedUsers.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user.id}
                label={user.label}
                onDelete={() => {
                  setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                }}
                avatar={<Avatar><PersonIcon /></Avatar>}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}; 