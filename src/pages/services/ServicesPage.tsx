import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { SIZES } from '../../styles';

const ServicesPage: React.FC = () => {
  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 1200,
      mx: 'auto',
      px: { xs: SIZES.spacing.md, md: SIZES.spacing.lg },
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: SIZES.spacing.lg,
          fontSize: SIZES.fontSize.xl,
          fontWeight: 600,
        }}
      >
        Услуги
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: SIZES.spacing.xl 
      }}>
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default ServicesPage;