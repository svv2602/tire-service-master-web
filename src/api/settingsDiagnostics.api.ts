import { baseApi } from './baseApi';

// Интерфейсы для диагностики настроек
export interface SettingDetail {
  key: string;
  configured: boolean;
  type: string;
  description: string;
  is_sensitive: boolean;
}

export interface SettingCategory {
  category: string;
  settings_count: number;
  configured_count: number;
  settings: SettingDetail[];
}

export interface SystemSettingsDiagnostics {
  status: 'configured' | 'not_configured';
  total_settings: number;
  categories: string[];
  categories_count: number;
  configured_settings: number;
  last_updated: string;
  ready_for_production: boolean;
  details: SettingCategory[];
}

export interface EmailSettingsDiagnostics {
  status: 'enabled' | 'disabled';
  configured: boolean;
  ready_for_production: boolean;
  valid_configuration: boolean;
  test_mode: boolean;
  smtp_host: string;
  smtp_port: number | string;
  from_email: string;
  authentication: string;
  last_updated: string;
  issues: string[];
}

export interface PushSettingsDiagnostics {
  status: 'enabled' | 'disabled';
  configured: boolean;
  ready_for_production: boolean;
  valid_configuration: boolean;
  test_mode: boolean;
  vapid_keys: string;
  firebase_config: string;
  daily_limit: number;
  rate_limit: number;
  last_updated: string;
  system_status: string;
  issues: string[];
}

export interface TelegramSettingsDiagnostics {
  status: 'enabled' | 'disabled';
  configured: boolean;
  ready_for_production: boolean;
  valid_configuration: boolean;
  test_mode: boolean;
  bot_token: string;
  bot_username: string;
  webhook_url: string;
  admin_chat_id: string;
  subscriptions_count: number;
  last_updated: string;
  system_status: string;
  issues: string[];
}

export interface GoogleOAuthSettingsDiagnostics {
  status: 'enabled' | 'disabled';
  configured: boolean;
  ready_for_production: boolean;
  valid_configuration: boolean;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  last_updated: string;
  system_status: string;
  issues: string[];
}

export interface NotificationChannel {
  type: string;
  name: string;
  priority: number;
  enabled: boolean;
  daily_limit: number;
  rate_limit_per_minute: number;
  retry_attempts: number;
}

export interface NotificationChannelsDiagnostics {
  total_channels: number;
  enabled_channels: number;
  disabled_channels: number;
  channels_by_priority: NotificationChannel[];
  last_updated: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  component: string;
  message: string;
  action_url: string;
}

export interface OverallStatus {
  status: 'critical' | 'warning' | 'healthy';
  issues_count: number;
  warnings_count: number;
  issues: string[];
  warnings: string[];
  score: number;
  recommendations: Recommendation[];
}

export interface SettingsDiagnosticsResponse {
  diagnostics: {
    system_settings: SystemSettingsDiagnostics;
    email_settings: EmailSettingsDiagnostics;
    push_settings: PushSettingsDiagnostics;
    telegram_settings: TelegramSettingsDiagnostics;
    google_oauth_settings: GoogleOAuthSettingsDiagnostics;
    notification_channels: NotificationChannelsDiagnostics;
    overall_status: OverallStatus;
  };
  generated_at: string;
  server_time: string;
}

// API endpoints
export const settingsDiagnosticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить диагностику всех настроек системы
    getSettingsDiagnostics: builder.query<SettingsDiagnosticsResponse, void>({
      query: () => ({
        url: 'settings_diagnostics',
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),
  }),
});

// Экспортируем сгенерированные хуки
export const { 
  useGetSettingsDiagnosticsQuery,
  useLazyGetSettingsDiagnosticsQuery
} = settingsDiagnosticsApi;