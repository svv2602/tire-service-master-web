import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { SuspiciousActivityDashboard } from './components/SuspiciousActivityDashboard';
import { getTablePageStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';

const SuspiciousActivityPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    navigate(`/admin/audit-logs/user-timeline/${userId}`);
  };

  const handleIpClick = (ipAddress: string) => {
    navigate(`/admin/audit-logs?ip_address=${encodeURIComponent(ipAddress)}`);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/audit-logs')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Мониторинг безопасности
        </Typography>
      </Box>

      {/* Дашборд подозрительной активности */}
      <SuspiciousActivityDashboard
        onUserClick={handleUserClick}
        onIpClick={handleIpClick}
      />
    </Box>
  );
};

export default SuspiciousActivityPage; 