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
import { Card } from '../../../../components/ui/Card';

// Данные для примеров
const topFilms = [
  { title: 'Побег из Шоушенка', year: 1994 },
  { title: 'Крёстный отец', year: 1972 },
  { title: 'Тёмный рыцарь', year: 2008 },
  { title: 'Криминальное чтиво', year: 1994 },
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
  const [selectedFilm, setSelectedFilm] = useState<{ title: string; year: number } | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<typeof brands[0][]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        AutoComplete
      </Typography>

      <Card title="Примеры автодополнения">
        <Grid container spacing={4}>
          {/* Базовый AutoComplete */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Базовый AutoComplete</Typography>
            <Autocomplete
              options={topFilms}
              value={selectedFilm}
              onChange={(_, newValue) => setSelectedFilm(newValue)}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите фильм"
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* AutoComplete с множественным выбором */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Множественный выбор с чипами</Typography>
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
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />
          </Grid>

          {/* AutoComplete с кастомным рендерингом */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Кастомный рендеринг опций</Typography>
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
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                  <Avatar src={option.logo} sx={{ width: 24, height: 24, mr: 2 }} />
                  {option.name}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    {option.country}
                  </Typography>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    avatar={<Avatar src={option.logo} />}
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          {/* AutoComplete с свободным вводом */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Свободный ввод</Typography>
            <Autocomplete
              freeSolo
              options={topFilms.map((option) => option.title)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Поиск фильма"
                  variant="outlined"
                  helperText="Можно ввести свое значение"
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default AutoCompleteSection;