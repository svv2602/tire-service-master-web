import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Stack, StackProps } from './Stack';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Divider, 
  Card, 
  CardContent,
  TextField,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default {
  title: 'UI/Stack',
  component: Stack,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Stack - контейнер для вертикального или горизонтального расположения элементов.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Направление стека',
    },
    spacing: {
      control: 'number',
      description: 'Расстояние между элементами',
    },
    justifyContent: {
      control: 'select',
      options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Выравнивание по горизонтали',
    },
    alignItems: {
      control: 'select',
      options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      description: 'Выравнивание по вертикали',
    },
    flexWrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Перенос элементов',
    },
  },
} as Meta;

// Создаем цветной блок для примеров
const ColorBox = ({ color, label }: { color: string; label: string }) => (
  <Box
    sx={{
      width: 80,
      height: 80,
      bgcolor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      borderRadius: 1,
    }}
  >
    {label}
  </Box>
);

// Базовый шаблон
const Template: Story<StackProps> = (args) => (
  <Stack {...args}>
    <ColorBox color="primary.main" label="Item 1" />
    <ColorBox color="secondary.main" label="Item 2" />
    <ColorBox color="error.main" label="Item 3" />
    <ColorBox color="warning.main" label="Item 4" />
    <ColorBox color="info.main" label="Item 5" />
  </Stack>
);

// Горизонтальный стек
export const RowStack = Template.bind({});
RowStack.args = {
  direction: 'row',
  spacing: 2,
};

// Вертикальный стек
export const ColumnStack = Template.bind({});
ColumnStack.args = {
  direction: 'column',
  spacing: 2,
};

// Стек с разным выравниванием по горизонтали
export const JustifyContent = () => (
  <Stack spacing={4}>
    {['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(
      (justify) => (
        <Box key={justify}>
          <Typography variant="subtitle2" gutterBottom>
            justifyContent: {justify}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={justify as any}
              sx={{ width: '100%' }}
            >
              <ColorBox color="primary.main" label="1" />
              <ColorBox color="secondary.main" label="2" />
              <ColorBox color="error.main" label="3" />
            </Stack>
          </Paper>
        </Box>
      )
    )}
  </Stack>
);

// Стек с разным выравниванием по вертикали
export const AlignItems = () => (
  <Stack spacing={4}>
    {['flex-start', 'center', 'flex-end', 'stretch', 'baseline'].map((align) => (
      <Box key={align}>
        <Typography variant="subtitle2" gutterBottom>
          alignItems: {align}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, height: 120 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems={align as any}
            sx={{ height: '100%' }}
          >
            <ColorBox color="primary.main" label="1" />
            <Box
              sx={{
                width: 80,
                height: 60,
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                borderRadius: 1,
              }}
            >
              2
            </Box>
            <Box
              sx={{
                width: 80,
                height: 100,
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                borderRadius: 1,
              }}
            >
              3
            </Box>
          </Stack>
        </Paper>
      </Box>
    ))}
  </Stack>
);

// Стек с разделителем
export const WithDivider = () => (
  <Paper variant="outlined" sx={{ p: 2, width: 300 }}>
    <Stack
      spacing={2}
      divider={<Divider flexItem />}
    >
      <Typography variant="h6">Заголовок 1</Typography>
      <Typography variant="body2">
        Первый абзац текста с описанием элемента.
      </Typography>
      <Typography variant="h6">Заголовок 2</Typography>
      <Typography variant="body2">
        Второй абзац текста с описанием элемента.
      </Typography>
      <Typography variant="h6">Заголовок 3</Typography>
      <Typography variant="body2">
        Третий абзац текста с описанием элемента.
      </Typography>
    </Stack>
  </Paper>
);

// Стек с переносом элементов
export const Wrapping = () => (
  <Paper variant="outlined" sx={{ p: 2, width: 300 }}>
    <Typography variant="subtitle2" gutterBottom>
      flexWrap: wrap
    </Typography>
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ width: '100%' }}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <Chip 
          key={index} 
          label={`Элемент ${index + 1}`} 
          color={['primary', 'secondary', 'info', 'success', 'warning'][index % 5] as any}
          sx={{ mb: 1 }}
        />
      ))}
    </Stack>
  </Paper>
);

// Вложенные стеки
export const NestedStacks = () => (
  <Stack spacing={2}>
    <Typography variant="subtitle1" gutterBottom>
      Вложенные стеки
    </Typography>
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
    >
      <Stack spacing={1} sx={{ width: 200 }}>
        <Typography variant="subtitle2">Колонка 1</Typography>
        <Button variant="contained">Кнопка 1</Button>
        <Button variant="outlined">Кнопка 2</Button>
        <Button variant="text">Кнопка 3</Button>
      </Stack>
      
      <Divider orientation="vertical" flexItem />
      
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Typography variant="subtitle2">Колонка 2</Typography>
        <Stack direction="row" spacing={1}>
          <TextField label="Имя" size="small" />
          <TextField label="Фамилия" size="small" />
        </Stack>
        <TextField label="Email" size="small" />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button>Отмена</Button>
          <Button variant="contained">Отправить</Button>
        </Stack>
      </Stack>
    </Stack>
  </Stack>
);

// Практические примеры использования
export const Examples = () => (
  <Stack spacing={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Карточка пользователя
      </Typography>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>ИП</Avatar>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="h6">Иван Петров</Typography>
              <Typography variant="body2" color="text.secondary">
                Менеджер проекта
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ivan.petrov@example.com
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Paper>
    
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Форма входа
      </Typography>
      <Card sx={{ maxWidth: 400, mx: 'auto' }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h5" align="center">
              Вход в систему
            </Typography>
            <TextField label="Email" variant="outlined" />
            <TextField label="Пароль" type="password" variant="outlined" />
            <Button variant="contained" size="large">
              Войти
            </Button>
            <Stack direction="row" justifyContent="space-between">
              <Button variant="text" size="small">
                Забыли пароль?
              </Button>
              <Button variant="text" size="small">
                Регистрация
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Paper>
    
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Карточка продукта
      </Typography>
      <Card sx={{ maxWidth: 350 }}>
        <Box sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Изображение продукта
          </Typography>
        </Box>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Название продукта</Typography>
              <Typography variant="h6" color="primary.main">1 200 ₽</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Описание продукта с основными характеристиками и преимуществами.
              Здесь может быть размещена дополнительная информация о товаре.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="Категория 1" size="small" />
              <Chip label="Новинка" size="small" color="primary" />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <IconButton size="small">
                  <FavoriteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <ShareIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <BookmarkIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Button variant="contained" startIcon={<AddIcon />}>
                В корзину
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Paper>
  </Stack>
);