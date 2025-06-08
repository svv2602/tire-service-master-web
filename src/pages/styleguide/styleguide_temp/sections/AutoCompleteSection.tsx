import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Chip,
  Avatar,
} from '@mui/material';

interface Film {
  title: string;
  year: number;
}

const top100Films: Film[] = [
  { title: 'Побег из Шоушенка', year: 1994 },
  { title: 'Крестный отец', year: 1972 },
  { title: 'Темный рыцарь', year: 2008 },
  { title: 'Крестный отец 2', year: 1974 },
  { title: 'Список Шиндлера', year: 1993 },
  { title: 'Властелин колец: Возвращение короля', year: 2003 },
  { title: 'Криминальное чтиво', year: 1994 },
  { title: 'Хороший, плохой, злой', year: 1966 },
  { title: 'Бойцовский клуб', year: 1999 },
];

const brands = [
  { name: 'Michelin', country: 'Франция', logo: 'https://source.unsplash.com/random/40x40/?tire,michelin' },
  { name: 'Continental', country: 'Германия', logo: 'https://source.unsplash.com/random/40x40/?tire,continental' },
  { name: 'Bridgestone', country: 'Япония', logo: 'https://source.unsplash.com/random/40x40/?tire,bridgestone' },
  { name: 'Pirelli', country: 'Италия', logo: 'https://source.unsplash.com/random/40x40/?tire,pirelli' },
  { name: 'Goodyear', country: 'США', logo: 'https://source.unsplash.com/random/40x40/?tire,goodyear' },
];

const tireTypes = [
  'Летние',
  'Зимние',
  'Всесезонные',
  'Шипованные',
  'Спортивные',
  'Грузовые',
  'Внедорожные',
];

export const AutoCompleteSection: React.FC = () => {
  const [value1, setValue1] = useState<Film | null>(null);
  const [value2, setValue2] = useState<Film[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<typeof brands[0][]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        AutoComplete
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовое автодополнение
          </Typography>
          <Autocomplete
            value={value1}
            onChange={(_, newValue) => setValue1(newValue)}
            options={top100Films}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите фильм"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Множественный выбор
          </Typography>
          <Autocomplete
            multiple
            value={value2}
            onChange={(_, newValue) => setValue2(newValue)}
            options={top100Films}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите несколько фильмов"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С отслеживанием ввода
          </Typography>
          <Autocomplete
            value={value1}
            onChange={(_, newValue) => setValue1(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            options={top100Films}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Поиск фильма"
                variant="outlined"
                size="small"
                helperText={`Вы ввели: ${inputValue}`}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С группировкой по году
          </Typography>
          <Autocomplete
            options={top100Films.sort((a, b) => b.year - a.year)}
            groupBy={(option) => option.year.toString()}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Фильмы по годам"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Отключенное состояние
          </Typography>
          <Autocomplete
            disabled
            options={top100Films}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Отключено"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С произвольным вводом
          </Typography>
          <Autocomplete
            freeSolo
            options={tireTypes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Тип шин (можно добавить новый)"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С кастомными опциями
          </Typography>
          <Autocomplete
            multiple
            options={brands}
            getOptionLabel={(option) => option.name}
            value={selectedBrands}
            onChange={(_, newValue) => setSelectedBrands(newValue)}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar 
                  src={option.logo} 
                  sx={{ width: 24, height: 24, mr: 2 }} 
                />
                {option.name} ({option.country})
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите бренды шин"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С кастомными тегами
          </Typography>
          <Autocomplete
            multiple
            options={tireTypes}
            value={selectedTypes}
            onChange={(_, newValue) => setSelectedTypes(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите типы шин"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutoCompleteSection;