import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const fieldGroupStyle = {
  '& > *': { mb: 3, width: '100%' }
};

export const TextFieldSection: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Text Fields
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовые поля
          </Typography>
          <Box sx={fieldGroupStyle}>
            <TextField
              label="Стандартное"
              variant="outlined"
              size="small"
            />
            <TextField
              label="Заполненное"
              variant="filled"
              size="small"
            />
            <TextField
              label="Стандартное"
              variant="standard"
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С подсказками
          </Typography>
          <Box sx={fieldGroupStyle}>
            <TextField
              label="С подсказкой"
              helperText="Вспомогательный текст"
              variant="outlined"
              size="small"
            />
            <TextField
              error
              label="Ошибка"
              helperText="Текст ошибки"
              variant="outlined"
              size="small"
            />
            <TextField
              disabled
              label="Отключено"
              helperText="Недоступно для ввода"
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Размеры полей
          </Typography>
          <Box sx={fieldGroupStyle}>
            <TextField
              label="Маленькое"
              size="small"
              variant="outlined"
            />
            <TextField
              label="Стандартное"
              variant="outlined"
            />
            <TextField
              label="Многострочное"
              multiline
              rows={4}
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С иконками
          </Typography>
          <Box sx={fieldGroupStyle}>
            <TextField
              label="Поиск"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Имя пользователя"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Состояния полей
          </Typography>
          <Box sx={fieldGroupStyle}>
            <TextField
              label="Только для чтения"
              defaultValue="Нельзя изменить"
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              size="small"
            />
            <TextField
              label="С плейсхолдером"
              placeholder="Введите текст..."
              variant="outlined"
              size="small"
            />
            <TextField
              label="Обязательное"
              required
              variant="outlined"
              size="small"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TextFieldSection; 