import React from 'react';
import { Box, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const actions = [
  { icon: <FileCopyIcon />, name: 'Копировать' },
  { icon: <SaveIcon />, name: 'Сохранить' },
  { icon: <PrintIcon />, name: 'Печать' },
  { icon: <ShareIcon />, name: 'Поделиться' },
];

export const SpeedDialSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        SpeedDial
      </Typography>

      <Grid container spacing={4}>
        {/* Базовый SpeedDial */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовый SpeedDial
          </Typography>
          <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1, position: 'relative' }}>
            <SpeedDial
              ariaLabel="Базовый SpeedDial"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                />
              ))}
            </SpeedDial>
          </Box>
        </Grid>

        {/* SpeedDial с кастомной иконкой */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С кастомной иконкой
          </Typography>
          <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1, position: 'relative' }}>
            <SpeedDial
              ariaLabel="SpeedDial с кастомной иконкой"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon openIcon={<EditIcon />} />}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                />
              ))}
            </SpeedDial>
          </Box>
        </Grid>

        {/* SpeedDial с разными направлениями */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Разные направления
          </Typography>
          <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
            <Grid container justifyContent="space-around">
              {['up', 'down', 'left', 'right'].map((direction) => (
                <Grid key={direction} item>
                  <SpeedDial
                    ariaLabel={`SpeedDial ${direction}`}
                    icon={<SpeedDialIcon />}
                    direction={direction as 'up' | 'down' | 'left' | 'right'}
                  >
                    {actions.map((action) => (
                      <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                      />
                    ))}
                  </SpeedDial>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeedDialSection;