import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Skeleton, SkeletonProps } from './Skeleton';
import { 
  Box, 
  Typography, 
  Stack, 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  Button, 
  Avatar, 
  Grid, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Paper,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';

export default {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Skeleton - заполнитель для отображения во время загрузки контента.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rectangular', 'circular', 'rounded'],
      description: 'Вариант скелетона',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
      description: 'Анимация',
    },
    width: {
      control: 'text',
      description: 'Ширина',
    },
    height: {
      control: 'text',
      description: 'Высота',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<SkeletonProps> = (args) => <Skeleton {...args} />;

// Текстовый скелетон
export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  width: 200,
  height: 20,
};

// Прямоугольный скелетон
export const Rectangular = Template.bind({});
Rectangular.args = {
  variant: 'rectangular',
  width: 300,
  height: 150,
};

// Круглый скелетон
export const Circular = Template.bind({});
Circular.args = {
  variant: 'circular',
  width: 60,
  height: 60,
};

// Скругленный скелетон
export const Rounded = Template.bind({});
Rounded.args = {
  variant: 'rounded',
  width: 300,
  height: 150,
};

// Разные типы анимации
export const Animations = () => (
  <Stack spacing={3}>
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Pulse (по умолчанию)
      </Typography>
      <Skeleton variant="rectangular" width={300} height={60} animation="pulse" />
    </Box>
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Wave
      </Typography>
      <Skeleton variant="rectangular" width={300} height={60} animation="wave" />
    </Box>
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Без анимации
      </Typography>
      <Skeleton variant="rectangular" width={300} height={60} animation={false} />
    </Box>
  </Stack>
);

// Группа скелетонов для текста
export const TextGroup = () => (
  <Box sx={{ width: '100%', maxWidth: 500 }}>
    <Skeleton variant="text" height={40} width="80%" />
    <Skeleton variant="text" height={20} />
    <Skeleton variant="text" height={20} />
    <Skeleton variant="text" height={20} width="80%" />
  </Box>
);

// Скелетон карточки
export const CardSkeleton = () => (
  <Card sx={{ maxWidth: 345 }}>
    <CardHeader
      avatar={<Skeleton variant="circular" width={40} height={40} />}
      title={<Skeleton variant="text" height={20} width="80%" />}
      subheader={<Skeleton variant="text" height={16} width="40%" />}
    />
    <Skeleton variant="rectangular" height={190} />
    <CardContent>
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} width="80%" />
    </CardContent>
    <CardActions>
      <Skeleton variant="rounded" width={70} height={36} />
      <Skeleton variant="rounded" width={70} height={36} />
    </CardActions>
  </Card>
);

// Переключение между скелетоном и контентом
export const SkeletonToContent = () => {
  const [loading, setLoading] = useState(true);

  const handleChange = () => {
    setLoading(!loading);
  };

  return (
    <Box>
      <FormControlLabel
        control={<Switch checked={loading} onChange={handleChange} />}
        label="Загрузка"
        sx={{ mb: 2 }}
      />

      <Card sx={{ maxWidth: 345 }}>
        {loading ? (
          <>
            <CardHeader
              avatar={<Skeleton variant="circular" width={40} height={40} />}
              title={<Skeleton variant="text" height={20} width="80%" />}
              subheader={<Skeleton variant="text" height={16} width="40%" />}
            />
            <Skeleton variant="rectangular" height={190} />
            <CardContent>
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} width="80%" />
            </CardContent>
            <CardActions>
              <Skeleton variant="rounded" width={70} height={36} />
              <Skeleton variant="rounded" width={70} height={36} />
            </CardActions>
          </>
        ) : (
          <>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>ИП</Avatar>}
              title="Заголовок карточки"
              subheader="12 августа 2023"
            />
            <Box
              sx={{
                height: 190,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Изображение
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body1" paragraph>
                Это содержимое карточки с текстом, который отображается после загрузки.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Дополнительная информация о карточке.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Действие 1</Button>
              <Button size="small">Действие 2</Button>
            </CardActions>
          </>
        )}
      </Card>
    </Box>
  );
};

// Практические примеры использования
export const Examples = () => {
  const [loading, setLoading] = useState(true);

  const handleToggleLoading = () => {
    setLoading(!loading);
  };

  setTimeout(() => {
    if (loading) setLoading(false);
  }, 3000);

  return (
    <Stack spacing={4}>
      <Box>
        <FormControlLabel
          control={<Switch checked={loading} onChange={handleToggleLoading} />}
          label="Показать скелетоны"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {loading ? 'Загрузка данных...' : 'Данные загружены'}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Список пользователей
        </Typography>
        <List>
          {Array.from(new Array(3)).map((_, index) => (
            <ListItem key={index} alignItems="flex-start">
              {loading ? (
                <>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton variant="text" width={120} height={20} />}
                    secondary={
                      <>
                        <Skeleton variant="text" width={240} height={16} />
                        <Skeleton variant="text" width={180} height={16} />
                      </>
                    }
                  />
                </>
              ) : (
                <>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${['primary', 'secondary', 'error'][index]}.main` }}>
                      {['ИП', 'МС', 'АК'][index]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={['Иван Петров', 'Мария Сидорова', 'Алексей Кузнецов'][index]}
                    secondary={[
                      'Менеджер проекта • Москва',
                      'Дизайнер • Санкт-Петербург',
                      'Разработчик • Казань',
                    ][index]}
                  />
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Карточки продуктов
        </Typography>
        <Grid container spacing={2}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                {loading ? (
                  <>
                    <Skeleton variant="rectangular" height={140} />
                    <CardContent>
                      <Skeleton variant="text" height={24} width="80%" />
                      <Skeleton variant="text" height={16} width="60%" />
                      <Box sx={{ mt: 2 }}>
                        <Skeleton variant="text" height={16} />
                        <Skeleton variant="text" height={16} />
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton variant="text" height={24} width="30%" />
                        <Skeleton variant="rounded" height={36} width="30%" />
                      </Box>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: ['primary.light', 'secondary.light', 'error.light'][index],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2" color="white">
                        Изображение продукта {index + 1}
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {['Продукт A', 'Продукт B', 'Продукт C'][index]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {['Категория 1', 'Категория 2', 'Категория 3'][index]}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Описание продукта с основными характеристиками и преимуществами.
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary.main">
                          {['1 200 ₽', '2 450 ₽', '3 700 ₽'][index]}
                        </Typography>
                        <Button variant="contained" size="small">
                          Купить
                        </Button>
                      </Box>
                    </CardContent>
                  </>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Статья
        </Typography>
        {loading ? (
          <>
            <Skeleton variant="text" height={32} width="60%" />
            <Skeleton variant="text" height={20} width="40%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" />
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" height={20} width="90%" />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="70%" />
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Заголовок статьи
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Автор: Иван Петров • 12 августа 2023
            </Typography>
            <Box
              sx={{
                height: 200,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Изображение статьи
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              Это первый абзац статьи с подробным описанием темы. Здесь может быть размещен
              основной текст статьи, который будет интересен читателям.
            </Typography>
            <Typography variant="body1" paragraph>
              Второй абзац продолжает раскрывать тему статьи и предоставляет дополнительную
              информацию по теме.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              Заключительный абзац подводит итоги и делает выводы по теме статьи.
              Здесь также могут быть размещены рекомендации или советы для читателей.
            </Typography>
          </>
        )}
      </Paper>
    </Stack>
  );
};