# 🔧 ИНСТРУКЦИЯ ПО ДИАГНОСТИКЕ ПУСТОГО ЭКРАНА

## 🚨 Проблема
- Приложение показывает пустой экран
- В консоли видно только: `[SW] Service Worker загружен и готов к работе`

## 🔍 Пошаговая диагностика

### 1. Проверьте тестовую страницу
Перейдите на: http://localhost:3008/test

**Если тестовая страница загружается:**
- Проблема в конкретных компонентах (PushSubscriptionManager, PWAInstallPrompt)
- Проблема в хуке usePushNotifications

**Если тестовая страница НЕ загружается:**
- Проблема в основном приложении (App.tsx, index.tsx)
- Проблема в TypeScript компиляции

### 2. Откройте консоль браузера (F12)
Проверьте наличие ошибок:
- JavaScript ошибки
- Network ошибки
- TypeScript ошибки

### 3. Проверьте Network вкладку
- Загружаются ли все ресурсы
- Нет ли ошибок 404 для CSS/JS файлов
- Правильно ли загружается index.html

### 4. Временное отключение проблемных компонентов

Если проблема в конкретных компонентах, временно закомментируйте в файлах:

**ClientMainPage.tsx:**
```typescript
// import PWAInstallPrompt from '../../components/pwa/PWAInstallPrompt';
// <PWAInstallPrompt />
```

**ClientProfilePage.tsx:**
```typescript
// import PushSubscriptionManager from '../../components/notifications/PushSubscriptionManager';
// <PushSubscriptionManager ... />
```

**PushSettingsPage.tsx:**
- Проверьте импорты компонентов
- Временно упростите страницу

## 🛠️ Быстрые исправления

### Исправление 1: Перезапуск с очисткой кэша
```bash
cd tire-service-master-web
rm -rf node_modules/.cache
npm start
```

### Исправление 2: Запуск с игнорированием TypeScript ошибок
```bash
TSC_COMPILE_ON_ERROR=true npm start
```

### Исправление 3: Временное отключение Service Worker
Закомментируйте в `public/index.html`:
```html
<!-- <script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker зарегистрирован');
        })
        .catch((error) => {
          console.log('[SW] Ошибка регистрации Service Worker:', error);
        });
    });
  }
</script> -->
```

## 📋 Чек-лист проверки

- [ ] Тестовая страница `/test` загружается
- [ ] Консоль браузера без ошибок
- [ ] Network вкладка без ошибок 404/500
- [ ] Service Worker регистрируется без ошибок
- [ ] TypeScript компилируется без критических ошибок
- [ ] Backend API доступен (http://localhost:8000)

## 🔧 Если ничего не помогает

1. **Полная очистка:**
```bash
cd tire-service-master-web
rm -rf node_modules
rm package-lock.json
npm install
npm start
```

2. **Откат к последнему рабочему коммиту:**
```bash
git log --oneline -10
git checkout <last_working_commit>
```

3. **Создание минимального приложения:**
- Временно замените App.tsx на простейший компонент
- Постепенно добавляйте функциональность

## 📞 Обращение за помощью

При обращении за помощью приложите:
1. Скриншот консоли браузера
2. Вывод команды `npm start`
3. Результат перехода на `/test`
4. Последние изменения в коде 