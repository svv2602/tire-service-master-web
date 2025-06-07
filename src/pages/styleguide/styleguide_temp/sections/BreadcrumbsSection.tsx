import React from 'react';
import { Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import GrainIcon from '@mui/icons-material/Grain';
import { Breadcrumbs } from '../../../../components/ui/Breadcrumbs';

export const BreadcrumbsSection = () => {
  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Хлебные крошки
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Категория', href: '/category' },
            { label: 'Страница' },
          ]}
        />

        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/', icon: <HomeIcon fontSize="small" /> },
            { label: 'Категория', href: '/category', icon: <WhatshotIcon fontSize="small" /> },
            { label: 'Страница', icon: <GrainIcon fontSize="small" /> },
          ]}
        />
      </Box>
    </Box>
  );
};

export default BreadcrumbsSection; 