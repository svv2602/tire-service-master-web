import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Paper,
  Stack,
} from '@mui/material';
import {
  Face as FaceIcon,
  Done as DoneIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const sectionStyle = {
  p: 3,
  mb: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const chipGroupStyle = {
  '& > *': { mr: 1, mb: 1 }
};

export const ChipSection: React.FC = () => {
  const handleDelete = () => {
    console.log('Удалено');
  };

  const handleClick = () => {
    console.log('Нажато');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Chips
      </Typography>

      <Paper sx={sectionStyle}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          Примеры чипов
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Базовые чипы
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap 
              sx={chipGroupStyle}
            >
              <Chip label="Базовый" />
              <Chip label="Кликабельный" onClick={handleClick} />
              <Chip label="С удалением" onDelete={handleDelete} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Цветные чипы
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap 
              sx={chipGroupStyle}
            >
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Success" color="success" />
              <Chip label="Error" color="error" />
              <Chip label="Info" color="info" />
              <Chip label="Warning" color="warning" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Варианты чипов
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap 
              sx={chipGroupStyle}
            >
              <Chip label="Outlined" variant="outlined" />
              <Chip label="Filled" variant="filled" />
              <Chip
                label="Clickable"
                variant="outlined"
                onClick={handleClick}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              С иконками и аватарами
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap 
              sx={chipGroupStyle}
            >
              <Chip
                icon={<FaceIcon />}
                label="С иконкой"
              />
              <Chip
                avatar={<Avatar>M</Avatar>}
                label="С аватаром"
              />
              <Chip
                avatar={<Avatar alt="Natacha" src="https://source.unsplash.com/random/40x40/?face" />}
                label="С фото"
                variant="outlined"
              />
              <Chip
                icon={<DoneIcon />}
                label="Готово"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<DeleteIcon />}
                label="Удалить"
                color="error"
                variant="outlined"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Размеры и состояния
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap 
              sx={chipGroupStyle}
            >
              <Chip
                label="Маленький"
                size="small"
              />
              <Chip
                label="По умолчанию"
              />
              <Chip
                label="Отключен"
                disabled
              />
              <Chip
                label="Кликабельный отключен"
                onClick={handleClick}
                disabled
              />
              <Chip
                label="С удалением отключен"
                onDelete={handleDelete}
                disabled
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ChipSection; 