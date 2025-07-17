import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Science as TestTubeIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  useSendPushNotificationMutation,
  useGetPushNotificationsQuery,
  useGetPushNotificationStatsQuery,
  useSendTestPushNotificationMutation,
  PushNotificationRequest,
} from '../../../api/pushNotifications.api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const validationSchema = yup.object({
  title: yup.string().required('Заголовок обязателен').max(100, 'Максимум 100 символов'),
  body: yup.string().required('Текст сообщения обязателен').max(300, 'Максимум 300 символов'),
  url: yup.string().url('Неверный формат URL'),
  notification_type: yup.string(),
  booking_id: yup.number().positive('ID бронирования должно быть положительным числом'),
});

export const PushNotificationManager: React.FC = () => {
  const [sendToAll, setSendToAll] = useState(true);
  const [userIds, setUserIds] = useState('');
  const [testMode, setTestMode] = useState(false);

  const [sendNotification, { isLoading: isSending }] = useSendPushNotificationMutation();
  const [sendTestNotification, { isLoading: isSendingTest }] = useSendTestPushNotificationMutation();
  const { data: notifications, refetch: refetchNotifications } = useGetPushNotificationsQuery({ page: 1, per_page: 10 });
  const { data: stats, refetch: refetchStats } = useGetPushNotificationStatsQuery();

  const formik = useFormik({
    initialValues: {
      title: '',
      body: '',
      url: '',
      notification_type: 'general',
      booking_id: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
      try {
        setStatus(null);

        const notificationData: PushNotificationRequest = {
          title: values.title,
          body: values.body,
          url: values.url || undefined,
          notification_type: values.notification_type || undefined,
          booking_id: values.booking_id ? parseInt(values.booking_id) : undefined,
          send_to_all: sendToAll,
          user_ids: sendToAll ? undefined : userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
          icon: '/image/logo-192x192.png',
          badge: '/image/logo-72x72.png',
        };

        if (testMode) {
          await sendTestNotification({
            title: values.title,
            body: values.body,
          });
          setStatus({ type: 'success', message: 'Тестовое уведомление отправлено!' });
        } else {
          await sendNotification(notificationData);
          setStatus({ type: 'success', message: 'Уведомление отправлено!' });
          resetForm();
        }

        // Обновляем статистику и список уведомлений
        refetchStats();
        refetchNotifications();

      } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
        setStatus({ 
          type: 'error', 
          message: 'Ошибка отправки уведомления. Попробуйте еще раз.' 
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleRefresh = () => {
    refetchStats();
    refetchNotifications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsIcon />
        Push-уведомления
        <Tooltip title="Обновить данные">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      {/* Статистика */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon color="primary" />
                  <Typography variant="h6">{stats.total_notifications}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Всего уведомлений
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">{stats.active_subscriptions}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Активных подписок
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">{stats.success_rate.toFixed(1)}%</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Успешность доставки
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="secondary" />
                  <Typography variant="h6">{stats.total_subscriptions}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Всего подписок
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Форма отправки */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Отправить уведомление
              </Typography>

              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="title"
                      label="Заголовок"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                      placeholder="Например: Новое бронирование"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="body"
                      label="Текст сообщения"
                      value={formik.values.body}
                      onChange={formik.handleChange}
                      error={formik.touched.body && Boolean(formik.errors.body)}
                      helperText={formik.touched.body && formik.errors.body}
                      placeholder="Например: У вас новое бронирование на 15:00"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="url"
                      label="URL для перехода (необязательно)"
                      value={formik.values.url}
                      onChange={formik.handleChange}
                      error={formik.touched.url && Boolean(formik.errors.url)}
                      helperText={formik.touched.url && formik.errors.url}
                      placeholder="/admin/bookings/123"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="notification_type"
                      label="Тип уведомления"
                      value={formik.values.notification_type}
                      onChange={formik.handleChange}
                      placeholder="booking, general, promotion"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="booking_id"
                      label="ID бронирования (необязательно)"
                      type="number"
                      value={formik.values.booking_id}
                      onChange={formik.handleChange}
                      error={formik.touched.booking_id && Boolean(formik.errors.booking_id)}
                      helperText={formik.touched.booking_id && formik.errors.booking_id}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Настройки получателей
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sendToAll}
                          onChange={(e) => setSendToAll(e.target.checked)}
                        />
                      }
                      label="Отправить всем пользователям"
                    />

                    {!sendToAll && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="ID пользователей (через запятую)"
                        value={userIds}
                        onChange={(e) => setUserIds(e.target.value)}
                        placeholder="1, 2, 3, 4"
                        sx={{ mt: 2 }}
                      />
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={testMode}
                          onChange={(e) => setTestMode(e.target.checked)}
                        />
                      }
                      label="Тестовый режим (только текущему пользователю)"
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={testMode ? <TestTubeIcon /> : <SendIcon />}
                      disabled={isSending || isSendingTest}
                      sx={{ mr: 2 }}
                    >
                      {isSending || isSendingTest ? (
                        <CircularProgress size={20} />
                      ) : (
                        testMode ? 'Отправить тест' : 'Отправить уведомление'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {formik.status && (
                <Alert 
                  severity={formik.status.type} 
                  sx={{ mt: 2 }}
                  onClose={() => formik.setStatus(null)}
                >
                  {formik.status.message}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* История уведомлений */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Последние уведомления
              </Typography>

              {notifications && notifications.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Заголовок</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Время</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {notification.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.body.substring(0, 50)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={notification.status}
                              color={getStatusColor(notification.status)}
                              size="small"
                            />
                            <Typography variant="caption" display="block">
                              {notification.success_count}/{notification.sent_count}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: ru 
                              })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Уведомления еще не отправлялись
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Дополнительная информация */}
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Справочная информация</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>Типы уведомлений:</strong>
          </Typography>
          <ul>
            <li><strong>booking</strong> - уведомления о бронированиях</li>
            <li><strong>general</strong> - общие уведомления</li>
            <li><strong>promotion</strong> - рекламные уведомления</li>
            <li><strong>reminder</strong> - напоминания</li>
          </ul>
          
          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>Советы по составлению уведомлений:</strong>
          </Typography>
          <ul>
            <li>Заголовок должен быть кратким и информативным</li>
            <li>Текст сообщения не должен превышать 300 символов</li>
            <li>Используйте URL для перенаправления на нужную страницу</li>
            <li>Тестируйте уведомления перед массовой отправкой</li>
          </ul>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}; 