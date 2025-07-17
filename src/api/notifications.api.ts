import { baseApi } from './baseApi';

// Типы для уведомлений
export interface Notification {
  id: number;
  title: string;
  message: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'general' | 'booking' | 'system' | 'promotion' | 'reminder' | 'security';
  is_read: boolean;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  action_url?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  recipient_type: string;
  recipient_id: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  today: number;
  this_week: number;
  this_month: number;
  with_actions: number;
  expired: number;
}

export interface NotificationFilters {
  read?: boolean;
  category?: string;
  priority?: string;
  search?: string;
  include_expired?: boolean;
  page?: number;
  per_page?: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
  unread_count: number;
}

// RTK Query API
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить список уведомлений
    getNotifications: builder.query<NotificationResponse, NotificationFilters>({
      query: (filters = {}) => ({
        url: 'notifications',
        params: filters,
      }),
      providesTags: ['Notification'],
    }),

    // Получить уведомление по ID
    getNotificationById: builder.query<{ notification: Notification }, number>({
      query: (id) => `notifications/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Отметить уведомление как прочитанное
    markNotificationAsRead: builder.mutation<{ notification: Notification; message: string }, { id: number; is_read: boolean }>({
      query: ({ id, is_read }) => ({
        url: `notifications/${id}`,
        method: 'PATCH',
        body: { is_read },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Notification', id },
        'Notification',
        'NotificationStats'
      ],
    }),

    // Удалить уведомление
    deleteNotification: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Отметить все уведомления как прочитанные
    markAllNotificationsAsRead: builder.mutation<{ message: string; count: number }, void>({
      query: () => ({
        url: 'notifications/mark_all_as_read',
        method: 'POST',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Получить количество непрочитанных уведомлений
    getUnreadNotificationsCount: builder.query<{ unread_count: number }, void>({
      query: () => 'notifications/unread_count',
      providesTags: ['NotificationStats'],
    }),

    // Очистить прочитанные уведомления
    clearReadNotifications: builder.mutation<{ message: string; count: number }, void>({
      query: () => ({
        url: 'notifications/clear_read',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Получить статистику уведомлений
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => 'notifications/stats',
      providesTags: ['NotificationStats'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetUnreadNotificationsCountQuery,
  useClearReadNotificationsMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;

// Утилиты для UI
export const getNotificationIcon = (category: string): string => {
  const icons: Record<string, string> = {
    booking: '📅',
    system: '⚙️',
    promotion: '🎉',
    reminder: '⏰',
    general: '📢',
    security: '🔒',
  };
  return icons[category] || '📢';
};

export const getNotificationColor = (priority: string): string => {
  const colors: Record<string, string> = {
    urgent: '#f44336',    // красный
    high: '#ff9800',      // оранжевый
    normal: '#2196f3',    // синий
    low: '#4caf50',       // зеленый
  };
  return colors[priority] || '#2196f3';
};

export const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    urgent: 'Терміново',
    high: 'Високий',
    normal: 'Звичайний',
    low: 'Низький',
  };
  return texts[priority] || 'Звичайний';
};

export const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    booking: 'Бронювання',
    system: 'Система',
    promotion: 'Акція',
    reminder: 'Нагадування',
    general: 'Загальне',
    security: 'Безпека',
  };
  return texts[category] || 'Загальне';
}; 