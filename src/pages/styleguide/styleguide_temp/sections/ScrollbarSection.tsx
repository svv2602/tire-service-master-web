import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Scrollbar } from '../../../../components/ui/Scrollbar';

const ScrollbarSection = () => {
  const longText = Array(20)
    .fill(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ' +
      'nisi ut aliquip ex ea commodo consequat.'
    )
    .join('\n\n');

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Полоса прокрутки (Scrollbar)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовая прокрутка
          </Typography>
          <Paper>
            <Scrollbar maxHeight={200}>
              <Box p={2}>
                <Typography>
                  {longText}
                </Typography>
              </Box>
            </Scrollbar>
          </Paper>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Прокрутка с фиксированной высотой
          </Typography>
          <Paper>
            <Scrollbar maxHeight={300}>
              <Box p={2} width={600}>
                <Typography variant="h6" gutterBottom>
                  Заголовок контента
                </Typography>
                {Array(5).fill(null).map((_, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Раздел {index + 1}
                    </Typography>
                    <Typography>
                      {longText.slice(0, 500)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </Paper>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Горизонтальная и вертикальная прокрутка
          </Typography>
          <Paper>
            <Scrollbar maxHeight={200}>
              <Box p={2} width={1200}>
                <Typography variant="h6" gutterBottom>
                  Широкий контент
                </Typography>
                <Box display="flex" gap={2}>
                  {Array(5).fill(null).map((_, index) => (
                    <Paper key={index} sx={{ p: 2, minWidth: 200 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Карточка {index + 1}
                      </Typography>
                      <Typography>
                        {longText.slice(0, 200)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Scrollbar>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ScrollbarSection; 