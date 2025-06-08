import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Box, Paper } from '@mui/material';
import { Grid } from './Grid';
import { GridProps } from './types';

// Компонент для демонстрации
const DemoItem = ({ children }: { children: React.ReactNode }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      color: 'text.secondary',
      height: '100%',
    }}
  >
    {children}
  </Paper>
);

export default {
  title: 'UI/Grid',
  component: Grid,
} as Meta;

// Базовая сетка
export const Basic: Story<GridProps> = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6} md={4}>
      <DemoItem>xs=12 sm=6 md=4</DemoItem>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <DemoItem>xs=12 sm=6 md=4</DemoItem>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <DemoItem>xs=12 sm=6 md=4</DemoItem>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <DemoItem>xs=12 sm=6 md=4</DemoItem>
    </Grid>
  </Grid>
);

// Адаптивные отступы
export const ResponsiveSpacing: Story<GridProps> = () => (
  <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
    {[0, 1, 2].map((value) => (
      <Grid item xs={4} key={value}>
        <DemoItem>Элемент {value + 1}</DemoItem>
      </Grid>
    ))}
  </Grid>
);

// Выравнивание
export const Alignment: Story<GridProps> = () => (
  <Box sx={{ height: '300px' }}>
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={4}>
        <DemoItem>По центру</DemoItem>
      </Grid>
      <Grid item xs={4}>
        <DemoItem>По центру</DemoItem>
      </Grid>
      <Grid item xs={4}>
        <DemoItem>По центру</DemoItem>
      </Grid>
    </Grid>
  </Box>
);

// Направление
export const Direction: Story<GridProps> = () => (
  <Grid container spacing={2} direction="column" alignItems="stretch">
    <Grid item xs={12}>
      <DemoItem>Первый</DemoItem>
    </Grid>
    <Grid item xs={12}>
      <DemoItem>Второй</DemoItem>
    </Grid>
    <Grid item xs={12}>
      <DemoItem>Третий</DemoItem>
    </Grid>
  </Grid>
);

// Вложенные сетки
export const Nested: Story<GridProps> = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <DemoItem>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DemoItem>Вложенный 1</DemoItem>
          </Grid>
          <Grid item xs={6}>
            <DemoItem>Вложенный 2</DemoItem>
          </Grid>
        </Grid>
      </DemoItem>
    </Grid>
    <Grid item xs={12} sm={6}>
      <DemoItem>Основной</DemoItem>
    </Grid>
  </Grid>
);