import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

interface SectionItemProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

/**
 * Компонент для отображения секции примера в StyleGuide
 */
const SectionItem: React.FC<SectionItemProps> = ({ title, children, description }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {description}
        </Typography>
      )}
      
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default SectionItem;