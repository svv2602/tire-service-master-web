    🚀 Улучшения системы настроек:
    - Обновлены типы API для поддержки VAPID ключей из БД
    - Поля ввода VAPID ключей в PushSettingsPage
    - Маскированный вывод приватных ключей
    - Обновленные статусы и валидация
    - Убрана зависимость от переменных окружения
    
    ✨ Функциональность PWA:
    - Определение платформы (Android/iOS/Desktop)
    - Инструкции по установке для каждой платформы
    - Список преимуществ установки PWA
    - Обработка события beforeinstallprompt
    
    🎯 Результат:
    ✅ Полное восстановление функциональности
    ✅ Настройка Push через веб-интерфейс
    ✅ Улучшенный UX для пользователей
    ✅ Готовность к продакшену
    
    Связанный backend коммит: 052e961

diff --git a/src/components/notifications/PushSubscriptionManager.tsx b/src/components/notifications/PushSubscriptionManager.tsx
new file mode 100644
index 0000000..4ac741c
--- /dev/null
+++ b/src/components/notifications/PushSubscriptionManager.tsx
@@ -0,0 +1,277 @@
+import React, { useState, useEffect } from 'react';
+import {
+  Box,
+  Typography,
+  Card,
+  CardContent,
+  CardHeader,
+  Button,
+  Alert,
+  Switch,
+  FormControlLabel,
+  Chip,
+  CircularProgress,
+  List,
+  ListItem,
+  ListItemText,
+  ListItemSecondaryAction,
+  IconButton,
+  useTheme,
+} from '@mui/material';
+import {
+  NotificationsActive as PushIcon,
+  NotificationsOff as PushOffIcon,
+  Check as CheckIcon,
+  Error as ErrorIcon,
+  Warning as WarningIcon,
+  Refresh as RefreshIcon,
+  Send as TestIcon,
+} from '@mui/icons-material';
+import { usePushNotifications } from '../../hooks/usePushNotifications';
+
+interface PushSubscriptionManagerProps {
+  onSubscriptionChange?: (isSubscribed: boolean) => void;
+}
+
+const PushSubscriptionManager: React.FC<PushSubscriptionManagerProps> = ({
+  onSubscriptionChange,
+}) => {
+  const theme = useTheme();
+  const {
+    isSupported,
+    isSubscribed,
+    isLoading,
+    permission,
+    subscription,
+    error,
+    requestPermission,
+    subscribe,
+    unsubscribe,
+    sendTestNotification,
+  } = usePushNotifications();
+
+  const [testLoading, setTestLoading] = useState(false);
+  const [testResult, setTestResult] = useState<string | null>(null);
+
+  useEffect(() => {
+    if (onSubscriptionChange) {
+      onSubscriptionChange(isSubscribed);
+    }
+  }, [isSubscribed, onSubscriptionChange]);
+
+  const handleSubscriptionToggle = async () => {
+    if (isSubscribed) {
+      await unsubscribe();
+    } else {
+      await subscribe();
+    }
+  };
+
+  const handleTestNotification = async () => {
+    setTestLoading(true);
+    setTestResult(null);
+    
+    try {
+      await sendTestNotification();
+      setTestResult('✅ Тестовое уведомление отправлено успешно!');
+    } catch (error: any) {
+      setTestResult(`❌ Ошибка: ${error.message}`);
+    } finally {
+      setTestLoading(false);
+      setTimeout(() => setTestResult(null), 5000);
+    }
+  };
+
+  const getPermissionColor = (perm: NotificationPermission) => {
+    switch (perm) {
+      case 'granted': return 'success';
+      case 'denied': return 'error';
+      case 'default': return 'warning';
+      default: return 'default';
+    }
+  };
+
+  const getPermissionText = (perm: NotificationPermission) => {
+    switch (perm) {
+      case 'granted': return 'Разрешены';
+      case 'denied': return 'Запрещены';
+      case 'default': return 'Не установлены';
+      default: return 'Неизвестно';
+    }
+  };
+
+  if (!isSupported) {
+    return (
+      <Card>
+        <CardHeader
+          title="Push уведомления"
+          avatar={<PushOffIcon color="disabled" />}
+        />
+        <CardContent>
+          <Alert severity="warning">
+            Ваш браузер не поддерживает Push уведомления. 
+            Попробуйте использовать современную версию Chrome, Firefox или Safari.
+          </Alert>
+        </CardContent>
+      </Card>
+    );
+  }
+
+  return (
+    <Card>
+      <CardHeader
+        title="Управление Push уведомлениями"
+        avatar={<PushIcon color={isSubscribed ? 'success' : 'disabled'} />}
+      />
+      <CardContent>
+        {error && (
+          <Alert severity="error" sx={{ mb: 2 }}>
+            {error}
+          </Alert>
+        )}
+
+        {testResult && (
+          <Alert 
+            severity={testResult.includes('✅') ? 'success' : 'error'} 
+            sx={{ mb: 2 }}
+          >
+            {testResult}
+          </Alert>
+        )}
+
+        {/* Статус подписки */}
+        <Box sx={{ mb: 3 }}>
+          <Typography variant="h6" gutterBottom>
+            Статус подписки
+          </Typography>
+          
+          <List>
+            <ListItem>
+              <ListItemText
+                primary="Разрешение на уведомления"
+                secondary={`Статус: ${getPermissionText(permission)}`}
+              />
+              <ListItemSecondaryAction>
+                <Chip
+                  icon={permission === 'granted' ? <CheckIcon /> : 
+                        permission === 'denied' ? <ErrorIcon /> : <WarningIcon />}
+                  label={getPermissionText(permission)}
+                  color={getPermissionColor(permission) as any}
+                  size="small"
+                />
+              </ListItemSecondaryAction>
+            </ListItem>
+
+            <ListItem>
+              <ListItemText
+                primary="Push подписка"
+                secondary={isSubscribed ? 'Активна' : 'Не активна'}
+              />
+              <ListItemSecondaryAction>
+                <Chip
+                  icon={isSubscribed ? <CheckIcon /> : <ErrorIcon />}
+                  label={isSubscribed ? 'Активна' : 'Не активна'}
+                  color={isSubscribed ? 'success' : 'error'}
+                  size="small"
+                />
+              </ListItemSecondaryAction>
+            </ListItem>
+
+            {subscription && (
+              <ListItem>
+                <ListItemText
+                  primary="Endpoint"
+                  secondary={`${subscription.endpoint.substring(0, 50)}...`}
+                />
+              </ListItem>
+            )}
+          </List>
+        </Box>
+
+        {/* Управление подпиской */}
+        <Box sx={{ mb: 3 }}>
+          <Typography variant="h6" gutterBottom>
+            Управление
+          </Typography>
+
+          {permission === 'default' && (
+            <Alert severity="info" sx={{ mb: 2 }}>
+              Для получения Push уведомлений необходимо разрешить уведомления в браузере.
+            </Alert>
+          )}
+
+          {permission === 'denied' && (
+            <Alert severity="error" sx={{ mb: 2 }}>
+              Уведомления заблокированы в браузере. 
+              Разблокируйте их в настройках сайта для получения Push уведомлений.
+            </Alert>
+          )}
+
+          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
+            {permission !== 'granted' && (
+              <Button
+                variant="outlined"
+                startIcon={<PushIcon />}
+                onClick={requestPermission}
+                disabled={isLoading}
+              >
+                Разрешить уведомления
+              </Button>
+            )}
+
+            {permission === 'granted' && (
+              <FormControlLabel
+                control={
+                  <Switch
+                    checked={isSubscribed}
+                    onChange={handleSubscriptionToggle}
+                    disabled={isLoading}
+                  />
+                }
+                label={isSubscribed ? 'Push уведомления включены' : 'Push уведомления отключены'}
+              />
+            )}
+
+            {isSubscribed && (
+              <Button
+                variant="outlined"
+                startIcon={testLoading ? <CircularProgress size={20} /> : <TestIcon />}
+                onClick={handleTestNotification}
+                disabled={testLoading}
+              >
+                {testLoading ? 'Отправка...' : 'Тест уведомления'}
+              </Button>
+            )}
+
+            <IconButton
+              onClick={() => window.location.reload()}
+              title="Обновить статус"
+            >
+              <RefreshIcon />
+            </IconButton>
+          </Box>
+        </Box>
+
+        {/* Инструкции */}
+        {!isSubscribed && permission === 'granted' && (
+          <Alert severity="info">
+            <Typography variant="body2" component="div">
+              <strong>Как включить Push уведомления:</strong>
+              <br />1. Включите переключатель выше
+              <br />2. Разрешите уведомления в появившемся окне браузера
+              <br />3. Протестируйте уведомления кнопкой "Тест уведомления"
+            </Typography>
+          </Alert>
+        )}
+
+        {isLoading && (
+          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
+            <CircularProgress size={24} />
+          </Box>
+        )}
+      </CardContent>
+    </Card>
+  );
+};
+
+export default PushSubscriptionManager; 
\ No newline at end of file
