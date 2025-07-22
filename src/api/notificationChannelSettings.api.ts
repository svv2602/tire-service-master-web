import { baseApi } from './baseApi';

// Интерфейсы для типизации API
export interface NotificationChannelSetting {
  id: number;
  channel_type: 'email' | 'push' | 'telegram';
  enabled: boolean;
  priority: number;
  retry_attempts: number;
  retry_delay: number;
  daily_limit: number;
  rate_limit_per_minute: number;
  created_at: string;
  updated_at: string;
  channel_name: string;
  status_text: string;
  status_color: 'success' | 'error';
  priority_text: string;
}

export interface ChannelStatistics {
  email: {
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;
    delivery_rate: number;
  };
  push: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
    delivery_rate: number;
  };
  telegram: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    delivery_rate: number;
    active_subscribers: number;
  };
}

export interface ChannelPerformanceMetrics {
  last_24h: {
    email: { sent: number; delivered: number; failed: number };
    push: { sent: number; delivered: number; failed: number };
    telegram: { sent: number; delivered: number; failed: number };
  };
  last_hour: {
    email: { sent: number; delivered: number; failed: number };
    push: { sent: number; delivered: number; failed: number };
    telegram: { sent: number; delivered: number; failed: number };
  };
}

export interface NotificationChannelSettingsResponse {
  settings: NotificationChannelSetting[];
  statistics: ChannelStatistics;
  summary: {
    total_channels: number;
    enabled_channels: number;
    disabled_channels: number;
  };
}

export interface UpdateChannelSettingRequest {
  enabled?: boolean;
  priority?: number;
  retry_attempts?: number;
  retry_delay?: number;
  daily_limit?: number;
  rate_limit_per_minute?: number;
}

export interface BulkUpdateRequest {
  settings: {
    [key: string]: UpdateChannelSettingRequest;
  };
}

export interface StatisticsResponse {
  statistics: ChannelStatistics;
  performance: ChannelPerformanceMetrics;
}

// API endpoints
export const notificationChannelSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить все настройки каналов
    getNotificationChannelSettings: builder.query<NotificationChannelSettingsResponse, void>({
      query: () => ({
        url: 'notification_channel_settings',
        method: 'GET',
      }),
      providesTags: ['NotificationChannelSettings'],
    }),

    // Получить настройки конкретного канала
    getChannelSetting: builder.query<NotificationChannelSetting, string>({
      query: (channelType) => ({
        url: `notification_channel_settings/${channelType}`,
        method: 'GET',
      }),
      providesTags: (result, error, channelType) => [
        { type: 'NotificationChannelSettings', id: channelType },
      ],
    }),

    // Обновить настройки канала
    updateChannelSetting: builder.mutation<
      { setting: NotificationChannelSetting; message: string },
      { channelType: string; data: UpdateChannelSettingRequest }
    >({
      query: ({ channelType, data }) => ({
        url: `notification_channel_settings/${channelType}`,
        method: 'PATCH',
        body: { notification_channel_setting: data },
      }),
      invalidatesTags: ['NotificationChannelSettings'],
    }),

    // Массовое обновление настроек всех каналов
    bulkUpdateChannelSettings: builder.mutation<
      { settings: NotificationChannelSetting[]; message: string },
      BulkUpdateRequest
    >({
      query: (data) => ({
        url: 'notification_channel_settings/bulk_update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationChannelSettings'],
    }),

    // Получить статистику каналов
    getChannelStatistics: builder.query<StatisticsResponse, void>({
      query: () => ({
        url: 'notification_channel_settings/statistics',
        method: 'GET',
      }),
      providesTags: ['ChannelStatistics'],
    }),
  }),
});

// Экспортируем хуки
export const {
  useGetNotificationChannelSettingsQuery,
  useGetChannelSettingQuery,
  useUpdateChannelSettingMutation,
  useBulkUpdateChannelSettingsMutation,
  useGetChannelStatisticsQuery,
} = notificationChannelSettingsApi; 