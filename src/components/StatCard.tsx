import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { getCardStyles, SIZES } from '../styles';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => {
  const theme = useTheme();
  
  return (
    <Card sx={getCardStyles(theme, 'primary')}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: SIZES.spacing.md }}>
          <Box
            sx={{
              p: SIZES.spacing.sm,
              borderRadius: SIZES.borderRadius.sm,
              backgroundColor: `${color}20`,
              color: color,
              mr: SIZES.spacing.md,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h3" component="div" sx={{ mb: SIZES.spacing.sm, color: color, fontWeight: 'bold' }}>
          {value.toLocaleString('ru-RU')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard; 