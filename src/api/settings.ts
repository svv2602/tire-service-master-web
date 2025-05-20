import apiClient from './api';

// Типы для настроек
export interface SystemSettings {
  systemName: string;
  contactEmail: string;
  supportPhone: string;
  defaultCityId: number;
  dateFormat: string;
  timeFormat: string;
  slotDuration: number;
  enableNotifications: boolean;
  enableSmsNotifications: boolean;
  maxBookingsPerDay: number;
  workdayStart: string;
  workdayEnd: string;
  workDays: number[];
}

// API для работы с настройками системы
export const settingsApi = {
  // Получение системных настроек
  getSystemSettings: () => {
    return apiClient.get('/api/v1/settings/system');
  },

  // Обновление системных настроек
  updateSystemSettings: (settings: SystemSettings) => {
    return apiClient.put('/api/v1/settings/system', settings);
  },

  // Получение настроек пользователя
  getUserSettings: (userId: number) => {
    return apiClient.get(`/api/v1/users/${userId}/settings`);
  },

  // Обновление настроек пользователя
  updateUserSettings: (userId: number, settings: any) => {
    return apiClient.put(`/api/v1/users/${userId}/settings`, settings);
  },

  // Получение настроек уведомлений
  getNotificationSettings: () => {
    return apiClient.get('/api/v1/settings/notifications');
  },

  // Обновление настроек уведомлений
  updateNotificationSettings: (settings: any) => {
    return apiClient.put('/api/v1/settings/notifications', settings);
  },

  // Сброс системных настроек до значений по умолчанию
  resetSystemSettings: () => {
    return apiClient.post('/api/v1/settings/system/reset');
  },

  // Получение списка городов
  getCities: () => {
    return apiClient.get('/api/v1/cities');
  }
};

export default settingsApi; 