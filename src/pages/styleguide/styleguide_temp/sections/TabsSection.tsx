import React from 'react';
import { Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tabs } from '../../../../components/ui/Tabs';

export const TabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<number>(0);

  const handleTabChange = (newValue: string | number) => {
    setActiveTab(newValue as number);
  };

  const tabs = [
    { id: 'home', label: 'Главная', icon: <HomeIcon />, content: 'Содержимое главной вкладки' },
    { id: 'profile', label: 'Профиль', icon: <PersonIcon />, content: 'Содержимое профиля' },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon />, content: 'Содержимое настроек' }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Вкладки
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Горизонтальные вкладки
        </Typography>
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={handleTabChange}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Вертикальные вкладки
        </Typography>
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={handleTabChange}
          orientation="vertical"
        />
      </Box>
    </Box>
  );
};

export default TabsSection;