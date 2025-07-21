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
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';

interface PushSettings {
  enabled: boolean;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    vapidKey: string;
  };
  serviceWorkerEnabled: boolean;
  testMode: boolean;
  allowedDomains: string[];
}

interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  scope: string;
  version: string;
}

export const PushSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [settings, setSettings] = useState<PushSettings>({
    enabled: false,
    firebaseConfig: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      vapidKey: '',
    },
    serviceWorkerEnabled: false,
    testMode: false,
    allowedDomains: ['localhost:3008', 'tire-service.com'],
  });
  
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    registered: false,
    active: false,
    scope: '',
    version: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Проверка статуса Service Worker
  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const checkServiceWorkerStatus = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setSwStatus({
            registered: true,
            active: !!registration.active,
            scope: registration.scope,
            version: 'v1.0.0', // Можно получить из SW
          });
        }
      } catch (error) {
        console.error('Ошибка проверки Service Worker:', error);
      }
    }
  };

  const handleSettingChange = (field: keyof PushSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFirebaseConfigChange = (field: keyof PushSettings['firebaseConfig'], value: string) => {
    setSettings(prev => ({
      ...prev,
      firebaseConfig: {
        ...prev.firebaseConfig,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // Здесь будет API вызов для сохранения настроек
      // await saveNotificationSettings(settings);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      // Проверяем разрешения
      if (!('Notification' in window)) {
        setTestResult('Браузер не поддерживает уведомления');
        return;
      }

      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        // Отправляем тестовое уведомление
        new Notification('Тестове повідомлення', {
          body: 'Система push-сповіщень працює коректно!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        setTestResult('Тестове повідомлення надіслано успішно!');
      } else {
        setTestResult('Дозвіл на сповіщення не надано');
      }
    } catch (error) {
      setTestResult(`Помилка: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusChip = (status: boolean, trueLabel: string, falseLabel: string) => (
    <Chip
      icon={status ? <CheckIcon /> : <ErrorIcon />}
      label={status ? trueLabel : falseLabel}
      color={status ? 'success' : 'error'}
      size="small"
    />
  );

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
          Управление Firebase конфигурацией и Service Worker для push уведомлений
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
                    {getStatusChip(settings.enabled, 'Включены', 'Отключены')}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Service Worker:</Typography>
                    {getStatusChip(swStatus.registered, 'Зарегистрирован', 'Не зарегистрирован')}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Firebase:</Typography>
                    {getStatusChip(!!settings.firebaseConfig.projectId, 'Настроен', 'Не настроен')}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Тестовый режим:</Typography>
                    {getStatusChip(settings.testMode, 'Включен', 'Отключен')}
                  </Box>
                </Grid>
              </Grid>
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
                    checked={settings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                }
                label="Включить push уведомления"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.serviceWorkerEnabled}
                    onChange={(e) => handleSettingChange('serviceWorkerEnabled', e.target.checked)}
                  />
                }
                label="Использовать Service Worker"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.testMode}
                    onChange={(e) => handleSettingChange('testMode', e.target.checked)}
                  />
                }
                label="Тестовый режим"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Button
                variant="outlined"
                startIcon={testLoading ? <CircularProgress size={20} /> : <TestIcon />}
                onClick={handleTestNotification}
                disabled={testLoading || !settings.enabled}
                fullWidth
              >
                {testLoading ? 'Отправка...' : 'Отправить тестовое уведомление'}
              </Button>

              {testResult && (
                <Alert 
                  severity={testResult.includes('успішно') ? 'success' : 'warning'} 
                  sx={{ mt: 2 }}
                >
                  {testResult}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Firebase конфигурация */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Firebase конфигурация"
              avatar={<FirebaseIcon />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="API Key"
                value={settings.firebaseConfig.apiKey}
                onChange={(e) => handleFirebaseConfigChange('apiKey', e.target.value)}
                type="password"
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Auth Domain"
                value={settings.firebaseConfig.authDomain}
                onChange={(e) => handleFirebaseConfigChange('authDomain', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Project ID"
                value={settings.firebaseConfig.projectId}
                onChange={(e) => handleFirebaseConfigChange('projectId', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Storage Bucket"
                value={settings.firebaseConfig.storageBucket}
                onChange={(e) => handleFirebaseConfigChange('storageBucket', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Messaging Sender ID"
                value={settings.firebaseConfig.messagingSenderId}
                onChange={(e) => handleFirebaseConfigChange('messagingSenderId', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="App ID"
                value={settings.firebaseConfig.appId}
                onChange={(e) => handleFirebaseConfigChange('appId', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="VAPID Key"
                value={settings.firebaseConfig.vapidKey}
                onChange={(e) => handleFirebaseConfigChange('vapidKey', e.target.value)}
                type="password"
                sx={{ mb: 2 }}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Service Worker информация */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Service Worker информация"
              avatar={<ServiceWorkerIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">Статус:</Typography>
                  <Typography variant="body1">
                    {swStatus.active ? 'Активен' : 'Неактивен'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">Область:</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {swStatus.scope || 'Не определена'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">Версия:</Typography>
                  <Typography variant="body1">
                    {swStatus.version || 'Неизвестна'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={checkServiceWorkerStatus}
                  >
                    Обновить статус
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кнопки действий */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </Box>
  );
};

export default PushSettingsPage; 