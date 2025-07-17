import React from 'react';
import { Container, Box, Typography, Paper, Chip, Alert } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

// Простые mock данные для демонстрации
const mockNotifications = [
  {
    id: 1,
    message: 'Ваше бронювання підтверджено на 24 червня 2025 о 10:00',
    category: 'Бронювання',
    priority: 'Високий',
    is_read: false,
    created_at: '2025-01-17T12:00:00Z',
  },
  {
    id: 2,
    message: 'Нагадування: запис на шиномонтаж завтра о 14:00',
    category: 'Нагадування',
    priority: 'Звичайний',
    is_read: false,
    created_at: '2025-01-17T11:30:00Z',
  },
  {
    id: 3,
    message: 'Нова акція: знижка 20% на заміну шин',
    category: 'Акції',
    priority: 'Низький',
    is_read: true,
    created_at: '2025-01-17T10:00:00Z',
  },
];

const NotificationCenterPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <NotificationsIcon color="primary" sx={{ fontSize: '2rem' }} />
          <Typography variant="h4" component="h1">
            Центр уведомлений
          </Typography>
        </Box>

        {/* Статистика */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {mockNotifications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Всього
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {mockNotifications.filter(n => !n.is_read).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Непрочитані
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {mockNotifications.filter(n => n.is_read).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Прочитані
            </Typography>
          </Paper>
        </Box>

        {/* Список уведомлений */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Останні уведомлення
          </Typography>
          
          {mockNotifications.map((notification) => (
            <Paper
              key={notification.id}
              elevation={notification.is_read ? 1 : 3}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: notification.is_read ? 'grey.50' : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Иконка категории */}
                <Box sx={{ fontSize: '1.5rem', mt: 0.5 }}>
                  📅
                </Box>

                {/* Основное содержимое */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={notification.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={notification.priority === 'Високий' ? 'warning' : 'default'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                    {!notification.is_read && (
                      <Chip
                        label="Нове"
                        size="small"
                        color="primary"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: notification.is_read ? 'normal' : 'bold',
                      mb: 1,
                    }}
                  >
                    {notification.message}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.created_at).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Информационное сообщение */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            🚧 <strong>В разработке:</strong> Это демо-версия Центра уведомлений. 
            Полная интеграция с API и real-time уведомления будут добавлены в следующих версиях.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default NotificationCenterPage;
