import React, { useState } from 'react';
import { Typography, Grid } from '@mui/material';
import Rating from '../../../../components/ui/Rating';
import { Card } from '../../../../components/ui/Card';

/**
 * Секция StyleGuide для демонстрации компонента Rating
 */
export const RatingSection: React.FC = () => {
  const [value1, setValue1] = useState<number | null>(3);
  const [value2, setValue2] = useState<number | null>(3.5);
  const [value3, setValue3] = useState<number | null>(null);

  return (
    <Card>
      <Typography variant="h4" gutterBottom>
        Rating
      </Typography>
      <Typography variant="body1" paragraph>
        Компонент для оценки с помощью звездочного рейтинга. Поддерживает различные размеры,
        половинные значения и состояния (только для чтения, отключено, ошибка).
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Базовый рейтинг
          </Typography>
          <Rating
            value={value1}
            onChange={setValue1}
            label="Оценка"
            helperText="Выберите оценку от 1 до 5"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Половинные значения
          </Typography>
          <Rating
            value={value2}
            onChange={setValue2}
            precision={0.5}
            label="Точная оценка"
            helperText="Можно выбрать половинные значения"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Только для чтения
          </Typography>
          <Rating
            value={4}
            readOnly
            label="Средняя оценка"
            helperText="Этот рейтинг нельзя изменить"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            С ошибкой
          </Typography>
          <Rating
            value={value3}
            onChange={setValue3}
            error
            label="Обязательная оценка"
            helperText="Это поле обязательно для заполнения"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Размеры
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Rating size="small" value={3} label="Маленький размер" />
            </Grid>
            <Grid item xs={12}>
              <Rating size="medium" value={3} label="Средний размер" />
            </Grid>
            <Grid item xs={12}>
              <Rating size="large" value={3} label="Большой размер" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};

export default RatingSection; 