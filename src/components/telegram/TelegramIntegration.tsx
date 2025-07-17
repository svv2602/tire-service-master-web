import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  useGetTelegramConnectionDataQuery,
  useGetUserTelegramSubscriptionsQuery,
  useUpdateTelegramSubscriptionMutation,
  useDeleteTelegramSubscriptionMutation,
  useToggleTelegramSubscriptionMutation,
} from '../../api/telegram.api';
import {
  TelegramSubscription,
  TelegramNotificationPreferences,
  TelegramIntegrationProps,
  TelegramSubscriptionStatus,
} from '../../types/telegram';

const TelegramIntegration: React.FC<TelegramIntegrationProps> = ({
  user,
  onConnectionSuccess,
  onConnectionError,
  variant = 'card',
  showQRCode = true,
}) => {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<TelegramSubscription | null>(null);

  // API хуки
  const {
    data: connectionData,
    isLoading: connectionLoading,
    error: connectionError,
  } = useGetTelegramConnectionDataQuery();

  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useGetUserTelegramSubscriptionsQuery();

  const [updateSubscription, { isLoading: updateLoading }] = useUpdateTelegramSubscriptionMutation();
  const [deleteSubscription, { isLoading: deleteLoading }] = useDeleteTelegramSubscriptionMutation();
  const [toggleSubscription, { isLoading: toggleLoading }] = useToggleTelegramSubscriptionMutation();

  // Активная подписка
  const activeSubscription = subscriptions.find(sub => sub.status === 'active');

  // Обработчики
  const handleOpenQRCode = () => {
    setQrCodeOpen(true);
  };

  const handleCloseQRCode = () => {
    setQrCodeOpen(false);
  };

  const handleOpenSettings = (subscription: TelegramSubscription) => {
    setSelectedSubscription(subscription);
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSelectedSubscription(null);
  };

  const handleUpdatePreferences = async (preferences: Partial<TelegramNotificationPreferences>) => {
    if (!selectedSubscription) return;

    try {
      await updateSubscription({
        id: selectedSubscription.id,
        data: { notification_preferences: preferences },
      }).unwrap();

      refetchSubscriptions();
      handleCloseSettings();
      
      if (onConnectionSuccess) {
        onConnectionSuccess(selectedSubscription);
      }
    } catch (error: any) {
      console.error('Ошибка обновления настроек:', error);
      if (onConnectionError) {
        onConnectionError(error.message || 'Ошибка обновления настроек');
      }
    }
  };

  const handleToggleStatus = async (subscription: TelegramSubscription) => {
    try {
      const newStatus: TelegramSubscriptionStatus = subscription.status === 'active' ? 'inactive' : 'active';
      await toggleSubscription({
        id: subscription.id,
        status: newStatus,
      }).unwrap();

      refetchSubscriptions();
    } catch (error: any) {
      console.error('Ошибка изменения статуса:', error);
      if (onConnectionError) {
        onConnectionError(error.message || 'Ошибка изменения статуса');
      }
    }
  };

  const handleDeleteSubscription = async (subscription: TelegramSubscription) => {
    if (!window.confirm('Вы уверены, что хотите удалить подписку Telegram?')) return;

    try {
      await deleteSubscription(subscription.id).unwrap();
      refetchSubscriptions();
    } catch (error: any) {
      console.error('Ошибка удаления подписки:', error);
      if (onConnectionError) {
        onConnectionError(error.message || 'Ошибка удаления подписки');
      }
    }
  };

  const getStatusColor = (status: TelegramSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: TelegramSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'inactive':
        return <WarningIcon />;
      case 'blocked':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const getStatusText = (status: TelegramSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'inactive':
        return 'Неактивна';
      case 'blocked':
        return 'Заблокирована';
      default:
        return 'Неизвестно';
    }
  };

  // Компонент настроек уведомлений
  const NotificationSettings = () => {
    if (!selectedSubscription) return null;

    const preferences = selectedSubscription.notification_preferences;

    const handlePreferenceChange = (key: keyof TelegramNotificationPreferences, value: boolean) => {
      const newPreferences = { ...preferences, [key]: value };
      handleUpdatePreferences(newPreferences);
    };

    return (
      <Dialog open={settingsOpen} onClose={handleCloseSettings} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            Настройки уведомлений Telegram
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Уведомления о бронированиях
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Создание бронирования"
                  secondary="Уведомление при создании нового бронирования"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_created}
                    onChange={(e) => handlePreferenceChange('booking_created', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Подтверждение бронирования"
                  secondary="Уведомление при подтверждении бронирования"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_confirmed}
                    onChange={(e) => handlePreferenceChange('booking_confirmed', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Напоминание о бронировании"
                  secondary="Напоминание за час до бронирования"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_reminder}
                    onChange={(e) => handlePreferenceChange('booking_reminder', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Отмена бронирования"
                  secondary="Уведомление при отмене бронирования"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_cancelled}
                    onChange={(e) => handlePreferenceChange('booking_cancelled', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Завершение бронирования"
                  secondary="Уведомление при завершении обслуживания"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_completed}
                    onChange={(e) => handlePreferenceChange('booking_completed', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Перенос бронирования"
                  secondary="Уведомление при изменении времени бронирования"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.booking_rescheduled}
                    onChange={(e) => handlePreferenceChange('booking_rescheduled', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Другие уведомления
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Системные уведомления"
                  secondary="Важные уведомления о работе сервиса"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.system_notifications}
                    onChange={(e) => handlePreferenceChange('system_notifications', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Рекламные уведомления"
                  secondary="Акции, скидки и специальные предложения"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.promotional_notifications}
                    onChange={(e) => handlePreferenceChange('promotional_notifications', e.target.checked)}
                    disabled={updateLoading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} disabled={updateLoading}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Компонент QR кода
  const QRCodeDialog = () => (
    <Dialog open={qrCodeOpen} onClose={handleCloseQRCode} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <QrCodeIcon />
          Подключение к Telegram боту
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {connectionData && (
            <>
              <Typography variant="body1" gutterBottom>
                Отсканируйте QR-код или перейдите по ссылке:
              </Typography>
              
              {connectionData.qr_code_url && (
                <Box sx={{ my: 3 }}>
                  <img
                    src={connectionData.qr_code_url}
                    alt="QR код для подключения к Telegram боту"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                href={connectionData.connection_url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<TelegramIcon />}
                sx={{ mb: 2 }}
              >
                Открыть в Telegram
              </Button>

              <Typography variant="body2" color="text.secondary">
                {connectionData.instructions}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseQRCode}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  // Основной контент
  const renderContent = () => {
    if (connectionLoading || subscriptionsLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (connectionError || subscriptionsError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки данных Telegram интеграции
        </Alert>
      );
    }

    return (
      <Box>
        {/* Заголовок */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TelegramIcon color="primary" />
          <Typography variant="h6">Telegram уведомления</Typography>
          <Tooltip title="Обновить">
            <IconButton onClick={() => refetchSubscriptions()} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Статус подключения */}
        {activeSubscription ? (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            action={
              <Box display="flex" gap={1}>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleOpenSettings(activeSubscription)}
                  startIcon={<SettingsIcon />}
                >
                  Настройки
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleToggleStatus(activeSubscription)}
                  disabled={toggleLoading}
                >
                  {activeSubscription.status === 'active' ? 'Отключить' : 'Включить'}
                </Button>
              </Box>
            }
          >
            Telegram подключен: @{activeSubscription.username || activeSubscription.first_name}
          </Alert>
        ) : (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleOpenQRCode}
                startIcon={<QrCodeIcon />}
              >
                Подключить
              </Button>
            }
          >
            Подключите Telegram для получения уведомлений
          </Alert>
        )}

        {/* Список подписок */}
        {subscriptions.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Активные подписки:
            </Typography>
            <Grid container spacing={2}>
              {subscriptions.map((subscription) => (
                <Grid item xs={12} md={6} key={subscription.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2">
                          @{subscription.username || subscription.first_name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          {(() => {
                            const statusIcon = getStatusIcon(subscription.status);
                            return (
                              <Chip
                                size="small"
                                label={getStatusText(subscription.status)}
                                color={getStatusColor(subscription.status)}
                                {...(statusIcon && { icon: statusIcon })}
                              />
                            );
                          })()}
                          {subscription.language_code && (
                            <Chip
                              size="small"
                              label={subscription.language_code.toUpperCase()}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Настройки">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenSettings(subscription)}
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubscription(subscription)}
                            disabled={deleteLoading}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Диалоги */}
        <NotificationSettings />
        <QRCodeDialog />
      </Box>
    );
  };

  // Возвращаем компонент в зависимости от варианта
  if (variant === 'inline') {
    return renderContent();
  }

  return (
    <Card>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default TelegramIntegration; 