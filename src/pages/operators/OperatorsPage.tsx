import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

const OperatorsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Управление операторами
      </Typography>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        Страница операторов находится в разработке. 
        Пока используйте управление операторами через страницу редактирования партнера.
      </Alert>
    </Box>
  );
};

export default OperatorsPage; 