import React from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';

export const TooltipSection = () => {
  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Подсказки
      </Typography>
      <Box display="flex" gap={2}>
        <Tooltip title="Подсказка сверху">
          <Button variant="contained">Сверху</Button>
        </Tooltip>

        <Tooltip title="Подсказка снизу" placement="bottom">
          <Button variant="contained">Снизу</Button>
        </Tooltip>

        <Tooltip title="Подсказка слева" placement="left">
          <Button variant="contained">Слева</Button>
        </Tooltip>

        <Tooltip title="Подсказка справа" placement="right">
          <Button variant="contained">Справа</Button>
        </Tooltip>

        <Tooltip 
          title="Подсказка с задержкой"
          enterDelay={500}
          leaveDelay={200}
        >
          <Button variant="contained">С задержкой</Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TooltipSection;