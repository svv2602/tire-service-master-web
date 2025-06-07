import React from 'react';
import { Typography, Box } from '@mui/material';
import { Alert } from '../../../../components/ui/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export const NotificationSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Уведомления
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Типы уведомлений
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            title="Успешное действие"
          >
            Операция выполнена успешно
          </Alert>

          <Alert
            severity="info"
            icon={<InfoIcon />}
            title="Информационное сообщение"
          >
            Важная информация для пользователя
          </Alert>

          <Alert
            severity="warning"
            icon={<WarningIcon />}
            title="Предупреждение"
          >
            Обратите внимание на важные детали
          </Alert>

          <Alert
            severity="error"
            icon={<ErrorIcon />}
            title="Ошибка"
          >
            Произошла ошибка при выполнении операции
          </Alert>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Уведомления с действиями
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            title="С кнопкой закрытия"
            onClose={() => console.log('Закрыто')}
          >
            Уведомление можно закрыть
          </Alert>

          <Alert
            severity="info"
            icon={<InfoIcon />}
            title="С действиями"
            actions={[
              { label: 'Отменить', onClick: () => console.log('Отмена') },
              { label: 'Подтвердить', onClick: () => console.log('Подтверждено') }
            ]}
          >
            Уведомление с кнопками действий
          </Alert>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Варианты отображения
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert
            severity="success"
            variant="outlined"
            title="С обводкой"
          >
            Уведомление с обводкой
          </Alert>

          <Alert
            severity="info"
            variant="filled"
            title="Заполненное"
          >
            Уведомление с заливкой
          </Alert>
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationSection; 