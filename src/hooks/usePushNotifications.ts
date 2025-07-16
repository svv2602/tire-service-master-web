import { useEffect, useState, useCallback } from 'react';
import { 
  useGetVapidPublicKeyQuery,
  useCreatePushSubscriptionMutation,
  useGetUserPushSubscriptionsQuery,
  useUpdatePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
  PushSubscriptionData
} from '../api/pushNotifications.api';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    permission: 'default',
    isLoading: false,
    error: null,
  });

  const { data: vapidKey } = useGetVapidPublicKeyQuery();
  const { data: userSubscriptions, refetch: refetchSubscriptions } = useGetUserPushSubscriptionsQuery();
  const [createSubscription] = useCreatePushSubscriptionMutation();
  const [updateSubscription] = useUpdatePushSubscriptionMutation();
  const [deleteSubscription] = useDeletePushSubscriptionMutation();

  // Проверка поддержки push-уведомлений
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 
                         'PushManager' in window && 
                         'Notification' in window;
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission: Notification.permission,
      }));
    };

    checkSupport();
  }, []);

  // Регистрация service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker не поддерживается');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('🔧 Service Worker зарегистрирован:', registration);
      
      return registration;
    } catch (error) {
      console.error('❌ Ошибка регистрации Service Worker:', error);
      setState(prev => ({ ...prev, error: 'Не удалось зарегистрировать Service Worker' }));
      return null;
    }
  }, []);

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission;
    } catch (error) {
      console.error('❌ Ошибка запроса разрешения:', error);
      setState(prev => ({ ...prev, error: 'Не удалось получить разрешение на уведомления' }));
      return 'denied';
    }
  }, []);

  // Подписка на push-уведомления
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!vapidKey?.public_key) {
        throw new Error('VAPID ключ не получен');
      }

      // Регистрируем service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Service Worker не зарегистрирован');
      }

      // Запрашиваем разрешение
      const permission = await requestPermission();
      if (permission !== 'granted') {
        throw new Error('Разрешение на уведомления не получено');
      }

      // Создаем подписку
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey.public_key),
      });

      // Отправляем подписку на сервер
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      await createSubscription({
        subscription: subscriptionData,
        user_agent: navigator.userAgent,
        ip_address: undefined, // Будет определен на сервере
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      // Обновляем список подписок
      refetchSubscriptions();

      console.log('✅ Подписка на push-уведомления создана');
      return true;

    } catch (error) {
      console.error('❌ Ошибка подписки:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }));
      return false;
    }
  }, [vapidKey, createSubscription, refetchSubscriptions, registerServiceWorker, requestPermission]);

  // Отписка от push-уведомлений
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Получаем текущую подписку
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Деактивируем все подписки пользователя на сервере
      if (userSubscriptions) {
        await Promise.all(
          userSubscriptions.map(sub => 
            updateSubscription({ id: sub.id, is_active: false })
          )
        );
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      // Обновляем список подписок
      refetchSubscriptions();

      console.log('✅ Отписка от push-уведомлений выполнена');
      return true;

    } catch (error) {
      console.error('❌ Ошибка отписки:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }));
      return false;
    }
  }, [userSubscriptions, updateSubscription, refetchSubscriptions]);

  // Проверка текущего состояния подписки
  const checkSubscription = useCallback(async () => {
    try {
      if (!state.isSupported) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));

    } catch (error) {
      console.error('❌ Ошибка проверки подписки:', error);
    }
  }, [state.isSupported]);

  // Проверяем подписку при изменении поддержки
  useEffect(() => {
    if (state.isSupported) {
      checkSubscription();
    }
  }, [state.isSupported, checkSubscription]);

  // Слушаем сообщения от service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        console.log('🖱️ Уведомление кликнуто:', event.data.data);
        // Здесь можно добавить логику обработки клика
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkSubscription,
    requestPermission,
    userSubscriptions,
  };
};

// Утилитарные функции
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
} 