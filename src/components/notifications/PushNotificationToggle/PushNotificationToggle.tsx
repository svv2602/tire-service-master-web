import React, { useState } from 'react';
import {
  Box,
  Switch,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

interface PushNotificationToggleProps {
  variant?: 'switch' | 'card';
  showDetails?: boolean;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  variant = 'switch',
  showDetails = false,
  onSubscriptionChange,
}) => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    checkSubscription,
    requestPermission,
    userSubscriptions,
  } = usePushNotifications();

  const [showError, setShowError] = useState(true);

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success && onSubscriptionChange) {
        onSubscriptionChange(false);
      }
    } else {
      const success = await subscribe();
      if (success && onSubscriptionChange) {
        onSubscriptionChange(true);
      }
    }
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Разрешены', color: 'success' as const };
      case 'denied':
        return { text: 'Запрещены', color: 'error' as const };
      default:
        return { text: 'Не запрошены', color: 'warning' as const };
    }
  };

  const getSubscriptionStatus = () => {
    if (!isSupported) return { text: 'Не поддерживается', color: 'default' as const };
    if (isSubscribed) return { text: 'Активна', color: 'success' as const };
    return { text: 'Неактивна', color: 'default' as const };
  };

  // Если браузер не поддерживает push-уведомления
  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Ваш браузер не поддерживает push-уведомления
        </Typography>
      </Alert>
    );
  }

  // Компонент в виде переключателя
  if (variant === 'switch') {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch
            checked={isSubscribed}
            onChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
            color="primary"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSubscribed ? (
              <NotificationsIcon color="primary" />
            ) : (
              <NotificationsOffIcon color="disabled" />
            )}
            <Typography variant="body2">
              Push-уведомления
            </Typography>
            {isLoading && <CircularProgress size={16} />}
          </Box>
        </Box>

        {permission === 'denied' && (
          <Alert severity="error" sx={{ mt: 1 }}>
            <Typography variant="body2">
              Уведомления заблокированы в браузере. 
              Разрешите их в настройках сайта.
            </Typography>
          </Alert>
        )}

        {permission === 'default' && !isSubscribed && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              Для получения push-уведомлений нужно дать разрешение.
            </Typography>
            <Button
              size="small"
              onClick={handleRequestPermission}
              sx={{ mt: 1 }}
            >
              Дать разрешение
            </Button>
          </Alert>
        )}

        {error && showError && (
          <Alert 
            severity="error" 
            sx={{ mt: 1 }}
            onClose={() => setShowError(false)}
          >
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </Box>
    );
  }

  // Компонент в виде карточки
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon />
            Push-уведомления
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Обновить состояние">
              <IconButton onClick={checkSubscription} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Switch
              checked={isSubscribed}
              onChange={handleToggle}
              disabled={isLoading || permission === 'denied'}
            />
          </Box>
        </Box>

        {showDetails && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Разрешение: ${getPermissionStatus().text}`}
                color={getPermissionStatus().color}
                size="small"
              />
              <Chip
                label={`Подписка: ${getSubscriptionStatus().text}`}
                color={getSubscriptionStatus().color}
                size="small"
              />
              {userSubscriptions && (
                <Chip
                  label={`Устройств: ${userSubscriptions.length}`}
                  color="info"
                  size="small"
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Push-уведомления позволяют получать мгновенные уведомления о статусе бронирований, 
              новых сообщениях и других важных событиях даже когда сайт закрыт.
            </Typography>
          </Box>
        )}

        {permission === 'denied' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon />
              <Typography variant="body2">
                Уведомления заблокированы в браузере
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Чтобы включить уведомления:
            </Typography>
            <Typography variant="body2" component="ol" sx={{ mt: 1, pl: 2 }}>
              <li>Нажмите на значок замка в адресной строке</li>
              <li>Выберите "Разрешить" для уведомлений</li>
              <li>Обновите страницу</li>
            </Typography>
          </Alert>
        )}

        {permission === 'default' && !isSubscribed && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Для получения push-уведомлений нужно дать разрешение браузеру.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRequestPermission}
              startIcon={<NotificationsIcon />}
            >
              Дать разрешение
            </Button>
          </Alert>
        )}

        {error && showError && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            onClose={() => setShowError(false)}
          >
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {isSubscribed ? 'Отключение уведомлений...' : 'Подключение уведомлений...'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 