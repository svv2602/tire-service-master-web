import { baseApi } from './baseApi';
import { ApiResponse } from '../types/models';
import {
  TelegramSubscription,
  TelegramNotification,
  TelegramSubscriptionRequest,
  TelegramSubscriptionUpdateRequest,
  TelegramNotificationRequest,
  TelegramSubscriptionResponse,
  TelegramNotificationResponse,
  TelegramStatistics,
  TelegramBotConfig,
  TelegramSubscriptionFilter,
  TelegramNotificationFilter,
  TelegramConnectionData
} from '../types/telegram';

// API для Telegram интеграции
export const telegramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение данных для подключения к боту
    getTelegramConnectionData: builder.query<TelegramConnectionData, void>({
      query: () => ({
        url: 'telegram_subscriptions/connection_data',
        method: 'GET',
      }),
    }),

    // Получение подписок Telegram для текущего пользователя
    getUserTelegramSubscriptions: builder.query<TelegramSubscription[], void>({
      query: () => ({
        url: 'telegram_subscriptions',
        method: 'GET',
      }),
      providesTags: ['TelegramSubscription'],
    }),

    // Получение всех подписок Telegram (для админов)
    getAllTelegramSubscriptions: builder.query<ApiResponse<TelegramSubscription>, TelegramSubscriptionFilter>({
      query: (params = {}) => ({
        url: 'telegram_subscriptions/all',
        method: 'GET',
        params,
      }),
      providesTags: ['TelegramSubscription'],
    }),

    // Получение подписки по ID
    getTelegramSubscriptionById: builder.query<TelegramSubscription, number>({
      query: (id) => ({
        url: `telegram_subscriptions/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'TelegramSubscription', id }],
    }),

    // Создание подписки Telegram
    createTelegramSubscription: builder.mutation<TelegramSubscriptionResponse, TelegramSubscriptionRequest>({
      query: (data) => ({
        url: 'telegram_subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TelegramSubscription'],
    }),

    // Обновление подписки Telegram
    updateTelegramSubscription: builder.mutation<TelegramSubscriptionResponse, { id: number; data: TelegramSubscriptionUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `telegram_subscriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TelegramSubscription', id },
        'TelegramSubscription',
      ],
    }),

    // Удаление подписки Telegram
    deleteTelegramSubscription: builder.mutation<void, number>({
      query: (id) => ({
        url: `telegram_subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TelegramSubscription', id },
        'TelegramSubscription',
      ],
    }),

    // Активация/деактивация подписки
    toggleTelegramSubscription: builder.mutation<TelegramSubscriptionResponse, { id: number; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `telegram_subscriptions/${id}/toggle`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TelegramSubscription', id },
        'TelegramSubscription',
      ],
    }),

    // Получение уведомлений Telegram
    getTelegramNotifications: builder.query<ApiResponse<TelegramNotification>, TelegramNotificationFilter>({
      query: (params = {}) => ({
        url: 'telegram_notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['TelegramNotification'],
    }),

    // Получение уведомления по ID
    getTelegramNotificationById: builder.query<TelegramNotification, number>({
      query: (id) => ({
        url: `telegram_notifications/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'TelegramNotification', id }],
    }),

    // Отправка Telegram уведомления
    sendTelegramNotification: builder.mutation<TelegramNotificationResponse, TelegramNotificationRequest>({
      query: (data) => ({
        url: 'telegram_notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TelegramNotification'],
    }),

    // Массовая отправка уведомлений
    sendBulkTelegramNotifications: builder.mutation<{ sent: number; failed: number; results: TelegramNotificationResponse[] }, {
      message: string;
      notification_type: string;
      user_ids?: number[];
      filters?: TelegramSubscriptionFilter;
    }>({
      query: (data) => ({
        url: 'telegram_notifications/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TelegramNotification'],
    }),

    // Повторная отправка неудачного уведомления
    retryTelegramNotification: builder.mutation<TelegramNotificationResponse, number>({
      query: (id) => ({
        url: `telegram_notifications/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TelegramNotification', id },
        'TelegramNotification',
      ],
    }),

    // Получение статистики Telegram
    getTelegramStatistics: builder.query<TelegramStatistics, void>({
      query: () => ({
        url: 'telegram_subscriptions/statistics',
        method: 'GET',
      }),
      providesTags: ['TelegramStatistics'],
    }),

    // Получение конфигурации бота (для админов)
    getTelegramBotConfig: builder.query<TelegramBotConfig, void>({
      query: () => ({
        url: 'telegram_webhook/config',
        method: 'GET',
      }),
    }),

    // Обновление конфигурации бота
    updateTelegramBotConfig: builder.mutation<TelegramBotConfig, Partial<TelegramBotConfig>>({
      query: (data) => ({
        url: 'telegram_webhook/config',
        method: 'PATCH',
        body: data,
      }),
    }),

    // Установка webhook
    setTelegramWebhook: builder.mutation<{ success: boolean; message: string }, { url: string }>({
      query: (data) => ({
        url: 'telegram_webhook/set_webhook',
        method: 'POST',
        body: data,
      }),
    }),

    // Удаление webhook
    deleteTelegramWebhook: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: 'telegram_webhook/delete_webhook',
        method: 'DELETE',
      }),
    }),

    // Получение информации о webhook
    getTelegramWebhookInfo: builder.query<{
      url: string;
      has_custom_certificate: boolean;
      pending_update_count: number;
      last_error_date?: number;
      last_error_message?: string;
    }, void>({
      query: () => ({
        url: 'telegram_webhook/webhook_info',
        method: 'GET',
      }),
    }),

    // Тестирование подключения к боту
    testTelegramBot: builder.mutation<{ success: boolean; message: string; bot_info?: any }, void>({
      query: () => ({
        url: 'telegram_webhook/test_bot',
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetTelegramConnectionDataQuery,
  useGetUserTelegramSubscriptionsQuery,
  useGetAllTelegramSubscriptionsQuery,
  useGetTelegramSubscriptionByIdQuery,
  useCreateTelegramSubscriptionMutation,
  useUpdateTelegramSubscriptionMutation,
  useDeleteTelegramSubscriptionMutation,
  useToggleTelegramSubscriptionMutation,
  useGetTelegramNotificationsQuery,
  useGetTelegramNotificationByIdQuery,
  useSendTelegramNotificationMutation,
  useSendBulkTelegramNotificationsMutation,
  useRetryTelegramNotificationMutation,
  useGetTelegramStatisticsQuery,
  useGetTelegramBotConfigQuery,
  useUpdateTelegramBotConfigMutation,
  useSetTelegramWebhookMutation,
  useDeleteTelegramWebhookMutation,
  useGetTelegramWebhookInfoQuery,
  useTestTelegramBotMutation,
} = telegramApi; 