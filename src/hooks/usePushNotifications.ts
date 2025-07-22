import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  error: string | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => void;
}

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isSubscribed: false,
    isLoading: false,
    permission: 'default',
    subscription: null,
    error: null,
  });

  // Проверка текущего состояния при загрузке
  useEffect(() => {
    if (!state.isSupported) return;

    setState(prev => ({ ...prev, permission: Notification.permission }));
    checkSubscriptionStatus();
  }, [state.isSupported]);

  // Проверка статуса подписки
  const checkSubscriptionStatus = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('Service Worker не зарегистрирован');
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка проверки статуса подписки',
      }));
    }
  }, [state.isSupported]);

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push уведомления не поддерживаются' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));
      
      if (permission === 'granted') {
        console.log('Разрешение на уведомления получено');
        return true;
      } else {
        setState(prev => ({ ...prev, error: 'Разрешение на уведомления отклонено' }));
        return false;
      }
    } catch (error) {
      console.error('Ошибка запроса разрешения:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка запроса разрешения на уведомления',
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported]);

  // Подписка на Push уведомления
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      setState(prev => ({ ...prev, error: 'VAPID ключ не настроен' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Регистрируем Service Worker если не зарегистрирован
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('Регистрируем Service Worker...');
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // Создаем подписку
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Отправляем подписку на сервер
      const response = await fetch('/api/v1/push_subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          user_agent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения подписки на сервере');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      console.log('Подписка на Push уведомления успешна');
      return true;
    } catch (error) {
      console.error('Ошибка подписки:', error);
      setState(prev => ({
        ...prev,
        error: `Ошибка подписки: ${error}`,
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // Отписка от Push уведомлений
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Отписываемся локально
      await state.subscription.unsubscribe();

      // Удаляем подписку с сервера
      await fetch('/api/v1/push_subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: state.subscription.endpoint,
        }),
      });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      console.log('Отписка от Push уведомлений успешна');
      return true;
    } catch (error) {
      console.error('Ошибка отписки:', error);
      setState(prev => ({
        ...prev,
        error: `Ошибка отписки: ${error}`,
        isLoading: false,
      }));
      return false;
    }
  }, [state.subscription]);

  // Отправка тестового уведомления
  const sendTestNotification = useCallback(() => {
    if (state.permission !== 'granted') {
      console.warn('Нет разрешения на показ уведомлений');
      return;
    }

    new Notification('Тестовое уведомление', {
      body: 'Это тестовое уведомление от Tire Service',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false,
    });
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};

// Утилитарная функция для конвертации VAPID ключа
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 