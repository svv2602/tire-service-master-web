import { baseApi } from './baseApi';

// Интерфейсы для Telegram настроек
export interface TelegramSettings {
  id: number;
  bot_token: string | null;
  bot_username: string | null;
  webhook_url: string | null;
  admin_chat_id: string | null;
  enabled: boolean;
  test_mode: boolean;
  auto_subscription: boolean;
  welcome_message: string;
  help_message: string;
  error_message: string;
  system_status: string;
  status_color: string;
  status_text: string;
  ready_for_production: boolean;
  valid_configuration: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelegramSubscription {
  id: number;
  chat_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  status: string;
  language_code: string;
  last_interaction_at: string | null;
  notification_preferences: Record<string, boolean>;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramNotification {
  id: number;
  message: string;
  chat_id: string;
  user_id: number;
  booking_id: number | null;
  notification_type: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  telegram_response: Record<string, any> | null;
  message_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramStatistics {
  total_subscriptions: number;
  active_subscriptions: number;
  blocked_subscriptions: number;
  total_notifications: number;
  sent_notifications: number;
  failed_notifications: number;
  pending_notifications: number;
  notifications_by_type: Record<string, number>;
  recent_notifications: TelegramNotification[];
}

export interface UpdateTelegramSettingsRequest {
  bot_token?: string;
  webhook_url?: string;
  admin_chat_id?: string;
  enabled?: boolean;
  test_mode?: boolean;
  auto_subscription?: boolean;
  welcome_message?: string;
  help_message?: string;
  error_message?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  bot_info?: {
    id: number;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
}

export interface SetWebhookResponse {
  success: boolean;
  message: string;
  webhook_url?: string;
}

export interface WebhookInfoResponse {
  success: boolean;
  webhook_info: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    allowed_updates?: string[];
  };
}

export interface TestMessageRequest {
  chat_id: string;
  message: string;
}

export interface TestMessageResponse {
  success: boolean;
  message: string;
  telegram_response?: Record<string, any>;
}

// API endpoints
export const telegramSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение настроек Telegram
    getTelegramSettings: builder.query<{
      telegram_settings: TelegramSettings;
      statistics: TelegramStatistics;
    }, { showFullToken?: boolean }>({
      query: (params = {}) => ({
        url: 'telegram_settings',
        params: params.showFullToken ? { show_full_token: 'true' } : {}
      }),
      providesTags: ['TelegramSettings'],
    }),

    // Обновление настроек Telegram
    updateTelegramSettings: builder.mutation<{
      message: string;
      telegram_settings: TelegramSettings;
    }, UpdateTelegramSettingsRequest>({
      query: (data) => ({
        url: 'telegram_settings',
        method: 'PATCH',
        body: { telegram_settings: data },
      }),
      invalidatesTags: ['TelegramSettings'],
    }),

    // Тестирование подключения к боту
    testTelegramConnection: builder.mutation<TestConnectionResponse, void>({
      query: () => ({
        url: 'telegram_settings/test_connection',
        method: 'POST',
      }),
    }),

    // Получение Chat ID администратора
    getChatId: builder.mutation<{
      success: boolean;
      message: string;
      chat_id?: string;
      user_info?: {
        first_name: string;
        last_name: string;
        username: string;
        message_text: string;
        date: string;
      };
      auto_set?: boolean;
      instruction?: {
        step1: string;
        step2: string;
        step3: string;
      };
    }, void>({
      query: () => ({
        url: 'telegram_settings/get_chat_id',
        method: 'POST',
      }),
      invalidatesTags: ['TelegramSettings'],
    }),

    // Отправка тестового сообщения
    sendTestMessage: builder.mutation<TestMessageResponse, TestMessageRequest>({
      query: (data) => ({
        url: 'telegram_settings/test_message',
        method: 'POST',
        body: data,
      }),
    }),

    // Установка webhook
    setWebhook: builder.mutation<SetWebhookResponse, { webhook_url?: string }>({
      query: (data) => ({
        url: 'telegram_settings/set_webhook',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TelegramSettings'],
    }),

    // Получение информации о webhook
    getWebhookInfo: builder.query<WebhookInfoResponse, void>({
      query: () => 'telegram_settings/webhook_info',
    }),

    // Генерация ngrok webhook URL
    generateNgrokWebhook: builder.mutation<{
      success: boolean;
      webhook_url?: string;
      ngrok_url?: string;
      message: string;
    }, void>({
      query: () => ({
        url: 'telegram_settings/generate_ngrok_webhook',
        method: 'POST',
      }),
    }),

    // Получение подписок
    getTelegramSubscriptions: builder.query<{
      data: TelegramSubscription[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        per_page: number;
      };
    }, {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
    }>({
      query: (params = {}) => ({
        url: 'telegram_subscriptions',
        params,
      }),
      providesTags: ['TelegramSubscriptions'],
    }),

    // Обновление подписки
    updateTelegramSubscription: builder.mutation<TelegramSubscription, {
      id: number;
      data: {
        is_active?: boolean;
        notification_preferences?: Record<string, boolean>;
      };
    }>({
      query: ({ id, data }) => ({
        url: `telegram_subscriptions/${id}`,
        method: 'PATCH',
        body: { telegram_subscription: data },
      }),
      invalidatesTags: ['TelegramSubscriptions'],
    }),

    // Удаление подписки
    deleteTelegramSubscription: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `telegram_subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TelegramSubscriptions'],
    }),

    // Получение уведомлений Telegram
    getTelegramNotifications: builder.query<{
      data: TelegramNotification[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        per_page: number;
      };
    }, {
      page?: number;
      per_page?: number;
      status?: string;
      notification_type?: string;
      chat_id?: string;
    }>({
      query: (params = {}) => ({
        url: 'telegram_notifications',
        params,
      }),
      providesTags: ['TelegramNotifications'],
    }),
  }),
});

// Экспортируем сгенерированные хуки
export const {
  useGetTelegramSettingsQuery,
  useUpdateTelegramSettingsMutation,
  useTestTelegramConnectionMutation,
  useGetChatIdMutation,
  useSendTestMessageMutation,
  useSetWebhookMutation,
  useGetWebhookInfoQuery,
  useGenerateNgrokWebhookMutation,
  useGetTelegramSubscriptionsQuery,
  useUpdateTelegramSubscriptionMutation,
  useDeleteTelegramSubscriptionMutation,
  useGetTelegramNotificationsQuery,
} = telegramSettingsApi; 