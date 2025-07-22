import { baseApi } from './baseApi';

// Интерфейсы для типизации API
export interface EmailSettings {
  id: number;
  smtp_host: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null; // Маскированный пароль
  smtp_authentication: string | null;
  smtp_starttls_auto: boolean;
  smtp_tls: boolean;
  openssl_verify_mode: string | null;
  from_email: string | null;
  from_name: string | null;
  enabled: boolean;
  test_mode: boolean;
  system_status: string;
  status_color: string;
  status_text: string;
  ready_for_production: boolean;
  valid_configuration: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailStatistics {
  total_sent: number;
  total_failed: number;
  success_rate: number;
  last_sent_at?: string;
}

export interface EmailSettingsResponse {
  email_settings: EmailSettings;
  statistics: EmailStatistics;
}

export interface UpdateEmailSettingsRequest {
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_authentication?: string;
  smtp_starttls_auto?: boolean;
  smtp_tls?: boolean;
  openssl_verify_mode?: string;
  from_email?: string;
  from_name?: string;
  enabled?: boolean;
  test_mode?: boolean;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
  sent_to?: string;
}

// API для Email настроек
export const emailSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение настроек Email
    getEmailSettings: builder.query<EmailSettingsResponse, void>({
      query: () => '/email_settings',
      providesTags: ['Settings'],
    }),

    // Обновление настроек Email
    updateEmailSettings: builder.mutation<
      { message: string; email_settings: EmailSettings },
      UpdateEmailSettingsRequest
    >({
      query: (settings) => ({
        url: '/email_settings',
        method: 'PATCH',
        body: { email_settings: settings },
      }),
      invalidatesTags: ['Settings'],
    }),

    // Отправка тестового письма
    testEmail: builder.mutation<TestEmailResponse, { email?: string }>({
      query: (data) => ({
        url: '/email_settings/test_email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Экспорт хуков
export const {
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useTestEmailMutation,
} = emailSettingsApi; 