import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  NotificationsActive as PushIcon,
  Settings as SettingsIcon,
  CloudSync as FirebaseIcon,
  Code as ServiceWorkerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Send as TestIcon,
  People as SubscriptionsIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';
import {
  useGetPushSettingsQuery,
  useUpdatePushSettingsMutation,
  useTestPushNotificationMutation,
  useGetPushSubscriptionsQuery,
  type PushSettings,
} from '../../api/pushSettings.api';

export const PushSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  // API хуки
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useGetPushSettingsQuery();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useGetPushSubscriptionsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdatePushSettingsMutation();
  const [testNotification, { isLoading: testLoading }] = useTestPushNotificationMutation();
  
  // Локальное состояние
  const [settings, setSettings] = useState<Partial<PushSettings>>({
    enabled: false,
    firebase_api_key: '',
    firebase_project_id: '',
    firebase_app_id: '',
    service_worker_enabled: false,
    test_mode: false,
    daily_limit: 1000,
    rate_limit_per_minute: 60,
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [subscriptionsDialog, setSubscriptionsDialog] = useState(false);

  // Обновление локального состояния при загрузке данных
  useEffect(() => {
    if (settingsData?.push_settings) {
      const apiSettings = settingsData.push_settings;
      setSettings({
        enabled: apiSettings.enabled,
        firebase_api_key: apiSettings.firebase_api_key,
        firebase_project_id: apiSettings.firebase_project_id,
        firebase_app_id: apiSettings.firebase_app_id,
        service_worker_enabled: apiSettings.service_worker_enabled,
        test_mode: apiSettings.test_mode,
        daily_limit: apiSettings.daily_limit,
        rate_limit_per_minute: apiSettings.rate_limit_per_minute,
      });
    }
  }, [settingsData]);

  const handleSettingChange = (field: keyof PushSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    
    try {
      await updateSettings(settings).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const handleTestNotification = async () => {
    setTestResult(null);
    
    try {
      const result = await testNotification().unwrap();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
      } else {
        setTestResult(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка: ${error.data?.message || error.message}`);
    }
  };

  const getStatusChip = (status: boolean, trueLabel: string, falseLabel: string, color?: 'success' | 'error' | 'warning') => (
    <Chip
      icon={status ? <CheckIcon /> : <ErrorIcon />}
      label={status ? trueLabel : falseLabel}
      color={color || (status ? 'success' : 'error')}
      size="small"
    />
  );

  if (settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (settingsError) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки настроек Push уведомлений
        </Alert>
      </Box>
    );
  }

  const statistics = settingsData?.statistics;
  const serviceWorkerStatus = settingsData?.service_worker_status;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PushIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={tablePageStyles.pageTitle}>
            Настройки Push уведомлений
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Управление VAPID конфигурацией и Service Worker для push уведомлений
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки успешно сохранены!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статус системы */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Статус системы уведомлений"
              avatar={<SettingsIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Push уведомления:</Typography>
                    {getStatusChip(settings.enabled || false, 'Включены', 'Отключены')}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Service Worker:</Typography>
                    {getStatusChip(serviceWorkerStatus?.service_worker_file_exists || false, 'Настроен', 'Не настроен')}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">VAPID ключи:</Typography>
                    {getStatusChip(serviceWorkerStatus?.vapid_configured || false, 'Настроены', 'Не настроены')}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Тестовый режим:</Typography>
                    {getStatusChip(settings.test_mode || false, 'Включен', 'Отключен', 'warning')}
                  </Box>
                </Grid>
              </Grid>
              
              {statistics && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Статистика</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Подписок:</Typography>
                      <Typography variant="h6">{statistics.total_subscriptions}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Активных:</Typography>
                      <Typography variant="h6" color="success.main">{statistics.active_subscriptions}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Отправлено:</Typography>
                      <Typography variant="h6">{statistics.total_sent}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Успешность:</Typography>
                      <Typography variant="h6" color="primary.main">{statistics.success_rate}%</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Основные настройки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Основные настройки"
              avatar={<PushIcon />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled || false}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                }
                label="Включить push уведомления"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.service_worker_enabled || false}
                    onChange={(e) => handleSettingChange('service_worker_enabled', e.target.checked)}
                  />
                }
                label="Использовать Service Worker"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.test_mode || false}
                    onChange={(e) => handleSettingChange('test_mode', e.target.checked)}
                  />
                }
                label="Тестовый режим"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Лимит уведомлений в день"
                type="number"
                value={settings.daily_limit || 1000}
                onChange={(e) => handleSettingChange('daily_limit', parseInt(e.target.value))}
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                fullWidth
                label="Лимит в минуту"
                type="number"
                value={settings.rate_limit_per_minute || 60}
                onChange={(e) => handleSettingChange('rate_limit_per_minute', parseInt(e.target.value))}
                sx={{ mb: 2 }}
                size="small"
              />

              <Divider sx={{ my: 2 }} />

              <Button
                variant="outlined"
                startIcon={testLoading ? <CircularProgress size={20} /> : <TestIcon />}
                onClick={handleTestNotification}
                disabled={testLoading || !settings.enabled}
                fullWidth
                sx={{ mb: 2 }}
              >
                {testLoading ? 'Отправка...' : 'Отправить тестовое уведомление'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<SubscriptionsIcon />}
                onClick={() => setSubscriptionsDialog(true)}
                fullWidth
              >
                Просмотр подписок ({statistics?.total_subscriptions || 0})
              </Button>

              {testResult && (
                <Alert 
                  severity={testResult.includes('✅') ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {testResult}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Firebase/VAPID конфигурация */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Конфигурация уведомлений"
              avatar={<FirebaseIcon />}
            />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                VAPID ключи настраиваются через переменные окружения сервера
              </Alert>
              
              <TextField
                fullWidth
                label="Firebase API Key (опционально)"
                value={settings.firebase_api_key || ''}
                onChange={(e) => handleSettingChange('firebase_api_key', e.target.value)}
                type="password"
                sx={{ mb: 2 }}
                size="small"
                helperText="Для интеграции с Firebase Cloud Messaging"
              />
              
              <TextField
                fullWidth
                label="Firebase Project ID (опционально)"
                value={settings.firebase_project_id || ''}
                onChange={(e) => handleSettingChange('firebase_project_id', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Firebase App ID (опционально)"
                value={settings.firebase_app_id || ''}
                onChange={(e) => handleSettingChange('firebase_app_id', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Текущий VAPID Public Key:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  backgroundColor: theme.palette.grey[100],
                  p: 1,
                  borderRadius: 1
                }}
              >
                {settingsData?.vapid_public_key || 'Не настроен'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Worker информация */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Service Worker статус"
              avatar={<ServiceWorkerIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">VAPID настроен:</Typography>
                    {getStatusChip(serviceWorkerStatus?.vapid_configured || false, 'Да', 'Нет')}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">SW файл:</Typography>
                    {getStatusChip(serviceWorkerStatus?.service_worker_file_exists || false, 'Есть', 'Отсутствует')}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Manifest:</Typography>
                    {getStatusChip(serviceWorkerStatus?.manifest_configured || false, 'Настроен', 'Не настроен')}
                  </Box>
                </Grid>
              </Grid>

              {!serviceWorkerStatus?.vapid_configured && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Для работы Push уведомлений необходимо настроить VAPID ключи в переменных окружения сервера:
                  <br />• VAPID_PUBLIC_KEY
                  <br />• VAPID_PRIVATE_KEY
                  <br />• VAPID_SUBJECT (опционально)
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updating}
          startIcon={updating ? <CircularProgress size={20} /> : <SettingsIcon />}
        >
          {updating ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>

      {/* Диалог подписок */}
      <Dialog open={subscriptionsDialog} onClose={() => setSubscriptionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Push подписки пользователей</DialogTitle>
        <DialogContent>
          {subscriptionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : subscriptionsData?.subscriptions?.length ? (
            <List>
              {subscriptionsData.subscriptions.map((subscription) => (
                <ListItem key={subscription.id} divider>
                  <ListItemText
                    primary={`${subscription.user_name} (${subscription.user_email})`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {subscription.browser} • {subscription.status}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Отправлено: {subscription.notifications_sent} • Успешность: {subscription.success_rate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subscription.endpoint}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      size="small"
                      label={subscription.status}
                      color={subscription.is_active ? 'success' : 'default'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
              Нет активных подписок
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionsDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PushSettingsPage; 