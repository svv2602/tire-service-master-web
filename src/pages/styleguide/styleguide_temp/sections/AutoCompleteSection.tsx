import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';

const sectionStyle = {
  p: 3,
  mb: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const autoCompleteContainerStyle = {
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.default',
};

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
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        AutoComplete
      </Typography>

      <Paper sx={sectionStyle}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          Примеры автодополнения
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                С произвольным вводом
              </Typography>
              <Autocomplete
                freeSolo
                options={top100Films.map((option) => option.title)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Свободный ввод"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Множественный выбор с чипами
              </Typography>
              <Autocomplete
                multiple
                options={tireTypes}
                value={selectedTypes}
                onChange={(_, newValue) => setSelectedTypes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Выберите типы шин"
                    variant="outlined"
                    size="small"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={autoCompleteContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Кастомный рендеринг опций
              </Typography>
              <Autocomplete
                multiple
                options={brands}
                value={selectedBrands}
                onChange={(_, newValue) => setSelectedBrands(newValue)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Выберите производителей"
                    variant="outlined"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <Avatar src={option.logo} sx={{ width: 24, height: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.country}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AutoCompleteSection;