import { baseApi } from './baseApi';

// Интерфейсы для Google OAuth настроек
export interface GoogleOauthSettings {
  id: number;
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  enabled: boolean;
  allow_registration: boolean;
  auto_verify_email: boolean;
  scopes_list?: string;
  scopes_array: string[];
  system_status: string;
  status_color: string;
  status_text: string;
  ready_for_production: boolean;
  valid_configuration: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoogleOauthStatistics {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  success_rate: number;
  last_login_at?: string;
}

export interface GoogleOauthSettingsResponse {
  google_oauth_settings: GoogleOauthSettings;
  statistics: GoogleOauthStatistics;
}

export interface UpdateGoogleOauthSettingsRequest {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  enabled?: boolean;
  allow_registration?: boolean;
  auto_verify_email?: boolean;
  scopes_list?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  authorization_url?: string;
  test_state?: string;
}

export interface AuthorizationUrlResponse {
  authorization_url: string;
  state: string;
}

// API для Google OAuth настроек
export const googleOauthSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение настроек Google OAuth
    getGoogleOauthSettings: builder.query<GoogleOauthSettingsResponse, void>({
      query: () => '/google_oauth_settings',
      providesTags: ['Settings'],
    }),

    // Обновление настроек Google OAuth
    updateGoogleOauthSettings: builder.mutation<
      { message: string; google_oauth_settings: GoogleOauthSettings },
      UpdateGoogleOauthSettingsRequest
    >({
      query: (settings) => ({
        url: '/google_oauth_settings',
        method: 'PATCH',
        body: { google_oauth_settings: settings },
      }),
      invalidatesTags: ['Settings'],
    }),

    // Тестирование подключения
    testGoogleOauthConnection: builder.mutation<TestConnectionResponse, void>({
      query: () => ({
        url: '/google_oauth_settings/test_connection',
        method: 'POST',
      }),
    }),

    // Получение URL авторизации
    getGoogleAuthorizationUrl: builder.query<AuthorizationUrlResponse, { state?: string }>({
      query: (params) => ({
        url: '/google_oauth_settings/authorization_url',
        params,
      }),
    }),
  }),
});

// Экспорт хуков
export const {
  useGetGoogleOauthSettingsQuery,
  useUpdateGoogleOauthSettingsMutation,
  useTestGoogleOauthConnectionMutation,
  useGetGoogleAuthorizationUrlQuery,
} = googleOauthSettingsApi; 