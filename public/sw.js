// Service Worker для push-уведомлений
// Tire Service - Система управления шиномонтажом

const CACHE_NAME = 'tire-service-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Установка service worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker установлен');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Кэш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация service worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker активирован');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированную версию или загружаем из сети
        return response || fetch(event.request);
      }
    )
  );
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  console.log('📨 Push уведомление получено:', event);
  
  let notificationData = {
    title: 'Tire Service',
    body: 'У вас новое уведомление',
    icon: '/image/logo-192x192.png',
    badge: '/image/logo-72x72.png',
    data: {
      url: '/'
    }
  };

  // Парсим данные из push уведомления
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('📋 Данные push уведомления:', pushData);
      
      notificationData = {
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        badge: pushData.badge || notificationData.badge,
        data: {
          url: pushData.url || notificationData.data.url,
          booking_id: pushData.booking_id,
          notification_type: pushData.notification_type
        },
        actions: pushData.actions || [],
        requireInteraction: pushData.requireInteraction || false,
        silent: pushData.silent || false
      };
    } catch (error) {
      console.error('❌ Ошибка парсинга push данных:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      tag: `tire-service-${Date.now()}`, // Уникальный тег для каждого уведомления
      renotify: true,
      vibrate: [200, 100, 200] // Вибрация для мобильных устройств
    })
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Клик по уведомлению:', event.notification.data);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Если есть открытые окна, фокусируемся на одном из них
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data
          });
          return;
        }
      }
      
      // Если нет открытых окон, открываем новое
      return clients.openWindow(urlToOpen);
    })
  );
});

// Обработка закрытия уведомления
self.addEventListener('notificationclose', event => {
  console.log('❌ Уведомление закрыто:', event.notification.data);
  
  // Можно отправить аналитику о закрытии уведомления
  // analytics.track('notification_closed', event.notification.data);
});

// Обработка ошибок push уведомлений
self.addEventListener('pushsubscriptionchange', event => {
  console.log('🔄 Push подписка изменена:', event);
  
  event.waitUntil(
    // Здесь можно обновить подписку на сервере
    fetch('/api/v1/push_subscriptions/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_subscription: event.oldSubscription,
        new_subscription: event.newSubscription
      })
    })
  );
});

// Обработка сообщений от основного потока
self.addEventListener('message', event => {
  console.log('💬 Сообщение от основного потока:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker загружен для Tire Service'); 