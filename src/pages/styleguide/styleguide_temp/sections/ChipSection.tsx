import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Face as FaceIcon,
  Done as DoneIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

export const ChipSection: React.FC = () => {
  const [chips, setChips] = useState([
    { key: 0, label: 'React' },
    { key: 1, label: 'TypeScript' },
    { key: 2, label: 'Material-UI' },
    { key: 3, label: 'Node.js' },
  ]);

  const handleDelete = (chipToDelete: { key: number; label: string }) => () => {
    setChips((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Chip
      </Typography>

      <Grid container spacing={4}>
        {/* Базовые чипы */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовые чипы
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label="По умолчанию" />
            <Chip label="Кликабельный" clickable />
            <Chip label="Удаляемый" onDelete={() => {}} />
            <Chip label="Отключенный" disabled />
          </Stack>
        </Grid>

        {/* Чипы с иконками */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Чипы с иконками
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip icon={<FaceIcon />} label="С иконкой" />
            <Chip icon={<HomeIcon />} label="Главная" clickable />
            <Chip
              avatar={<Avatar>M</Avatar>}
              label="С аватаром"
              onDelete={() => {}}
            />
            <Chip
              icon={<StarIcon />}
              label="Избранное"
              deleteIcon={<FavoriteIcon />}
              onDelete={() => {}}
              color="primary"
            />
          </Stack>
        </Grid>

        {/* Цветные чипы */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Цветные чипы
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
            <Chip label="Error" color="error" />
            <Chip label="Warning" color="warning" />
            <Chip label="Info" color="info" />
            <Chip label="Success" color="success" />
          </Stack>
        </Grid>

        {/* Варианты чипов */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Варианты чипов
          </Typography>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Typography variant="caption">Filled:</Typography>
              <Chip label="Primary" color="primary" variant="filled" />
              <Chip label="Secondary" color="secondary" variant="filled" />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Typography variant="caption">Outlined:</Typography>
              <Chip label="Primary" color="primary" variant="outlined" />
              <Chip label="Secondary" color="secondary" variant="outlined" />
            </Stack>
          </Stack>
        </Grid>

        {/* Размеры чипов */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Размеры чипов
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
            <Chip label="Маленький" size="small" />
            <Chip label="Средний" />
            <Chip label="С иконкой" icon={<DoneIcon />} size="small" />
            <Chip label="С иконкой" icon={<DoneIcon />} />
          </Stack>
        </Grid>

        {/* Интерактивные чипы */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Интерактивные чипы
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {chips.map((data) => (
              <Chip
                key={data.key}
                label={data.label}
                onDelete={handleDelete(data)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChipSection; 