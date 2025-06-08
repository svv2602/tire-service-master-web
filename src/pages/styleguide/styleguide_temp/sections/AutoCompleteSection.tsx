import React, { useState } from 'react';
import { Typography, Grid } from '@mui/material';
import AutoComplete from '../../../../components/ui/AutoComplete';
import { Card } from '../../../../components/ui/Card';
import { AutoCompleteOption } from '../../../../components/ui/AutoComplete/types';

// Моковые данные
const countries: AutoCompleteOption[] = [
  { id: 1, label: 'Россия' },
  { id: 2, label: 'США' },
  { id: 3, label: 'Китай' },
  { id: 4, label: 'Япония' },
  { id: 5, label: 'Германия' },
];

// Имитация асинхронного поиска
const asyncSearch = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return countries.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Секция StyleGuide для демонстрации компонента AutoComplete
 */
export const AutoCompleteSection: React.FC = () => {
  const [value, setValue] = useState<AutoCompleteOption | null>(null);

  return (
    <Card>
      <Typography variant="h4" gutterBottom>
        AutoComplete
      </Typography>
      <Typography variant="body1" paragraph>
        Компонент для выбора значения из списка с поддержкой автодополнения и асинхронного поиска.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Базовый вариант
          </Typography>
          <AutoComplete
            options={countries}
            placeholder="Выберите страну"
            label="Страна"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Асинхронный поиск
          </Typography>
          <AutoComplete
            options={[]}
            value={value}
            onChange={setValue}
            onSearch={asyncSearch}
            placeholder="Начните вводить название страны"
            label="Поиск стран"
            debounceMs={500}
            minSearchLength={2}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Кастомные тексты
          </Typography>
          <AutoComplete
            options={countries}
            placeholder="Поиск"
            label="Выбор страны"
            noOptionsText="Ничего не найдено"
            loadingText="Подождите..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            С ошибкой
          </Typography>
          <AutoComplete
            options={countries}
            placeholder="Выберите страну"
            label="Страна"
            TextFieldProps={{
              error: true,
              helperText: 'Обязательное поле',
            }}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default AutoCompleteSection; 