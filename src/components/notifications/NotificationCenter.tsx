import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Grid,
  Alert,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';

// API импорты
import {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useClearReadNotificationsMutation,
  getNotificationIcon,
  getNotificationColor,
  getPriorityText,
  getCategoryText,
  type NotificationFilters
} from '../../api/notifications.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    per_page: 10
  });

  // API хуки
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications
  } = useGetNotificationsQuery(filters);

  const { 
    data: statsData, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetNotificationStatsQuery();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [clearRead] = useClearReadNotificationsMutation();

  // Обработчики событий
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Обновляем фильтры в зависимости от вкладки
    const newFilters: NotificationFilters = { ...filters, page: 1 };
    
    switch (newValue) {
      case 0: // Все
        delete newFilters.read;
        break;
      case 1: // Непрочитанные
        newFilters.read = false;
        break;
      case 2: // Прочитанные
        newFilters.read = true;
        break;
    }
    
    setFilters(newFilters);
  };

  const handleMarkAsRead = async (notificationId: number, isRead: boolean) => {
    try {
      await markAsRead({ id: notificationId, is_read: !isRead }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса уведомления:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити це сповіщення?')) {
      try {
        await deleteNotification(notificationId).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении уведомления:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Ошибка при отметке всех как прочитанные:', error);
    }
  };

  const handleClearRead = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити всі прочитані сповіщення?')) {
      try {
        await clearRead().unwrap();
      } catch (error) {
        console.error('Ошибка при очистке прочитанных:', error);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value, page: 1 });
  };

  const handleCategoryChange = (event: any) => {
    setFilters({ ...filters, category: event.target.value, page: 1 });
  };

  const handlePriorityChange = (event: any) => {
    setFilters({ ...filters, priority: event.target.value, page: 1 });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, page: value });
  };

  const handleRefresh = () => {
    refetchNotifications();
    refetchStats();
  };

  // Обработка ошибок
  if (notificationsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Помилка завантаження сповіщень. Спробуйте оновити сторінку.
      </Alert>
    );
  }

  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;
  const stats = statsData || {
    total: 0,
    unread: 0,
    read: 0,
    by_category: {},
    by_priority: {},
    today: 0,
    this_week: 0,
    this_month: 0,
    with_actions: 0,
    expired: 0
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Центр сповіщень
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Оновити">
          <IconButton onClick={handleRefresh} disabled={notificationsLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всього сповіщень
              </Typography>
              <Typography variant="h4">
                {statsLoading ? <CircularProgress size={24} /> : stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Непрочитані
              </Typography>
              <Typography variant="h4" color="primary">
                {statsLoading ? <CircularProgress size={24} /> : stats.unread}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Прочитані
              </Typography>
              <Typography variant="h4" color="success.main">
                {statsLoading ? <CircularProgress size={24} /> : stats.read}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Сьогодні
              </Typography>
              <Typography variant="h4">
                {statsLoading ? <CircularProgress size={24} /> : stats.today}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Действия */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<MarkEmailReadIcon />}
          onClick={handleMarkAllAsRead}
          disabled={stats.unread === 0}
        >
          Позначити всі як прочитані
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearRead}
          disabled={stats.read === 0}
          color="warning"
        >
          Очистити прочитані
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Пошук..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Категорія</InputLabel>
                <Select
                  value={filters.category || ''}
                  label="Категорія"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">Всі категорії</MenuItem>
                  <MenuItem value="booking">Бронювання</MenuItem>
                  <MenuItem value="system">Система</MenuItem>
                  <MenuItem value="promotion">Акція</MenuItem>
                  <MenuItem value="reminder">Нагадування</MenuItem>
                  <MenuItem value="general">Загальне</MenuItem>
                  <MenuItem value="security">Безпека</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Пріоритет</InputLabel>
                <Select
                  value={filters.priority || ''}
                  label="Пріоритет"
                  onChange={handlePriorityChange}
                >
                  <MenuItem value="">Всі пріоритети</MenuItem>
                  <MenuItem value="urgent">Терміново</MenuItem>
                  <MenuItem value="high">Високий</MenuItem>
                  <MenuItem value="normal">Звичайний</MenuItem>
                  <MenuItem value="low">Низький</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Вкладки */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="notification tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Всі (${stats.total})`} />
          <Tab label={`Непрочитані (${stats.unread})`} />
          <Tab label={`Прочитані (${stats.read})`} />
        </Tabs>

        {/* Контент вкладок */}
        <TabPanel value={activeTab} index={0}>
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              Сповіщення не знайдено
            </Alert>
          ) : (
            <Box>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Иконка категории */}
                    <Box sx={{ fontSize: '24px', mt: 0.5 }}>
                      {getNotificationIcon(notification.category)}
                    </Box>

                    {/* Контент уведомления */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            color: notification.is_read ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {notification.title}
                        </Typography>
                        
                        {/* Чипы категории и приоритета */}
                        <Chip
                          label={getCategoryText(notification.category)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getPriorityText(notification.priority)}
                          size="small"
                          sx={{
                            backgroundColor: getNotificationColor(notification.priority),
                            color: 'white'
                          }}
                        />
                      </Box>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1 }}
                      >
                        {notification.message}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString('uk-UA')}
                      </Typography>
                    </Box>

                    {/* Действия */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={notification.is_read ? 'Позначити як непрочитане' : 'Позначити як прочитане'}>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                        >
                          {notification.is_read ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Тот же контент, но с фильтром по непрочитанным */}
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              Немає непрочитаних сповіщень
            </Alert>
          ) : (
            <Box>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ fontSize: '24px', mt: 0.5 }}>
                      {getNotificationIcon(notification.category)}
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {notification.title}
                        </Typography>
                        
                        <Chip
                          label={getCategoryText(notification.category)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getPriorityText(notification.priority)}
                          size="small"
                          sx={{
                            backgroundColor: getNotificationColor(notification.priority),
                            color: 'white'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString('uk-UA')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Позначити як прочитане">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Прочитанные уведомления */}
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              Немає прочитаних сповіщень
            </Alert>
          ) : (
            <Box>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ fontSize: '24px', mt: 0.5, opacity: 0.7 }}>
                      {getNotificationIcon(notification.category)}
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ color: 'text.secondary' }}
                        >
                          {notification.title}
                        </Typography>
                        
                        <Chip
                          label={getCategoryText(notification.category)}
                          size="small"
                          variant="outlined"
                          sx={{ opacity: 0.7 }}
                        />
                        <Chip
                          label={getPriorityText(notification.priority)}
                          size="small"
                          sx={{
                            backgroundColor: getNotificationColor(notification.priority),
                            color: 'white',
                            opacity: 0.7
                          }}
                        />
                      </Box>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, opacity: 0.8 }}
                      >
                        {notification.message}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString('uk-UA')}
                        {notification.read_at && (
                          <span> • Прочитано: {new Date(notification.read_at).toLocaleString('uk-UA')}</span>
                        )}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Позначити як непрочитане">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                        >
                          <RadioButtonUncheckedIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Пагинация */}
        {pagination && pagination.total_pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Pagination
              count={pagination.total_pages}
              page={pagination.current_page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default NotificationCenter; 