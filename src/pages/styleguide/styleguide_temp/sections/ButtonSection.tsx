import React from 'react';
import { Box, Typography, Grid, Button, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const buttonGroupStyle = {
  '& > button': { mr: 1, mb: 1 }
};

export const ButtonSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Buttons
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовые кнопки
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Цветные кнопки
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="error">Error</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Размеры кнопок
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="contained" size="small">Small</Button>
            <Button variant="contained" size="medium">Medium</Button>
            <Button variant="contained" size="large">Large</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Кнопки с иконками
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="contained" startIcon={<AddIcon />}>
              Добавить
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />}>
              Изменить
            </Button>
            <Button variant="text" startIcon={<DeleteIcon />}>
              Удалить
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Иконки-кнопки
          </Typography>
          <Box sx={{ '& > button': { mr: 1 } }}>
            <IconButton color="primary" aria-label="add">
              <AddIcon />
            </IconButton>
            <IconButton color="secondary" aria-label="edit">
              <EditIcon />
            </IconButton>
            <IconButton color="error" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Состояния кнопок
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="contained" disabled>
              Disabled
            </Button>
            <Button variant="contained" href="#" onClick={(e) => e.preventDefault()}>
              Link
            </Button>
            <Button variant="contained" color="primary" disableElevation>
              No Shadow
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ButtonSection; 