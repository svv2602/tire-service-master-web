import React from 'react';
import { Story, Meta } from '@storybook/react';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { List, ListItem, ListProps } from './index';
import { Avatar, Box, Divider, IconButton, Typography, Paper } from '@mui/material';

export default {
  title: 'UI/List',
  component: List,
  parameters: {
    docs: {
      description: {
        component: 'Компонент списка для отображения элементов в вертикальном формате.',
      },
    },
  },
} as Meta;

const Template: Story<ListProps> = (args) => (
  <List {...args}>
    <ListItem>Простой элемент списка</ListItem>
    <ListItem secondaryText="Дополнительное описание">
      Элемент с описанием
    </ListItem>
    <ListItem
      startIcon={<FolderIcon />}
      endIcon={<DeleteIcon />}
      secondaryText="С иконками и описанием"
    >
      Элемент с иконками
    </ListItem>
  </List>
);

export const Default = Template.bind({});
Default.args = {};

export const Compact = Template.bind({});
Compact.args = {
  compact: true,
};

export const WithoutGutters = Template.bind({});
WithoutGutters.args = {
  disableGutters: true,
};

// Дополнительные варианты
export const WithAvatars = () => (
  <Paper elevation={1} sx={{ maxWidth: 360 }}>
    <List>
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        }
        secondaryText="Frontend Developer"
      >
        Иван Петров
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <PersonIcon />
          </Avatar>
        }
        secondaryText="Backend Developer"
      >
        Мария Сидорова
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <PersonIcon />
          </Avatar>
        }
        secondaryText="UI/UX Designer"
      >
        Алексей Иванов
      </ListItem>
    </List>
  </Paper>
);

export const ContactList = () => (
  <Paper elevation={1} sx={{ maxWidth: 360 }}>
    <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
      Контакты
    </Typography>
    <List>
      <ListItem
        startIcon={<PersonIcon color="primary" />}
        secondaryText="Имя"
      >
        Иван Петров
      </ListItem>
      <ListItem
        startIcon={<EmailIcon color="primary" />}
        secondaryText="Email"
      >
        ivan@example.com
      </ListItem>
      <ListItem
        startIcon={<PhoneIcon color="primary" />}
        secondaryText="Телефон"
      >
        +7 (999) 123-45-67
      </ListItem>
    </List>
  </Paper>
);

export const InteractiveList = () => (
  <Paper elevation={1} sx={{ maxWidth: 360 }}>
    <List>
      <ListItem
        startIcon={<FolderIcon />}
        endIcon={
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        }
        secondaryText="Обновлено 2 часа назад"
      >
        Документы проекта
      </ListItem>
      <ListItem
        startIcon={<FolderIcon />}
        endIcon={
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        }
        secondaryText="Обновлено вчера"
      >
        Изображения
      </ListItem>
      <ListItem
        startIcon={<FolderIcon />}
        endIcon={
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        }
        secondaryText="Обновлено неделю назад"
      >
        Архивы
      </ListItem>
    </List>
  </Paper>
);

export const RatingList = () => (
  <Paper elevation={1} sx={{ maxWidth: 360 }}>
    <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
      Рейтинг товаров
    </Typography>
    <List>
      <ListItem
        startIcon={
          <Avatar alt="Product 1" src="https://via.placeholder.com/40" />
        }
        endIcon={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 0.5 }}>4.8</Typography>
            <StarIcon fontSize="small" color="warning" />
          </Box>
        }
        secondaryText="Электроника"
      >
        Смартфон Galaxy S21
      </ListItem>
      <Divider component="li" />
      <ListItem
        startIcon={
          <Avatar alt="Product 2" src="https://via.placeholder.com/40" />
        }
        endIcon={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 0.5 }}>4.5</Typography>
            <StarIcon fontSize="small" color="warning" />
          </Box>
        }
        secondaryText="Электроника"
      >
        Ноутбук MacBook Pro
      </ListItem>
      <Divider component="li" />
      <ListItem
        startIcon={
          <Avatar alt="Product 3" src="https://via.placeholder.com/40" />
        }
        endIcon={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 0.5 }}>4.2</Typography>
            <StarIcon fontSize="small" color="warning" />
          </Box>
        }
        secondaryText="Аксессуары"
      >
        Наушники AirPods Pro
      </ListItem>
    </List>
  </Paper>
);

export const NotificationList = () => (
  <Paper elevation={1} sx={{ maxWidth: 360 }}>
    <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
      Уведомления
    </Typography>
    <List>
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
            <InfoIcon fontSize="small" />
          </Avatar>
        }
        secondaryText="5 минут назад"
      >
        Ваш заказ успешно оформлен
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
            <InfoIcon fontSize="small" />
          </Avatar>
        }
        secondaryText="3 часа назад"
      >
        Новое сообщение от службы поддержки
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem
        startIcon={
          <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
            <InfoIcon fontSize="small" />
          </Avatar>
        }
        secondaryText="Вчера"
      >
        Напоминание о предстоящем событии
      </ListItem>
    </List>
  </Paper>
); 