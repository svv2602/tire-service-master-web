import React from 'react';
import { Container, Typography, Box, Grid, useTheme } from '@mui/material';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { THEME_COLORS, SIZES, ANIMATIONS } from '../../../styles/theme';
import CardSection from './sections/CardSection';
import TableSection from './sections/TableSection';
import ModalSection from './sections/ModalSection';
import AlertSection from './sections/AlertSection';
import TabsSection from './sections/TabsSection';
import DropdownSection from './sections/DropdownSection';
import SkeletonSection from './sections/SkeletonSection';
import BadgeSection from './sections/BadgeSection';
import TooltipSection from './sections/TooltipSection';

const StyleGuide: React.FC = () => {
  const theme = useTheme();
  const colors = theme.palette.mode === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Style Guide
      </Typography>

      {/* Кнопки */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Кнопки
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="primary">Primary Button</Button>
          </Grid>
          <Grid item>
            <Button variant="secondary">Secondary Button</Button>
          </Grid>
          <Grid item>
            <Button variant="success">Success Button</Button>
          </Grid>
          <Grid item>
            <Button variant="error">Error Button</Button>
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button variant="primary" loading>Loading Button</Button>
          </Grid>
        </Grid>
      </Box>

      {/* Текстовые поля */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Текстовые поля
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Стандартное поле"
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

      {/* Скелетоны */}
      <SkeletonSection />

      {/* Бейджи */}
      <BadgeSection />

      {/* Тултипы */}
      <TooltipSection />

      {/* Уведомления */}
      <AlertSection />

      {/* Вкладки */}
      <TabsSection />

      {/* Выпадающие меню */}
      <DropdownSection />

      {/* Карточки */}
      <CardSection />

      {/* Таблицы */}
      <TableSection />

      {/* Модальные окна */}
      <ModalSection />

      {/* Цвета */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Цвета
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(colors).map(([name, color]) => (
            <Grid item key={name}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: color as string,
                  borderRadius: SIZES.borderRadius.sm,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="caption" align="center">
                  {name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Типография */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Типография
        </Typography>
        <Typography variant="h1" gutterBottom>H1 Заголовок</Typography>
        <Typography variant="h2" gutterBottom>H2 Заголовок</Typography>
        <Typography variant="h3" gutterBottom>H3 Заголовок</Typography>
        <Typography variant="h4" gutterBottom>H4 Заголовок</Typography>
        <Typography variant="h5" gutterBottom>H5 Заголовок</Typography>
        <Typography variant="h6" gutterBottom>H6 Заголовок</Typography>
        <Typography variant="body1" gutterBottom>
          Body 1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur unde suscipit.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Body 2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur unde suscipit.
        </Typography>
      </Box>

      {/* Анимации */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Анимации
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(ANIMATIONS.transition).map(([name, transition]) => (
            <Grid item key={name}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: colors.backgroundCard,
                  borderRadius: SIZES.borderRadius.sm,
                  transition: ANIMATIONS.transition.medium,
                  '&:hover': {
                    transform: 'scale(1.1)'
                  },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption">{name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default StyleGuide;