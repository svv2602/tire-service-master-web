import React from 'react';
import { Box, Typography } from '@mui/material';
import { Alert } from '../../../../components/ui/Alert';

export const AlertSection = () => {
  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Оповещения
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Alert severity="success">
          Успешное действие
        </Alert>

        <Alert severity="info" title="С заголовком">
          Информационное сообщение
        </Alert>

        <Alert 
          severity="warning" 
          title="С действиями"
          actions={[
            { label: 'Отмена', onClick: () => console.log('Отмена') },
            { label: 'OK', onClick: () => console.log('OK') }
          ]}
        >
          Предупреждение с действиями
        </Alert>

        <Alert 
          severity="error" 
          title="Закрываемое"
          closable
          onClose={() => console.log('Закрыто')}
        >
          Сообщение об ошибке, которое можно закрыть
        </Alert>

        <Alert variant="outlined" severity="info">
          Оповещение с обводкой
        </Alert>

        <Alert variant="filled" severity="success">
          Заполненное оповещение
        </Alert>
      </Box>
    </Box>
  );
};

export default AlertSection;