import React from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Filter } from '../../../../components/ui/Filter';

const FilterSection = () => {
  const handleApply = () => {
    console.log('Применить фильтры');
  };

  const handleReset = () => {
    console.log('Сбросить фильтры');
  };

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Фильтры (Filter)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовый фильтр
          </Typography>
          <Filter
            title="Фильтры поиска"
            onApply={handleApply}
            onReset={handleReset}
          >
            <TextField
              label="Поиск по названию"
              placeholder="Введите текст для поиска"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                label="Категория"
                defaultValue="all"
              >
                <MenuItem value="all">Все категории</MenuItem>
                <MenuItem value="electronics">Электроника</MenuItem>
                <MenuItem value="clothes">Одежда</MenuItem>
                <MenuItem value="food">Продукты</MenuItem>
              </Select>
            </FormControl>
          </Filter>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Развернутый по умолчанию
          </Typography>
          <Filter
            title="Расширенные фильтры"
            defaultExpanded
            onApply={handleApply}
            onReset={handleReset}
          >
            <TextField
              label="Цена от"
              type="number"
              fullWidth
            />
            <TextField
              label="Цена до"
              type="number"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Сортировка</InputLabel>
              <Select
                label="Сортировка"
                defaultValue="price_asc"
              >
                <MenuItem value="price_asc">Цена по возрастанию</MenuItem>
                <MenuItem value="price_desc">Цена по убыванию</MenuItem>
                <MenuItem value="name_asc">По названию А-Я</MenuItem>
                <MenuItem value="name_desc">По названию Я-А</MenuItem>
              </Select>
            </FormControl>
          </Filter>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Отключенный фильтр
          </Typography>
          <Filter
            title="Недоступные фильтры"
            disabled
            onApply={handleApply}
            onReset={handleReset}
          >
            <TextField
              label="Поиск"
              disabled
              fullWidth
            />
            <FormControl fullWidth disabled>
              <InputLabel>Статус</InputLabel>
              <Select
                label="Статус"
                value="active"
              >
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="inactive">Неактивные</MenuItem>
              </Select>
            </FormControl>
          </Filter>
        </Box>
      </Box>
    </Box>
  );
};

export default FilterSection; 