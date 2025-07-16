// Типы для Telegram интеграции
export interface TelegramSubscription {
  id: number;
  user_id: number;
  chat_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  notification_preferences: TelegramNotificationPreferences;
  status: TelegramSubscriptionStatus;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface TelegramNotificationPreferences {
  booking_created: boolean;
  booking_confirmed: boolean;
  booking_reminder: boolean;
  booking_cancelled: boolean;
  booking_completed: boolean;
  booking_rescheduled: boolean;
  system_notifications: boolean;
  promotional_notifications: boolean;
}

export type TelegramSubscriptionStatus = 'active' | 'inactive' | 'blocked';

export interface TelegramNotification {
  id: number;
  telegram_subscription_id: number;
  chat_id: string;
  message: string;
  notification_type: TelegramNotificationType;
  status: TelegramNotificationStatus;
  retry_count: number;
  telegram_response?: string;
  booking_id?: number;
  created_at: string;
  updated_at: string;
  telegram_subscription?: TelegramSubscription;
  booking?: {
    id: number;
    booking_date: string;
    start_time: string;
    service_point?: {
      id: number;
      name: string;
      address: string;
    };
  };
}

export type TelegramNotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_rescheduled'
  | 'system_notification'
  | 'promotional_notification';

export type TelegramNotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered';

// Запросы для API
export interface TelegramSubscriptionRequest {
  chat_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  notification_preferences?: Partial<TelegramNotificationPreferences>;
}

export interface TelegramSubscriptionUpdateRequest {
  notification_preferences?: Partial<TelegramNotificationPreferences>;
  status?: TelegramSubscriptionStatus;
}

export interface TelegramNotificationRequest {
  message: string;
  notification_type: TelegramNotificationType;
  chat_id?: string;
  user_id?: number;
  booking_id?: number;
}

// Ответы от API
export interface TelegramSubscriptionResponse {
  id: number;
  user_id: number;
  chat_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  notification_preferences: TelegramNotificationPreferences;
  status: TelegramSubscriptionStatus;
  created_at: string;
  updated_at: string;
  telegram_bot_url?: string;
  qr_code_url?: string;
}

export interface TelegramNotificationResponse {
  id: number;
  telegram_subscription_id: number;
  chat_id: string;
  message: string;
  notification_type: TelegramNotificationType;
  status: TelegramNotificationStatus;
  retry_count: number;
  telegram_response?: string;
  booking_id?: number;
  created_at: string;
  updated_at: string;
}

// Статистика для админ-панели
export interface TelegramStatistics {
  total_subscriptions: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  blocked_subscriptions: number;
  total_notifications: number;
  sent_notifications: number;
  failed_notifications: number;
  pending_notifications: number;
  notifications_today: number;
  notifications_this_week: number;
  notifications_this_month: number;
  top_notification_types: {
    type: TelegramNotificationType;
    count: number;
  }[];
}

// Конфигурация бота
export interface TelegramBotConfig {
  bot_token: string;
  bot_username: string;
  webhook_url: string;
  webhook_secret: string;
  is_webhook_set: boolean;
  webhook_info?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
  };
}

// Фильтры для списков
export interface TelegramSubscriptionFilter {
  status?: TelegramSubscriptionStatus;
  user_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface TelegramNotificationFilter {
  status?: TelegramNotificationStatus;
  notification_type?: TelegramNotificationType;
  chat_id?: string;
  booking_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// Компоненты для UI
export interface TelegramConnectionData {
  bot_username: string;
  connection_url: string;
  qr_code_url: string;
  instructions: string;
}

export interface TelegramIntegrationProps {
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  onConnectionSuccess?: (subscription: TelegramSubscription) => void;
  onConnectionError?: (error: string) => void;
  variant?: 'card' | 'inline' | 'modal';
  showQRCode?: boolean;
} 