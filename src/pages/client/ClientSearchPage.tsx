import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, AppBar, Toolbar, Breadcrumbs } from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon, Map as MapIcon } from '@mui/icons-material';
import { getButtonStyles, getThemeColors } from '../../styles';
import { useTheme } from '@mui/material';

const ClientSearchPage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <AppBar position="static" sx={{ bgcolor: colors.backgroundCard, boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: colors.textPrimary, fontWeight: 700 }}>
            🚗 Твоя Шина
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/client" sx={{ color: colors.textSecondary }}>
              Главная
            </Button>
            <Button variant="outlined" component={Link} to="/login" sx={secondaryButtonStyles}>
              Войти
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>Поиск сервисов</Typography>
        </Breadcrumbs>

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MapIcon sx={{ fontSize: 120, color: colors.textSecondary, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
            🗺️ Поиск сервисов на карте
          </Typography>
          <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 4 }}>
            Страница в разработке. Здесь будет интерактивная карта с сервисами.
          </Typography>
          <Button variant="outlined" component={Link} to="/client" sx={secondaryButtonStyles}>
            Вернуться на главную
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientSearchPage; 