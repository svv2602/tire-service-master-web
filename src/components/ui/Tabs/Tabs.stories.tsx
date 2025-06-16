import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Tabs, TabsProps, TabPanel } from './Tabs';
import { Box, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Tabs',
  component: Tabs,
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'scrollable', 'fullWidth'],
      defaultValue: 'standard',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      defaultValue: 'horizontal',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      defaultValue: 'medium',
    },
  },
} as Meta;

// Базовые вкладки
const defaultTabs = [
  { label: 'Главная', value: 'home' },
  { label: 'Профиль', value: 'profile' },
  { label: 'Настройки', value: 'settings' },
];

// Вкладки с иконками
const tabsWithIcons = [
  { label: 'Главная', value: 'home', icon: <HomeIcon /> },
  { label: 'Избранное', value: 'favorites', icon: <FavoriteIcon /> },
  { label: 'Профиль', value: 'profile', icon: <PersonIcon /> },
  { label: 'Настройки', value: 'settings', icon: <SettingsIcon /> },
];

// Шаблон для простых вариантов
const Template: Story<TabsProps> = (args) => {
  const [value, setValue] = useState<string | number>(args.tabs[0].value || 'home');
  
  const handleChange = (newValue: string | number) => {
    setValue(newValue);
  };
  
  return (
    <Tabs {...args} value={value} onChange={handleChange} />
  );
};

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  tabs: defaultTabs,
};

export const WithIcons = Template.bind({});
WithIcons.args = {
  tabs: tabsWithIcons,
};

// Варианты отображения
export const StandardTabs = Template.bind({});
StandardTabs.args = {
  tabs: defaultTabs,
  variant: 'standard',
};

export const FullWidthTabs = Template.bind({});
FullWidthTabs.args = {
  tabs: defaultTabs,
  variant: 'fullWidth',
};

export const ScrollableTabs = Template.bind({});
ScrollableTabs.args = {
  tabs: [
    { label: 'Вкладка 1', value: 'tab1' },
    { label: 'Вкладка 2', value: 'tab2' },
    { label: 'Вкладка 3', value: 'tab3' },
    { label: 'Вкладка 4', value: 'tab4' },
    { label: 'Вкладка 5', value: 'tab5' },
    { label: 'Вкладка 6', value: 'tab6' },
    { label: 'Вкладка 7', value: 'tab7' },
    { label: 'Вкладка 8', value: 'tab8' },
  ],
  variant: 'scrollable',
};

// Размеры
export const SmallTabs = Template.bind({});
SmallTabs.args = {
  tabs: defaultTabs,
  size: 'small',
};

export const MediumTabs = Template.bind({});
MediumTabs.args = {
  tabs: defaultTabs,
  size: 'medium',
};

export const LargeTabs = Template.bind({});
LargeTabs.args = {
  tabs: defaultTabs,
  size: 'large',
};

// Ориентация
export const HorizontalTabs = Template.bind({});
HorizontalTabs.args = {
  tabs: defaultTabs,
  orientation: 'horizontal',
};

export const VerticalTabs = () => {
  const [value, setValue] = useState('home');
  
  const handleChange = (newValue: string | number) => {
    setValue(newValue as string);
  };
  
  return (
    <Box sx={{ display: 'flex', height: 300 }}>
      <Tabs
        tabs={tabsWithIcons}
        value={value}
        onChange={handleChange}
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
      />
      <Box sx={{ p: 3, width: '100%' }}>
        <TabPanel value={value} index="home">
          <Typography>Содержимое вкладки "Главная"</Typography>
        </TabPanel>
        <TabPanel value={value} index="favorites">
          <Typography>Содержимое вкладки "Избранное"</Typography>
        </TabPanel>
        <TabPanel value={value} index="profile">
          <Typography>Содержимое вкладки "Профиль"</Typography>
        </TabPanel>
        <TabPanel value={value} index="settings">
          <Typography>Содержимое вкладки "Настройки"</Typography>
        </TabPanel>
      </Box>
    </Box>
  );
};

// Состояния
export const WithDisabledTab = Template.bind({});
WithDisabledTab.args = {
  tabs: [
    { label: 'Активная', value: 'active' },
    { label: 'Отключенная', value: 'disabled', disabled: true },
    { label: 'Активная 2', value: 'active2' },
  ],
};

// Полный пример с контентом
export const TabsWithContent = () => {
  const [value, setValue] = useState('home');
  
  const handleChange = (newValue: string | number) => {
    setValue(newValue as string);
  };
  
  return (
    <Paper elevation={1}>
      <Tabs
        tabs={tabsWithIcons}
        value={value}
        onChange={handleChange}
      />
      
      <Box sx={{ p: 3 }}>
        <TabPanel value={value} index="home">
          <Typography variant="h6" gutterBottom>Главная страница</Typography>
          <Typography>
            Это содержимое вкладки "Главная". Здесь может быть размещена основная информация,
            обзор или приветственный текст для пользователя.
          </Typography>
        </TabPanel>
        
        <TabPanel value={value} index="favorites">
          <Typography variant="h6" gutterBottom>Избранное</Typography>
          <Typography>
            Здесь отображаются избранные элементы пользователя. Это может быть список
            сохраненных товаров, статей или других предпочтений.
          </Typography>
        </TabPanel>
        
        <TabPanel value={value} index="profile">
          <Typography variant="h6" gutterBottom>Профиль пользователя</Typography>
          <Typography>
            На этой вкладке пользователь может просматривать и редактировать информацию
            о своем профиле, включая личные данные и настройки аккаунта.
          </Typography>
        </TabPanel>
        
        <TabPanel value={value} index="settings">
          <Typography variant="h6" gutterBottom>Настройки</Typography>
          <Typography>
            Здесь пользователь может настроить параметры приложения, включая уведомления,
            приватность и другие предпочтения.
          </Typography>
        </TabPanel>
      </Box>
    </Paper>
  );
}; 