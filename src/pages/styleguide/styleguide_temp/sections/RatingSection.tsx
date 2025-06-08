import React, { useState } from 'react';
import { Box, Typography, Grid, Rating } from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

export const RatingSection: React.FC = () => {
  const [value1, setValue1] = useState<number | null>(2.5);
  const [value2, setValue2] = useState<number | null>(3);
  const [value3, setValue3] = useState<number | null>(4);
  const [hover, setHover] = useState(-1);

  const labels: { [index: string]: string } = {
    0.5: 'Ужасно',
    1: 'Очень плохо',
    1.5: 'Плохо',
    2: 'Так себе',
    2.5: 'Нормально',
    3: 'Хорошо',
    3.5: 'Очень хорошо',
    4: 'Отлично',
    4.5: 'Превосходно',
    5: 'Великолепно',
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Rating
      </Typography>

      <Grid container spacing={4}>
        {/* Базовый рейтинг */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовый рейтинг
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating
              name="simple-rating"
              value={value1}
              precision={0.5}
              onChange={(_, newValue) => setValue1(newValue)}
            />
            <Box sx={{ ml: 2 }}>{value1 !== null && labels[value1]}</Box>
          </Box>
        </Grid>

        {/* Кастомные иконки */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Кастомные иконки
          </Typography>
          <Rating
            name="customized-rating"
            value={value2}
            onChange={(_, newValue) => setValue2(newValue)}
            icon={<FavoriteIcon fontSize="inherit" color="error" />}
            emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
          />
        </Grid>

        {/* Рейтинг с подсказками */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Рейтинг с подсказками
          </Typography>
          <Rating
            name="hover-feedback"
            value={value3}
            precision={0.5}
            onChange={(_, newValue) => setValue3(newValue)}
            onChangeActive={(_, newHover) => setHover(newHover)}
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
          />
          {value3 !== null && (
            <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value3]}</Box>
          )}
        </Grid>

        {/* Размеры рейтинга */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Размеры рейтинга
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Rating name="size-small" defaultValue={2} size="small" />
            <Rating name="size-medium" defaultValue={2} />
            <Rating name="size-large" defaultValue={2} size="large" />
          </Box>
        </Grid>

        {/* Только для чтения и отключенный */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Только для чтения и отключенный
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Rating name="read-only" value={4} readOnly />
            <Rating name="disabled" value={4} disabled />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RatingSection;