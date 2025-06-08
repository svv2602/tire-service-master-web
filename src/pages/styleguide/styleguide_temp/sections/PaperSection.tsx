import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Card } from '../../../../components/ui/Card';

export const PaperSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paper
      </Typography>

      <Card title="Примеры Paper">
        <Grid container spacing={4}>
          {/* Базовый Paper */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Базовый Paper</Typography>
            <Paper sx={{ p: 2 }}>
              <Typography>
                Это базовый пример компонента Paper. Paper может использоваться для создания
                поверхностей с тенью и фоном.
              </Typography>
            </Paper>
          </Grid>

          {/* Paper с разной глубиной тени */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Разные уровни тени</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography>Без тени (elevation=0)</Typography>
              </Paper>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography>Легкая тень (elevation=1)</Typography>
              </Paper>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography>Средняя тень (elevation=3)</Typography>
              </Paper>
              <Paper elevation={6} sx={{ p: 2 }}>
                <Typography>Заметная тень (elevation=6)</Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Paper с разными вариантами */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Варианты Paper</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>С границей (variant="outlined")</Typography>
              </Paper>
              <Paper variant="elevation" elevation={4} sx={{ p: 2 }}>
                <Typography>С тенью (variant="elevation")</Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Paper с разным фоном */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Разные цвета фона</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography>Основной цвет</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <Typography>Вторичный цвет</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography>Цвет ошибки</Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default PaperSection;