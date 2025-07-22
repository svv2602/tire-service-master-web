import { baseApi } from './baseApi';

// Типы для Push настроек
export interface PushSettings {
  enabled: boolean;
  firebase_api_key: string;
  firebase_project_id: string;
  firebase_app_id: string;
  vapid_configured: boolean;
  vapid_public_key: string;
  service_worker_enabled: boolean;
  test_mode: boolean;
  daily_limit: number;
  rate_limit_per_minute: number;
  system_status: string;
  status_color: 'success' | 'warning' | 'error' | 'default';
  ready_for_production: boolean;
}

export interface PushSubscription {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  endpoint: string;
  browser: string;
  is_active: boolean;
  status: string;
  notifications_sent: number;
  notifications_failed: number;
  success_rate: number;
  last_used_at: string | null;
  created_at: string;
}

export interface PushStatistics {
  total_subscriptions: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  stale_subscriptions: number;
  total_sent: number;
  total_failed: number;
  success_rate: number;
  browsers: Record<string, number>;
}

export interface ServiceWorkerStatus {
  vapid_configured: boolean;
  service_worker_file_exists: boolean;
  manifest_configured: boolean;
}

export interface PushSettingsResponse {
  push_settings: PushSettings;
  statistics: PushStatistics;
  vapid_public_key: string;
  service_worker_status: ServiceWorkerStatus;
}

export interface PushSubscriptionsResponse {
  subscriptions: PushSubscription[];
  total_count: number;
  active_count: number;
}

export interface TestNotificationResponse {
  success: boolean;
  message: string;
}

// API для Push настроек
export const pushSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение настроек Push уведомлений
    getPushSettings: builder.query<PushSettingsResponse, void>({
      query: () => '/push_settings',
      providesTags: ['Settings'],
    }),

    // Обновление настроек Push уведомлений
    updatePushSettings: builder.mutation<
      { message: string; push_settings: PushSettings },
      Partial<PushSettings>
    >({
      query: (settings) => ({
        url: '/push_settings',
        method: 'PATCH',
        body: { push_settings: settings },
      }),
      invalidatesTags: ['Settings'],
    }),

    // Отправка тестового уведомления
    testPushNotification: builder.mutation<TestNotificationResponse, void>({
      query: () => ({
        url: '/push_settings/test_notification',
        method: 'POST',
      }),
    }),

    // Получение списка подписок
    getPushSubscriptions: builder.query<PushSubscriptionsResponse, void>({
      query: () => '/push_settings/subscriptions',
      providesTags: ['Settings'],
    }),
  }),
});

// Экспортируем хуки
export const {
  useGetPushSettingsQuery,
  useUpdatePushSettingsMutation,
  useTestPushNotificationMutation,
  useGetPushSubscriptionsQuery,
} = pushSettingsApi; 