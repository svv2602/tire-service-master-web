import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Pagination,
  Tooltip,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkAllReadIcon,
  DeleteSweep as DeleteAllIcon,
} from '@mui/icons-material';

import {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationStatsQuery,
  getNotificationIcon,
  getNotificationColor,
  getPriorityText,
  getCategoryText,
  type Notification,
  type NotificationFilters,
} from '../../api/notifications.api';

const NotificationCenter: React.FC = () => {
  // Состояние фильтров
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    per_page: 20,
  });
  
  // Состояния UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // RTK Query хуки
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetNotificationsQuery(filters);
  
  const { data: stats } = useGetNotificationStatsQuery();
  
  const [updateNotification] = useUpdateNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

  // Обработчики действий
  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await updateNotification({
          id: notification.id,
          data: { is_read: true }
        }).unwrap();
      } catch (error) {
        console.error('Ошибка при отметке как прочитанное:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id).unwrap();
      setSelectedNotifications(prev => prev.filter(nId => nId !== id));
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Ошибка при отметке всех как прочитанные:', error);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notificationsData?.notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notificationsData?.notifications.map(n => n.id) || []);
    }
  };

  // Вычисляемые значения
  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;
  const unreadCount = stats?.stats.unread || 0;

  // Состояния загрузки и ошибок
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Ошибка загрузки уведомлений. Попробуйте обновить страницу.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Заголовок и статистика */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsIcon fontSize="large" />
          <Typography variant="h4" component="h1">
            Уведомления
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} непрочитанных`} 
              color="error" 
              size="small" 
            />
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Обновить">
            <IconButton onClick={refetch}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Отметить все как прочитанные">
            <span>
              <IconButton onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                <MarkAllReadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Показать/скрыть фильтры">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Поиск и фильтры */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск по заголовку или сообщению..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            {showFilters && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    fullWidth
                    label="Статус"
                    value={filters.read === undefined ? 'all' : filters.read ? 'read' : 'unread'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('read', 
                        value === 'all' ? undefined : value === 'read'
                      );
                    }}
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="unread">Непрочитанные</MenuItem>
                    <MenuItem value="read">Прочитанные</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    fullWidth
                    label="Категория"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="general">Общее</MenuItem>
                    <MenuItem value="booking">Бронирование</MenuItem>
                    <MenuItem value="system">Система</MenuItem>
                    <MenuItem value="promotion">Акции</MenuItem>
                    <MenuItem value="reminder">Напоминания</MenuItem>
                    <MenuItem value="security">Безопасность</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    fullWidth
                    label="Приоритет"
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="urgent">Срочный</MenuItem>
                    <MenuItem value="high">Высокий</MenuItem>
                    <MenuItem value="normal">Обычный</MenuItem>
                    <MenuItem value="low">Низкий</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Массовые действия */}
      {selectedNotifications.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'action.selected' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography>
                Выбрано: {selectedNotifications.length} уведомлений
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<DeleteAllIcon />}
                  color="error"
                  onClick={() => {
                    selectedNotifications.forEach(id => handleDelete(id));
                    setSelectedNotifications([]);
                  }}
                >
                  Удалить выбранные
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Список уведомлений */}
      <Card>
        <CardContent>
          {notifications.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedNotifications.length === notifications.length}
                  indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < notifications.length}
                  onChange={handleSelectAll}
                />
              }
              label="Выбрать все"
              sx={{ mb: 2 }}
            />
          )}
          
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: notification.is_read ? 'background.paper' : 'action.hover',
                  borderLeft: 4,
                  borderLeftColor: getNotificationColor(notification.priority),
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                  />
                </ListItemIcon>
                
                <ListItemIcon>
                  <Typography fontSize="1.5em">
                    {getNotificationIcon(notification.category)}
                  </Typography>
                </ListItemIcon>
                
                <ListItemText
                  primary={notification.title}
                  secondary={`${notification.message} • ${new Date(notification.created_at).toLocaleString('ru-RU')}`}
                  primaryTypographyProps={{
                    variant: "subtitle1",
                    fontWeight: notification.is_read ? 'normal' : 'bold',
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    color: "text.secondary",
                  }}
                />
                
                {/* Чипы приоритета и категории */}
                <Box display="flex" gap={1} alignItems="center" sx={{ mr: 2 }}>
                  <Chip
                    label={getPriorityText(notification.priority)}
                    size="small"
                    sx={{
                      bgcolor: getNotificationColor(notification.priority),
                      color: 'white',
                    }}
                  />
                  <Chip
                    label={getCategoryText(notification.category)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <ListItemSecondaryAction>
                  <Box display="flex" gap={1}>
                    {!notification.is_read && (
                      <Tooltip title="Отметить как прочитанное">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification)}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {notifications.length === 0 && (
            <Box textAlign="center" py={4}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                Нет уведомлений
              </Typography>
              <Typography color="text.secondary">
                {filters.search || filters.category || filters.priority 
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Новые уведомления появятся здесь'
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {pagination && pagination.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
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
    </Box>
  );
};

export default NotificationCenter; 