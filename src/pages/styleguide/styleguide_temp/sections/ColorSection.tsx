import React from 'react';
import { Typography, Box, Grid, useTheme } from '@mui/material';

export const ColorSection: React.FC = () => {
  const theme = useTheme();

  const colorGroups = [
    {
      title: 'Основные цвета',
      colors: [
        { name: 'Primary', color: theme.palette.primary.main },
        { name: 'Secondary', color: theme.palette.secondary.main },
        { name: 'Error', color: theme.palette.error.main },
        { name: 'Warning', color: theme.palette.warning.main },
        { name: 'Info', color: theme.palette.info.main },
        { name: 'Success', color: theme.palette.success.main },
      ]
    },
    {
      title: 'Оттенки',
      colors: [
        { name: 'Primary Light', color: theme.palette.primary.light },
        { name: 'Primary Dark', color: theme.palette.primary.dark },
        { name: 'Secondary Light', color: theme.palette.secondary.light },
        { name: 'Secondary Dark', color: theme.palette.secondary.dark },
      ]
    },
    {
      title: 'Нейтральные цвета',
      colors: [
        { name: 'Background', color: theme.palette.background.default },
        { name: 'Paper', color: theme.palette.background.paper },
        { name: 'Text Primary', color: theme.palette.text.primary },
        { name: 'Text Secondary', color: theme.palette.text.secondary },
        { name: 'Divider', color: theme.palette.divider },
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Цветовая палитра
      </Typography>

      {colorGroups.map((group, index) => (
        <Box key={index} mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            {group.title}
          </Typography>
          <Grid container spacing={2}>
            {group.colors.map((item, colorIndex) => (
              <Grid item key={colorIndex} xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    width: '100%',
                    height: 100,
                    backgroundColor: item.color,
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.getContrastText(item.color),
                      fontWeight: 'bold'
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.getContrastText(item.color),
                      opacity: 0.8
                    }}
                  >
                    {item.color}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default ColorSection; 