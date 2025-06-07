import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

export const TooltipSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Тултипы
      </Typography>

      <Grid container spacing={3}>
        {/* Простые тултипы */}
        <Grid item xs={12} md={6}>
          <Card title="Простые тултипы">
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Tooltip 
                title="Это простой тултип"
                arrow
              >
                <Button variant="contained" color="primary">
                  Наведи на меня
                </Button>
              </Tooltip>
            </Box>
          </Card>
        </Grid>

        {/* Форматированные тултипы */}
        <Grid item xs={12} md={6}>
          <Card title="Форматированные тултипы">
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Tooltip 
                title={
                  <Typography color="inherit">
                    Тултип с <b>форматированным</b> текстом
                  </Typography>
                }
                arrow
              >
                <Button variant="outlined" color="secondary">
                  С форматированием
                </Button>
              </Tooltip>
            </Box>
          </Card>
        </Grid>

        {/* Тултипы с разными темами */}
        <Grid item xs={12}>
          <Card title="Тултипы с разными темами">
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Tooltip 
                title="Светлый тултип"
                arrow
              >
                <Button variant="contained" color="primary">
                  Светлый
                </Button>
              </Tooltip>

              <Tooltip 
                title="Темный тултип"
                arrow
              >
                <Button variant="outlined" color="secondary">
                  Темный
                </Button>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TooltipSection;