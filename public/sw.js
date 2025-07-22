// Service Worker для Push уведомлений
const CACHE_NAME = 'tire-service-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Установка Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Ошибка кэширования:', error);
      })
  );
  // Принудительная активация нового SW
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Получение контроля над всеми клиентами
  self.clients.claim();
});

// Обработка fetch запросов (кэширование)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем из кэша если есть, иначе загружаем из сети
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback для offline
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// 🔔 ОСНОВНАЯ ФУНКЦИЯ: Обработка Push уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Получено Push уведомление:', event);
  
  let notificationData = {
    title: 'Новое уведомление',
    body: 'У вас есть новое уведомление от Tire Service',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'tire-service-notification',
    requireInteraction: false,
    actions: []
  };

  // Парсим данные из Push уведомления
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Данные Push уведомления:', data);
      
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || '/',
          bookingId: data.bookingId,
          userId: data.userId,
          timestamp: Date.now()
        }
      };

      // Добавляем действия если есть
      if (data.actions && Array.isArray(data.actions)) {
        notificationData.actions = data.actions;
      }
    } catch (error) {
      console.error('[SW] Ошибка парсинга Push данных:', error);
    }
  }

  // Показываем уведомление
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .then(() => {
        console.log('[SW] Уведомление показано успешно');
      })
      .catch((error) => {
        console.error('[SW] Ошибка показа уведомления:', error);
      })
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Клик по уведомлению:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  // Обработка действий уведомления
  if (event.action) {
    console.log('[SW] Выбрано действие:', event.action);
    
    switch (event.action) {
      case 'view':
        // Открыть страницу просмотра
        break;
      case 'dismiss':
        // Просто закрыть уведомление
        return;
      default:
        break;
    }
  }

  // Открываем или фокусируемся на окне приложения
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Ищем уже открытое окно приложения
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW] Фокусируемся на существующем окне');
            return client.focus().then(() => {
              // Отправляем сообщение для навигации
              return client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
                data: event.notification.data
              });
            });
          }
        }
        
        // Если окно не найдено, открываем новое
        if (self.clients.openWindow) {
          console.log('[SW] Открываем новое окно:', urlToOpen);
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Ошибка обработки клика по уведомлению:', error);
      })
  );
});

// Обработка закрытия уведомления
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Уведомление закрыто:', event.notification.tag);
  
  // Можно отправить аналитику о закрытии уведомления
  event.waitUntil(
    fetch('/api/v1/notifications/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'notification_closed',
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Игнорируем ошибки аналитики
    })
  );
});

// Обработка сообщений от главного потока
self.addEventListener('message', (event) => {
  console.log('[SW] Получено сообщение:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Обработка ошибок
self.addEventListener('error', (event) => {
  console.error('[SW] Ошибка Service Worker:', event.error);
});

// Обработка необработанных отклонений Promise
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Необработанное отклонение Promise:', event.reason);
});

console.log('[SW] Service Worker загружен и готов к работе'); 