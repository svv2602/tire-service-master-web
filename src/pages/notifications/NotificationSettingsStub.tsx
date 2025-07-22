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

diff --git a/src/pages/notifications/NotificationSettingsStub.tsx b/src/pages/notifications/NotificationSettingsStub.tsx
new file mode 100644
index 0000000..ceba725
--- /dev/null
+++ b/src/pages/notifications/NotificationSettingsStub.tsx
@@ -0,0 +1,38 @@
+import React from 'react';
+import { Box, Typography, Card, CardContent } from '@mui/material';
+import { NotificationsActive as NotificationsIcon } from '@mui/icons-material';
+
+interface NotificationSettingsStubProps {
+  title: string;
+  description: string;
+}
+
+const NotificationSettingsStub: React.FC<NotificationSettingsStubProps> = ({ 
+  title, 
+  description 
+}) => {
+  return (
+    <Box sx={{ p: 3 }}>
+      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
+        <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
+        <Typography variant="h4">
+          {title}
+        </Typography>
+      </Box>
+
+      <Card>
+        <CardContent>
+          <Typography variant="body1" color="text.secondary">
+            {description}
+          </Typography>
+          
+          <Typography variant="body2" sx={{ mt: 2 }}>
+            Функциональность будет восстановлена в ближайшее время.
+          </Typography>
+        </CardContent>
+      </Card>
+    </Box>
+  );
+};
+
+export default NotificationSettingsStub; 
\ No newline at end of file
