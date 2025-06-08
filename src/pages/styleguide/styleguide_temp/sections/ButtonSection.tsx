import React from 'react';
import { Box, Typography, Grid, Button, IconButton, Paper } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const sectionStyle = {
  p: 3,
  mb: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const buttonGroupStyle = {
  '& > button': { mr: 1, mb: 1 }
};

export const ButtonSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Buttons
      </Typography>

      <Paper sx={sectionStyle}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          Примеры кнопок
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Базовые кнопки
            </Typography>
            <Box sx={buttonGroupStyle}>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Цветные кнопки
            </Typography>
            <Box sx={buttonGroupStyle}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="contained" color="secondary">Secondary</Button>
              <Button variant="contained" color="error">Error</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Размеры кнопок
            </Typography>
            <Box sx={buttonGroupStyle}>
              <Button variant="contained" size="small">Small</Button>
              <Button variant="contained" size="medium">Medium</Button>
              <Button variant="contained" size="large">Large</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
      </Paper>
    </Box>
  );
};

export default ButtonSection; 