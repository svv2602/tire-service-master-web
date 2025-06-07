import React from 'react';
import { Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '../../../../components/ui/Button';

export const ButtonSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Кнопки
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Варианты кнопок
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="primary">Основная</Button>
          <Button variant="secondary">Дополнительная</Button>
          <Button variant="success">Успех</Button>
          <Button variant="error">Ошибка</Button>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Состояния кнопок
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="primary" disabled>
            Отключена
          </Button>
          <Button variant="primary" loading>
            Загрузка
          </Button>
          <Button variant="secondary" fullWidth>
            На всю ширину
          </Button>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Кнопки с иконками
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="error"
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
          <Button
            variant="success"
            endIcon={<AddIcon />}
          >
            Добавить
          </Button>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            endIcon={<DeleteIcon />}
          >
            Действия
          </Button>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Размеры кнопок
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Button variant="primary" size="small">
            Маленькая
          </Button>
          <Button variant="primary" size="medium">
            Средняя
          </Button>
          <Button variant="primary" size="large">
            Большая
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ButtonSection; 