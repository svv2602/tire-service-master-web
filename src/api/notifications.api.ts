import { baseApi } from './baseApi';

// Интерфейсы для уведомлений
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'booking' | 'system' | 'promotion' | 'reminder' | 'security';
  is_read: boolean;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  action_url?: string;
  expires_at?: string;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  read?: boolean;
  category?: string;
  priority?: string;
  search?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface NotificationStats {
  stats: {
    total: number;
    unread: number;
    read: number;
    sent: number;
    urgent: number;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
  };
  recent_activity: {
    today: number;
    this_week: number;
  };
}

export interface CreateNotificationData {
  notification_type_id: number;
  title: string;
  message: string;
  priority: string;
  category: string;
  action_url?: string;
  expires_at?: string;
}

export interface UpdateNotificationData {
  is_read: boolean;
}

// RTK Query API
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка уведомлений с фильтрацией
    getNotifications: builder.query<NotificationResponse, NotificationFilters>({
      query: (filters = {}) => ({
        url: 'notifications',
        params: filters,
      }),
      providesTags: ['Notification'],
    }),

    // Получение одного уведомления
    getNotification: builder.query<Notification, number>({
      query: (id) => `notifications/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Создание уведомления
    createNotification: builder.mutation<Notification, CreateNotificationData>({
      query: (data) => ({
        url: 'notifications',
        method: 'POST',
        body: { notification: data },
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Обновление уведомления (отметка как прочитанное)
    updateNotification: builder.mutation<Notification, { id: number; data: UpdateNotificationData }>({
      query: ({ id, data }) => ({
        url: `notifications/${id}`,
        method: 'PATCH',
        body: { notification: data },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Notification', id },
        'Notification',
        'NotificationStats',
      ],
    }),

    // Удаление уведомления
    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Отметить все как прочитанные
    markAllAsRead: builder.mutation<{ message: string; marked_count: number }, void>({
      query: () => ({
        url: 'notifications/mark_all_as_read',
        method: 'POST',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Массовое удаление
    deleteAllNotifications: builder.mutation<{ message: string; deleted_count: number }, { read?: boolean; category?: string }>({
      query: (filters) => ({
        url: 'notifications/destroy_all',
        method: 'DELETE',
        params: filters,
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Получение статистики
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => 'notifications/stats',
      providesTags: ['NotificationStats'],
    }),
  }),
  overrideExisting: false,
});

// Экспорт хуков
export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;

// Утилиты для UI
export const getNotificationIcon = (category: string): string => {
  const icons: Record<string, string> = {
    general: '📄',
    booking: '📅',
    system: '⚙️',
    promotion: '🎁',
    reminder: '⏰',
    security: '🔒',
  };
  return icons[category] || '📄';
};

export const getNotificationColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: '#4caf50',
    normal: '#2196f3',
    high: '#ff9800',
    urgent: '#f44336',
  };
  return colors[priority] || '#2196f3';
};

export const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    low: 'Низкий',
    normal: 'Обычный',
    high: 'Высокий',
    urgent: 'Срочный',
  };
  return texts[priority] || priority;
};

export const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    general: 'Общее',
    booking: 'Бронирование',
    system: 'Система',
    promotion: 'Акция',
    reminder: 'Напоминание',
    security: 'Безопасность',
  };
  return texts[category] || category;
}; 