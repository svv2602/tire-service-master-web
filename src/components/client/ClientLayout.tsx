import React from 'react';
import { Box } from '@mui/material';
import ClientNavigation from './ClientNavigation';
import { useTheme } from '@mui/material/styles';
import { getThemeColors, getButtonStyles } from '../../styles';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const buttonStyles = getButtonStyles(theme, 'secondary');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <ClientNavigation colors={colors} secondaryButtonStyles={buttonStyles} />
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout;
