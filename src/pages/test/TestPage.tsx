import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тестовая страница
      </Typography>
      <Typography variant="body1" gutterBottom>
        Если вы видите эту страницу, значит React приложение работает корректно.
      </Typography>
      <Button variant="contained" onClick={() => alert('Кнопка работает!')}>
        Тест кнопки
      </Button>
    </Box>
  );
};

export default TestPage; 