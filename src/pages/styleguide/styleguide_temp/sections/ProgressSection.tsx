import React from 'react';
import { Box, Typography } from '@mui/material';
import { Progress } from '../../../../components/ui/Progress';

export const ProgressSection = () => {
  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Индикаторы прогресса
      </Typography>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Линейный прогресс
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Progress variant="linear" value={30} showValue />
            <Progress variant="linear" value={60} color="secondary" showValue />
            <Progress variant="linear" value={90} color="success" showValue />
            <Progress variant="linear" />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Круговой прогресс
          </Typography>
          <Box display="flex" gap={3}>
            <Progress variant="circular" value={25} showValue />
            <Progress variant="circular" value={50} color="secondary" showValue />
            <Progress variant="circular" value={75} color="success" showValue />
            <Progress variant="circular" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressSection; 