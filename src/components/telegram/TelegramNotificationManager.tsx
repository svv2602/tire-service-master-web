import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Retry as RetryIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  useGetAllTelegramSubscriptionsQuery,
  useGetTelegramNotificationsQuery,
  useGetTelegramStatisticsQuery,
  useSendTelegramNotificationMutation,
  useSendBulkTelegramNotificationsMutation,
  useRetryTelegramNotificationMutation,
  useGetTelegramBotConfigQuery,
  useTestTelegramBotMutation,
} from '../../api/telegram.api';
import {
  TelegramSubscription,
  TelegramNotification,
  TelegramNotificationType,
  TelegramNotificationStatus,
  TelegramSubscriptionStatus,
  TelegramStatistics,
} from '../../types/telegram';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const TelegramNotificationManager: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [bulkSendDialogOpen, setBulkSendDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<TelegramNotification | null>(null);
  
  // Состояние для отправки уведомлений
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<TelegramNotificationType>('system_notification');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Состояние для пагинации
  const [subscriptionsPage, setSubscriptionsPage] = useState(0);
  const [notificationsPage, setNotificationsPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API хуки
  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useGetAllTelegramSubscriptionsQuery({
    page: subscriptionsPage + 1,
    per_page: rowsPerPage,
  });

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useGetTelegramNotificationsQuery({
    page: notificationsPage + 1,
    per_page: rowsPerPage,
  });

  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
    refetch: refetchStatistics,
  } = useGetTelegramStatisticsQuery();

  const {
    data: botConfig,
    isLoading: botConfigLoading,
    error: botConfigError,
  } = useGetTelegramBotConfigQuery();

  const [sendNotification, { isLoading: sendLoading }] = useSendTelegramNotificationMutation();
  const [sendBulkNotifications, { isLoading: bulkSendLoading }] = useSendBulkTelegramNotificationsMutation();
  const [retryNotification, { isLoading: retryLoading }] = useRetryTelegramNotificationMutation();
  const [testBot, { isLoading: testBotLoading }] = useTestTelegramBotMutation();

  // Обработчики
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendNotification = async () => {
    if (!message.trim()) return;

    try {
      await sendNotification({
        message,
        notification_type: notificationType,
      }).unwrap();

      setMessage('');
      setSendDialogOpen(false);
      refetchNotifications();
      refetchStatistics();
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
    }
  };

  const handleBulkSendNotifications = async () => {
    if (!message.trim()) return;

    try {
      await sendBulkNotifications({
        message,
        notification_type: notificationType,
        user_ids: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      }).unwrap();

      setMessage('');
      setSelectedUserIds([]);
      setBulkSendDialogOpen(false);
      refetchNotifications();
      refetchStatistics();
    } catch (error) {
      console.error('Ошибка массовой отправки:', error);
    }
  };

  const handleRetryNotification = async (notificationId: number) => {
    try {
      await retryNotification(notificationId).unwrap();
      refetchNotifications();
      refetchStatistics();
    } catch (error) {
      console.error('Ошибка повторной отправки:', error);
    }
  };

  const handleTestBot = async () => {
    try {
      const result = await testBot().unwrap();
      alert(result.message);
    } catch (error) {
      console.error('Ошибка тестирования бота:', error);
    }
  };

  // Функции для получения статуса
  const getSubscriptionStatusColor = (status: TelegramSubscriptionStatus) => {
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

  const getNotificationStatusColor = (status: TelegramNotificationStatus) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNotificationStatusIcon = (status: TelegramNotificationStatus) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'failed':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  // Компонент статистики
  const StatisticsCards = () => {
    if (statisticsLoading) {
      return <CircularProgress />;
    }

    if (statisticsError || !statistics) {
      return <Alert severity="error">Ошибка загрузки статистики</Alert>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="primary" />
                <Box>
                  <Typography variant="h4">{statistics.total_subscriptions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего подписок
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="h4">{statistics.active_subscriptions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <NotificationsIcon color="primary" />
                <Box>
                  <Typography variant="h4">{statistics.total_notifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего уведомлений
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="success" />
                <Box>
                  <Typography variant="h4">{statistics.sent_notifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Отправлено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Компонент таблицы подписок
  const SubscriptionsTable = () => {
    if (subscriptionsLoading) {
      return <CircularProgress />;
    }

    if (subscriptionsError || !subscriptionsData) {
      return <Alert severity="error">Ошибка загрузки подписок</Alert>;
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Telegram</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Язык</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptionsData.data.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  {subscription.user ? (
                    <Box>
                      <Typography variant="body2">
                        {subscription.user.first_name} {subscription.user.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subscription.user.email}
                      </Typography>
                    </Box>
                  ) : (
                    'Неизвестный пользователь'
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      @{subscription.username || subscription.first_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {subscription.chat_id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={subscription.status}
                    color={getSubscriptionStatusColor(subscription.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {subscription.language_code?.toUpperCase() || 'RU'}
                </TableCell>
                <TableCell>
                  {new Date(subscription.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Настройки">
                    <IconButton size="small">
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={subscriptionsData.pagination?.total_count || 0}
          rowsPerPage={rowsPerPage}
          page={subscriptionsPage}
          onPageChange={(event, newPage) => setSubscriptionsPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setSubscriptionsPage(0);
          }}
        />
      </TableContainer>
    );
  };

  // Компонент таблицы уведомлений
  const NotificationsTable = () => {
    if (notificationsLoading) {
      return <CircularProgress />;
    }

    if (notificationsError || !notificationsData) {
      return <Alert severity="error">Ошибка загрузки уведомлений</Alert>;
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Сообщение</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Получатель</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Попытки</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificationsData.data.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {notification.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={notification.notification_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {notification.telegram_subscription?.username || 
                     notification.telegram_subscription?.first_name || 
                     'Неизвестно'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={notification.status}
                    color={getNotificationStatusColor(notification.status)}
                    size="small"
                    icon={getNotificationStatusIcon(notification.status)}
                  />
                </TableCell>
                <TableCell>{notification.retry_count}</TableCell>
                <TableCell>
                  {new Date(notification.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {notification.status === 'failed' && (
                    <Tooltip title="Повторить">
                      <IconButton
                        size="small"
                        onClick={() => handleRetryNotification(notification.id)}
                        disabled={retryLoading}
                      >
                        <RetryIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={notificationsData.pagination?.total_count || 0}
          rowsPerPage={rowsPerPage}
          page={notificationsPage}
          onPageChange={(event, newPage) => setNotificationsPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setNotificationsPage(0);
          }}
        />
      </TableContainer>
    );
  };

  // Диалог отправки уведомления
  const SendNotificationDialog = () => (
    <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Отправить уведомление</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Сообщение"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Тип уведомления</InputLabel>
            <Select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as TelegramNotificationType)}
            >
              <MenuItem value="system_notification">Системное</MenuItem>
              <MenuItem value="promotional_notification">Рекламное</MenuItem>
              <MenuItem value="booking_reminder">Напоминание</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSendDialogOpen(false)}>Отмена</Button>
        <Button
          onClick={handleSendNotification}
          variant="contained"
          disabled={sendLoading || !message.trim()}
          startIcon={sendLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление Telegram уведомлениями</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleTestBot}
            disabled={testBotLoading}
            startIcon={<SettingsIcon />}
          >
            Тест бота
          </Button>
          <Button
            variant="contained"
            onClick={() => setSendDialogOpen(true)}
            startIcon={<SendIcon />}
          >
            Отправить уведомление
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Box mb={3}>
        <StatisticsCards />
      </Box>

      {/* Вкладки */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Подписки" />
          <Tab label="Уведомления" />
          <Tab label="Настройки" />
        </Tabs>
      </Box>

      {/* Содержимое вкладок */}
      <TabPanel value={tabValue} index={0}>
        <SubscriptionsTable />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <NotificationsTable />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Конфигурация бота
            </Typography>
            {botConfigLoading ? (
              <CircularProgress />
            ) : botConfigError ? (
              <Alert severity="error">Ошибка загрузки конфигурации</Alert>
            ) : botConfig ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Имя бота:</Typography>
                  <Typography variant="body2">@{botConfig.bot_username}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Webhook установлен:</Typography>
                  <Chip
                    label={botConfig.is_webhook_set ? 'Да' : 'Нет'}
                    color={botConfig.is_webhook_set ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">URL webhook:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {botConfig.webhook_url}
                  </Typography>
                </Grid>
              </Grid>
            ) : null}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Диалоги */}
      <SendNotificationDialog />
    </Box>
  );
};

export default TelegramNotificationManager; 