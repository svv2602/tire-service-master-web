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
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Send as TestIcon,
  People as SubscriptionsIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
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
    vapid_public_key: '',
    vapid_private_key: '',
    firebase_api_key: '',
    firebase_project_id: '',
    firebase_app_id: '',
    test_mode: false,
    daily_limit: 1000,
    rate_limit: 60,
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [subscriptionsDialog, setSubscriptionsDialog] = useState(false);

  // Обновление локального состояния при загрузке данных
  useEffect(() => {
    if (settingsData?.push_settings) {
      const apiSettings = settingsData.push_settings;
      setSettings({
        enabled: apiSettings.enabled,
        // Если ключи замаскированы (содержат *** или ... или короче полной длины), оставляем поля пустыми для редактирования
        vapid_public_key: (apiSettings.vapid_public_key?.includes('***') || 
                           apiSettings.vapid_public_key?.includes('...') || 
                           (apiSettings.vapid_public_key && apiSettings.vapid_public_key.length < 88) ? '' : apiSettings.vapid_public_key) || '',
        vapid_private_key: (apiSettings.vapid_private_key?.includes('***') || 
                           apiSettings.vapid_private_key?.includes('...') ||
                           (apiSettings.vapid_private_key && apiSettings.vapid_private_key.length < 43) ? '' : apiSettings.vapid_private_key) || '',
        firebase_api_key: (apiSettings.firebase_api_key?.includes('...') ? '' : apiSettings.firebase_api_key) || '',
        firebase_project_id: apiSettings.firebase_project_id || '',
        firebase_app_id: (apiSettings.firebase_app_id?.includes('...') ? '' : apiSettings.firebase_app_id) || '',
        test_mode: apiSettings.test_mode,
        daily_limit: apiSettings.daily_limit,
        rate_limit: apiSettings.rate_limit,
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
    setSaveError(null);
    
    // Валидация VAPID ключей (только если они не сокращенные)
    const vapidPublicKeyRegex = /^[A-Za-z0-9_-]{87}=$/;
    const vapidPrivateKeyRegex = /^[A-Za-z0-9_-]{42}=$/;
    
    const validationErrors = [];
    
    // Валидируем только если ключ не сокращенный (не содержит ... и имеет правильную длину)
    if (settings.vapid_public_key && 
        !settings.vapid_public_key.includes('...') && 
        settings.vapid_public_key.length >= 50 && // Минимальная длина для проверки
        !vapidPublicKeyRegex.test(settings.vapid_public_key)) {
      validationErrors.push('VAPID Public Key должен быть в формате Base64 (87 символов + =)');
    }
    
    if (settings.vapid_private_key && 
        !settings.vapid_private_key.includes('...') && 
        settings.vapid_private_key.length >= 20 && // Минимальная длина для проверки
        !vapidPrivateKeyRegex.test(settings.vapid_private_key)) {
      validationErrors.push('VAPID Private Key должен быть в формате Base64 (42 символа + =)');
    }
    
    if (validationErrors.length > 0) {
      setSaveError('Ошибки валидации: ' + validationErrors.join(', '));
      return;
    }
    
    try {
      // Подготавливаем данные для отправки, исключая пустые значения
      const dataToSend = { ...settings };
      
      // Если поля пустые, не отправляем их (сервер сохранит текущие значения)
      if (!dataToSend.vapid_public_key?.trim()) {
        delete dataToSend.vapid_public_key;
      }
      if (!dataToSend.vapid_private_key?.trim()) {
        delete dataToSend.vapid_private_key;
      }
      if (!dataToSend.firebase_api_key?.trim()) {
        delete dataToSend.firebase_api_key;
      }
      if (!dataToSend.firebase_project_id?.trim()) {
        delete dataToSend.firebase_project_id;
      }
      if (!dataToSend.firebase_app_id?.trim()) {
        delete dataToSend.firebase_app_id;
      }
      
      console.log('🔧 Отправляемые настройки:', dataToSend);
      await updateSettings(dataToSend).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error: any) {
      console.error('❌ Ошибка сохранения настроек:', error);
      
      let errorMessage = 'Произошла ошибка при сохранении настроек';
      
      if (error?.data?.errors) {
        errorMessage = 'Ошибки валидации: ' + error.data.errors.join(', ');
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      setTimeout(() => setSaveError(null), 5000);
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

  const handleGenerateVapidKeys = () => {
    // Генерируем VAPID ключи (в реальном приложении это должно делаться на сервере)
    // Для демонстрации используем фиктивные ключи в правильном формате Base64
    
    // Генерируем публичный ключ (87 символов + '=' = 88 символов)
    // Используем Base64 URL-safe символы: A-Z, a-z, 0-9, -, _
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let publicKey = 'B'; // VAPID public key всегда начинается с 'B'
    for (let i = 1; i < 87; i++) {
      publicKey += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length));
    }
    publicKey += '=';
    
    // Генерируем приватный ключ (42 символа + '=' = 43 символа)
    let privateKey = '';
    for (let i = 0; i < 42; i++) {
      privateKey += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length));
    }
    privateKey += '=';
    
    setSettings(prev => ({
      ...prev,
      vapid_public_key: publicKey,
      vapid_private_key: privateKey
    }));
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
          ✅ Настройки успешно сохранены!
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          ❌ {saveError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статус системы */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Статус системы уведомлений"
              avatar={<SettingsIcon />}
              action={
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={updating}
                  startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                  size="small"
                >
                  {updating ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              }
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
                value={settings.rate_limit || 60}
                onChange={(e) => handleSettingChange('rate_limit', parseInt(e.target.value))}
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
              <Alert severity="success" sx={{ mb: 2 }}>
                VAPID ключи можно настроить через веб-интерфейс или переменные окружения
              </Alert>
              
              <TextField
                fullWidth
                label="VAPID Public Key"
                value={settings.vapid_public_key || ''}
                onChange={(e) => handleSettingChange('vapid_public_key', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                helperText="Публичный VAPID ключ для Push уведомлений (Base64)"
              />
              
              <TextField
                fullWidth
                label="VAPID Private Key"
                value={settings.vapid_private_key || ''}
                onChange={(e) => handleSettingChange('vapid_private_key', e.target.value)}
                type="password"
                sx={{ mb: 2 }}
                size="small"
                helperText="Приватный VAPID ключ (будет замаскирован для безопасности)"
              />

              <Button
                variant="outlined"
                onClick={handleGenerateVapidKeys}
                sx={{ mb: 2 }}
                size="small"
                startIcon={<SettingsIcon />}
              >
                Сгенерировать VAPID ключи
              </Button>

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                💡 <strong>Команда для генерации:</strong><br />
                <Box 
                  component="code" 
                  sx={{ 
                    backgroundColor: theme.palette.grey[800], 
                    color: theme.palette.common.white,
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    display: 'inline-block',
                    my: 1
                  }}
                >
                  npx web-push generate-vapid-keys
                </Box><br />
                Вы можете использовать эту команду в терминале для генерации настоящих VAPID ключей.
              </Alert>

              <Divider sx={{ my: 2 }} />
              
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
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Сохраненный VAPID Public Key:
                </Typography>
                <TextField
                  fullWidth
                  value={settingsData?.push_settings?.vapid_public_key || 'Не настроен'}
                  InputProps={{
                    readOnly: true,
                    style: { 
                      fontFamily: 'monospace', 
                      fontSize: '0.875rem',
                      backgroundColor: theme.palette.grey[50]
                    }
                  }}
                  size="small"
                  multiline
                  rows={2}
                  helperText="Только для чтения - текущий ключ из базы данных"
                />
              </Box>
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