import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, AppBar, Toolbar, Breadcrumbs } from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon, Person as PersonIcon } from '@mui/icons-material';
import { getButtonStyles, getThemeColors } from '../../styles';
import { useTheme } from '@mui/material';
import ThemeToggle from '../../components/ui/ThemeToggle';
import ClientLayout from '../../components/client/ClientLayout';

const ClientProfilePage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>Личный кабинет</Typography>
        </Breadcrumbs>

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 120, color: colors.textSecondary, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
            👤 Личный кабинет
          </Typography>
          <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 4 }}>
            Страница в разработке. Здесь будет личный кабинет клиента с историей записей.
          </Typography>
          <Button variant="outlined" component={Link} to="/client" sx={secondaryButtonStyles}>
            Вернуться на главную
          </Button>
        </Box>
      </Container>
    </ClientLayout>
  );
};

export default ClientProfilePage; 