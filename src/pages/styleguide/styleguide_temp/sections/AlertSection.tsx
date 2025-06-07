import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { Alert } from '../../../../components/ui/Alert';

export const AlertSection: React.FC = () => {
  const [showClosableAlert, setShowClosableAlert] = React.useState(true);

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Уведомления
      </Typography>
      
      <Stack spacing={2}>
        <Alert variant="info">
          Это информационное уведомление
        </Alert>
        
        <Alert variant="success">
          Операция успешно выполнена
        </Alert>
        
        <Alert variant="warning">
          Внимание! Это предупреждение
        </Alert>
        
        <Alert variant="error">
          Произошла ошибка при выполнении операции
        </Alert>
        
        {showClosableAlert && (
          <Alert
            variant="info"
            closable
            onClose={() => setShowClosableAlert(false)}
          >
            Это закрываемое уведомление
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default AlertSection;