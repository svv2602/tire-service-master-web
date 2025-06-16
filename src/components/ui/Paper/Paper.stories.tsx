import React from 'react';
import { Story, Meta } from '@storybook/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from './Paper';
import { PaperProps } from './types';

export default {
  title: 'UI/Paper',
  component: Paper,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Paper - базовый компонент для создания поверхностей с тенью или границами, используется для визуального выделения контента.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
      description: 'Вариант отображения компонента',
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Уровень тени (0-24)',
    },
    rounded: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large', 'full'],
      description: 'Закругление углов',
    },
    disablePadding: {
      control: 'boolean',
      description: 'Отключить отступы',
    },
  },
} as Meta;

const Template: Story<PaperProps> = (args) => (
  <Paper {...args}>
    <Typography variant="h6" gutterBottom>
      Заголовок
    </Typography>
    <Typography>
      Это пример контента внутри компонента Paper. Paper используется для создания
      поверхностей с тенью, которые визуально "приподнимают" контент над фоном.
    </Typography>
  </Paper>
);

export const Default = Template.bind({});
Default.args = {};

export const Elevated = Template.bind({});
Elevated.args = {
  variant: 'elevated',
  elevation: 4,
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
};

export const Flat = Template.bind({});
Flat.args = {
  variant: 'flat',
};

export const RoundedLarge = Template.bind({});
RoundedLarge.args = {
  rounded: 'large',
  elevation: 2,
};

export const NoPadding = Template.bind({});
NoPadding.args = {
  disablePadding: true,
};

// Дополнительные примеры

// Пример с различными вариантами закругления
export const RoundingVariants = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Paper rounded="none" elevation={2}>
        <Typography variant="subtitle1" gutterBottom>Без скругления</Typography>
        <Typography variant="body2">rounded="none"</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper rounded="small" elevation={2}>
        <Typography variant="subtitle1" gutterBottom>Малое скругление</Typography>
        <Typography variant="body2">rounded="small"</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper rounded="medium" elevation={2}>
        <Typography variant="subtitle1" gutterBottom>Среднее скругление</Typography>
        <Typography variant="body2">rounded="medium"</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper rounded="large" elevation={2}>
        <Typography variant="subtitle1" gutterBottom>Большое скругление</Typography>
        <Typography variant="body2">rounded="large"</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper rounded="full" elevation={2}>
        <Typography variant="subtitle1" gutterBottom>Полное скругление</Typography>
        <Typography variant="body2">rounded="full"</Typography>
      </Paper>
    </Grid>
  </Grid>
);

// Пример с различными уровнями тени
export const ElevationLevels = () => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
    {[0, 1, 2, 4, 8, 16, 24].map((elevation) => (
      <Paper key={elevation} elevation={elevation} sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="subtitle2">
          elevation={elevation}
        </Typography>
      </Paper>
    ))}
  </Box>
);

// Пример с вложенными Paper
export const NestedPapers = () => (
  <Paper variant="outlined" sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>Внешний Paper (outlined)</Typography>
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Вложенный Paper (elevation=1)</Typography>
      <Paper variant="flat" sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2">Глубоко вложенный Paper (flat)</Typography>
      </Paper>
    </Paper>
    <Typography variant="body2">
      Paper компоненты можно вкладывать друг в друга для создания сложных макетов с разными уровнями глубины.
    </Typography>
  </Paper>
);

// Пример с различными вариантами использования
export const UsageExamples = () => (
  <Stack spacing={3}>
    <Paper variant="elevated" elevation={1}>
      <Typography variant="h6" gutterBottom>Карточка товара</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 80, height: 80, bgcolor: 'primary.light', borderRadius: 1 }} />
        <Box>
          <Typography variant="subtitle1">Название товара</Typography>
          <Typography variant="body2" color="text.secondary">Краткое описание товара</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>1 500 ₽</Typography>
        </Box>
      </Box>
    </Paper>
    
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Блок с информацией</Typography>
      <Typography variant="body2" paragraph>
        Paper с вариантом "outlined" хорошо подходит для информационных блоков,
        где не требуется сильное визуальное выделение, но нужно обозначить границы контента.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="text.secondary">
          Последнее обновление: 10.07.2023
        </Typography>
      </Box>
    </Paper>
    
    <Paper variant="flat" sx={{ bgcolor: 'background.default', p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Примечание</Typography>
      <Typography variant="body2">
        Вариант "flat" без тени полезен для создания визуальных секций без лишнего акцента.
        Здесь мы используем цвет фона для легкого выделения.
      </Typography>
    </Paper>
  </Stack>
); 