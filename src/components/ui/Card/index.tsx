import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </Paper>
  );
};

export default Card; 