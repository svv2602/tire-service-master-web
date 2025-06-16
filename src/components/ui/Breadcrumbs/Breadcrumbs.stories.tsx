import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';
import { Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import ArticleIcon from '@mui/icons-material/Article';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    separator: {
      control: 'text',
      defaultValue: '/',
    },
    maxItems: {
      control: 'number',
      defaultValue: 8,
    },
  },
} as Meta;

const Template: Story<BreadcrumbsProps> = (args) => <Breadcrumbs {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  items: [
    { label: 'Главная', href: '/' },
    { label: 'Категория', href: '/category' },
    { label: 'Подкатегория', href: '/category/subcategory' },
    { label: 'Текущая страница' },
  ],
};

export const WithIcons = Template.bind({});
WithIcons.args = {
  items: [
    { label: 'Главная', href: '/', icon: <HomeIcon fontSize="small" /> },
    { label: 'Категория', href: '/category', icon: <CategoryIcon fontSize="small" /> },
    { label: 'Статья', icon: <ArticleIcon fontSize="small" /> },
  ],
};

// Варианты разделителей
export const CustomSeparator = Template.bind({});
CustomSeparator.args = {
  items: [
    { label: 'Главная', href: '/' },
    { label: 'Категория', href: '/category' },
    { label: 'Подкатегория', href: '/category/subcategory' },
    { label: 'Текущая страница' },
  ],
  separator: '›',
};

export const ArrowSeparator = Template.bind({});
ArrowSeparator.args = {
  items: [
    { label: 'Главная', href: '/' },
    { label: 'Категория', href: '/category' },
    { label: 'Подкатегория', href: '/category/subcategory' },
    { label: 'Текущая страница' },
  ],
  separator: '→',
};

// Максимальное количество элементов
export const CollapsedBreadcrumbs = Template.bind({});
CollapsedBreadcrumbs.args = {
  items: [
    { label: 'Главная', href: '/' },
    { label: 'Категория 1', href: '/category1' },
    { label: 'Категория 2', href: '/category1/category2' },
    { label: 'Категория 3', href: '/category1/category2/category3' },
    { label: 'Категория 4', href: '/category1/category2/category3/category4' },
    { label: 'Категория 5', href: '/category1/category2/category3/category4/category5' },
    { label: 'Текущая страница' },
  ],
  maxItems: 4,
};

// Различные стили
export const WithCustomStyles = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Breadcrumbs
      items={[
        { label: 'Главная', href: '/' },
        { label: 'Категория', href: '/category' },
        { label: 'Текущая страница' },
      ]}
      sx={{
        '& .MuiBreadcrumbs-ol': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      }}
    />
    
    <Breadcrumbs
      items={[
        { label: 'Главная', href: '/' },
        { label: 'Категория', href: '/category' },
        { label: 'Текущая страница' },
      ]}
      separator="|"
      sx={{
        '& .MuiBreadcrumbs-separator': {
          color: 'primary.main',
          fontWeight: 'bold',
        },
      }}
    />
    
    <Breadcrumbs
      items={[
        { label: 'Главная', href: '/' },
        { label: 'Категория', href: '/category' },
        { label: 'Текущая страница' },
      ]}
      sx={{
        '& a': {
          color: 'secondary.main',
          fontWeight: 'bold',
          '&:hover': {
            color: 'secondary.dark',
          },
        },
      }}
    />
  </Box>
);

// Примеры использования
export const UsageExamples = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Страница категории товаров</Typography>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/', icon: <HomeIcon fontSize="small" /> },
          { label: 'Каталог', href: '/catalog' },
          { label: 'Электроника', href: '/catalog/electronics' },
          { label: 'Смартфоны' },
        ]}
      />
    </Box>
    
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Страница профиля пользователя</Typography>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Личный кабинет', href: '/account' },
          { label: 'Настройки профиля' },
        ]}
        separator="•"
      />
    </Box>
    
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Админ-панель</Typography>
      <Breadcrumbs
        items={[
          { label: 'Панель управления', href: '/admin' },
          { label: 'Пользователи', href: '/admin/users' },
          { label: 'Редактирование пользователя #1234' },
        ]}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          '& a': {
            color: 'white',
          },
          '& .MuiBreadcrumbs-separator': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      />
    </Box>
  </Box>
); 