import { baseApi } from './baseApi';

// Типы для push-уведомлений
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionRequest {
  subscription: PushSubscriptionData;
  user_agent?: string;
  ip_address?: string;
}

export interface PushSubscriptionResponse {
  id: number;
  endpoint: string;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  booking_id?: number;
  notification_type?: string;
  user_ids?: number[];
  send_to_all?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  require_interaction?: boolean;
  silent?: boolean;
}

export interface PushNotificationResponse {
  id: number;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  booking_id?: number;
  notification_type?: string;
  sent_count: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface VapidKeysResponse {
  public_key: string;
}

// API для push-уведомлений
export const pushNotificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение VAPID публичного ключа
    getVapidPublicKey: builder.query<VapidKeysResponse, void>({
      query: () => ({
        url: 'push_subscriptions/vapid_public_key',
        method: 'GET',
      }),
      providesTags: ['PushSubscription'],
    }),

    // Создание подписки на push-уведомления
    createPushSubscription: builder.mutation<PushSubscriptionResponse, PushSubscriptionRequest>({
      query: (data) => ({
        url: 'push_subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PushSubscription'],
    }),

    // Получение всех подписок пользователя
    getUserPushSubscriptions: builder.query<PushSubscriptionResponse[], void>({
      query: () => ({
        url: 'push_subscriptions',
        method: 'GET',
      }),
      providesTags: ['PushSubscription'],
    }),

    // Обновление подписки
    updatePushSubscription: builder.mutation<PushSubscriptionResponse, { id: number; is_active: boolean }>({
      query: ({ id, ...data }) => ({
        url: `push_subscriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PushSubscription'],
    }),

    // Удаление подписки
    deletePushSubscription: builder.mutation<void, number>({
      query: (id) => ({
        url: `push_subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PushSubscription'],
    }),

    // Отправка push-уведомления (только для админов)
    sendPushNotification: builder.mutation<PushNotificationResponse, PushNotificationRequest>({
      query: (data) => ({
        url: 'push_notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PushNotification'],
    }),

    // Получение истории push-уведомлений
    getPushNotifications: builder.query<PushNotificationResponse[], { page?: number; per_page?: number }>({
      query: (params = {}) => ({
        url: 'push_notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['PushNotification'],
    }),

    // Получение статистики push-уведомлений
    getPushNotificationStats: builder.query<{
      total_notifications: number;
      total_subscriptions: number;
      active_subscriptions: number;
      success_rate: number;
    }, void>({
      query: () => ({
        url: 'push_notifications/stats',
        method: 'GET',
      }),
      providesTags: ['PushNotification'],
    }),

    // Тестовое push-уведомление
    sendTestPushNotification: builder.mutation<PushNotificationResponse, { title?: string; body?: string }>({
      query: (data) => ({
        url: 'push_notifications/test',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PushNotification'],
    }),

    // Обновление подписки при изменении
    refreshPushSubscription: builder.mutation<void, {
      old_subscription: PushSubscriptionData;
      new_subscription: PushSubscriptionData;
    }>({
      query: (data) => ({
        url: 'push_subscriptions/refresh',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PushSubscription'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetVapidPublicKeyQuery,
  useCreatePushSubscriptionMutation,
  useGetUserPushSubscriptionsQuery,
  useUpdatePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
  useSendPushNotificationMutation,
  useGetPushNotificationsQuery,
  useGetPushNotificationStatsQuery,
  useSendTestPushNotificationMutation,
  useRefreshPushSubscriptionMutation,
} = pushNotificationsApi; 