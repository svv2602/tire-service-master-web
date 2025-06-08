import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { Home as HomeIcon, Person as PersonIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Tabs } from './Tabs';
import { TabsProps } from './types';

export default {
  title: 'UI/Tabs',
  component: Tabs,
} as Meta;

// Базовые табы
const BasicTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      tabs={[
        {
          id: 'home',
          label: 'Главная',
          content: <Typography>Содержимое главной вкладки</Typography>,
        },
        {
          id: 'profile',
          label: 'Профиль',
          content: <Typography>Содержимое профиля</Typography>,
        },
        {
          id: 'settings',
          label: 'Настройки',
          content: <Typography>Содержимое настроек</Typography>,
        },
      ]}
      value={value}
      onChange={handleChange}
    />
  );
};

export const Basic: Story<TabsProps> = () => <BasicTabs />;

// Табы с иконками
const IconTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      tabs={[
        {
          id: 'home',
          label: 'Главная',
          icon: <HomeIcon />,
          content: <Typography>Содержимое главной вкладки</Typography>,
        },
        {
          id: 'profile',
          label: 'Профиль',
          icon: <PersonIcon />,
          content: <Typography>Содержимое профиля</Typography>,
        },
        {
          id: 'settings',
          label: 'Настройки',
          icon: <SettingsIcon />,
          content: <Typography>Содержимое настроек</Typography>,
        },
      ]}
      value={value}
      onChange={handleChange}
    />
  );
};

export const WithIcons: Story<TabsProps> = () => <IconTabs />;

// Вертикальные табы
const VerticalTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      orientation="vertical"
      tabs={[
        {
          id: 'home',
          label: 'Главная',
          icon: <HomeIcon />,
          content: <Typography>Содержимое главной вкладки</Typography>,
        },
        {
          id: 'profile',
          label: 'Профиль',
          icon: <PersonIcon />,
          content: <Typography>Содержимое профиля</Typography>,
        },
        {
          id: 'settings',
          label: 'Настройки',
          icon: <SettingsIcon />,
          content: <Typography>Содержимое настроек</Typography>,
        },
      ]}
      value={value}
      onChange={handleChange}
    />
  );
};

export const Vertical: Story<TabsProps> = () => <VerticalTabs />;

// Прокручиваемые вкладки
const ScrollableTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      variant="scrollable"
      scrollButtons={true}
      allowScrollButtonsMobile={true}
      tabs={Array.from({ length: 10 }, (_, i) => ({
        id: `tab-${i}`,
        label: `Вкладка ${i + 1}`,
        content: <Typography>Содержимое вкладки {i + 1}</Typography>,
      }))}
      value={value}
      onChange={handleChange}
    />
  );
};

export const Scrollable: Story<TabsProps> = () => <ScrollableTabs />;