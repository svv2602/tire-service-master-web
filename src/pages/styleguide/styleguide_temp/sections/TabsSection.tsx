import React from 'react';
import { Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tabs } from '../../../../components/ui/Tabs';

export const TabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('home');

  const tabs = [
    { id: 'home', label: 'Главная', icon: <HomeIcon /> },
    { id: 'profile', label: 'Профиль', icon: <PersonIcon /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> }
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
          onChange={setActiveTab}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Вертикальные вкладки
        </Typography>
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          orientation="vertical"
        />
      </Box>
    </Box>
  );
};

export default TabsSection;