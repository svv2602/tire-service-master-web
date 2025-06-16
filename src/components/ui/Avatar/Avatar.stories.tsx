import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Avatar, AvatarProps } from './Avatar';
import { Box, Grid, Stack, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';

export default {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Avatar - отображает аватар пользователя или иконку.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Размер аватара',
    },
    variant: {
      control: 'select',
      options: ['circular', 'rounded', 'square'],
      description: 'Вариант отображения',
    },
    src: {
      control: 'text',
      description: 'URL изображения',
    },
    alt: {
      control: 'text',
      description: 'Альтернативный текст',
    },
  },
} as Meta;

// Базовый шаблон
const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  children: 'ИП',
};

export const WithImage = Template.bind({});
WithImage.args = {
  src: 'https://i.pravatar.cc/300',
  alt: 'Аватар пользователя',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: <PersonIcon />,
};

// Размеры
export const Sizes = () => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Avatar size="small">S</Avatar>
    <Avatar size="medium">M</Avatar>
    <Avatar size="large">L</Avatar>
    <Avatar size={64}>64</Avatar>
  </Stack>
);

// Варианты отображения
export const Variants = () => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Avatar variant="circular">ИП</Avatar>
    <Avatar variant="rounded">ИП</Avatar>
    <Avatar variant="square">ИП</Avatar>
  </Stack>
);

// Цвета
export const Colors = () => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Avatar sx={{ bgcolor: 'primary.main' }}>ИП</Avatar>
    <Avatar sx={{ bgcolor: 'secondary.main' }}>ИП</Avatar>
    <Avatar sx={{ bgcolor: 'error.main' }}>ИП</Avatar>
    <Avatar sx={{ bgcolor: 'warning.main' }}>ИП</Avatar>
    <Avatar sx={{ bgcolor: 'info.main' }}>ИП</Avatar>
    <Avatar sx={{ bgcolor: 'success.main' }}>ИП</Avatar>
  </Stack>
);

// С разными иконками
export const WithIcons = () => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Avatar>
      <PersonIcon />
    </Avatar>
    <Avatar sx={{ bgcolor: 'secondary.main' }}>
      <FaceIcon />
    </Avatar>
    <Avatar sx={{ bgcolor: 'error.main' }}>
      <AssignmentIndIcon />
    </Avatar>
    <Avatar sx={{ bgcolor: 'info.main' }}>
      <GroupIcon />
    </Avatar>
    <Avatar sx={{ bgcolor: 'success.main' }}>
      <WorkIcon />
    </Avatar>
  </Stack>
);

// Сетка аватаров
export const AvatarGrid = () => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      Сетка аватаров с разными размерами и вариантами
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar size="large" src="https://i.pravatar.cc/300?img=1" />
          <Typography variant="body2">Иван Петров</Typography>
          <Typography variant="caption" color="text.secondary">Директор</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar size="large" src="https://i.pravatar.cc/300?img=2" />
          <Typography variant="body2">Мария Иванова</Typography>
          <Typography variant="caption" color="text.secondary">Менеджер</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar size="large" src="https://i.pravatar.cc/300?img=3" />
          <Typography variant="body2">Алексей Смирнов</Typography>
          <Typography variant="caption" color="text.secondary">Разработчик</Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

// Группа аватаров
export const AvatarGroup = () => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      Группа аватаров
    </Typography>
    <Stack direction="row" spacing={-1}>
      <Avatar sx={{ border: '2px solid white' }} src="https://i.pravatar.cc/300?img=4" />
      <Avatar sx={{ border: '2px solid white' }} src="https://i.pravatar.cc/300?img=5" />
      <Avatar sx={{ border: '2px solid white' }} src="https://i.pravatar.cc/300?img=6" />
      <Avatar sx={{ border: '2px solid white', bgcolor: 'primary.main' }}>+2</Avatar>
    </Stack>
  </Box>
);

// Практические примеры использования
export const Examples = () => (
  <Stack spacing={4}>
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar size="large" src="https://i.pravatar.cc/300?img=7" />
        <Box>
          <Typography variant="subtitle1">Дмитрий Козлов</Typography>
          <Typography variant="body2" color="text.secondary">
            Онлайн
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1">
        Привет! Как продвигается работа над проектом?
      </Typography>
    </Box>

    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Команда проекта
      </Typography>
      <Stack spacing={1}>
        {[
          { name: 'Анна Соколова', role: 'Дизайнер', img: 8 },
          { name: 'Сергей Новиков', role: 'Разработчик', img: 9 },
          { name: 'Елена Морозова', role: 'Менеджер', img: 10 },
        ].map((user, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar size="medium" src={`https://i.pravatar.cc/300?img=${user.img}`} />
            <Box>
              <Typography variant="body1">{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  </Stack>
); 