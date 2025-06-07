import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { TextField } from '../../../../components/ui/TextField';

export const TextFieldSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Текстовые поля
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Базовые поля
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Стандартное поле"
              placeholder="Введите текст"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Поле с ошибкой"
              error
              helperText="Текст ошибки"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Отключенное поле"
              disabled
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Поля с подсказками
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="С подсказкой"
              helperText="Вспомогательный текст"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Обязательное поле"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="С плейсхолдером"
              placeholder="Подсказка для ввода"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Размеры полей
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Маленькое поле"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Стандартное поле"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Многострочное поле"
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TextFieldSection; 