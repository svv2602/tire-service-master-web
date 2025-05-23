// API URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
export const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  MANAGER: 'manager',
  CLIENT: 'client'
} as const;

// Статусы сервисных точек
export const SERVICE_POINT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed'
} as const;

// Статусы бронирований
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Статусы оплаты
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Уровни доступа менеджеров
export const MANAGER_ACCESS_LEVELS = {
  BASIC: 1,
  ADVANCED: 2,
  FULL: 3
} as const;

// Пагинация
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Форматы дат
export const DATE_FORMAT = 'dd.MM.yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Геолокация
export const DEFAULT_MAP_CENTER = {
  lat: 50.4501,
  lng: 30.5234
};
export const DEFAULT_MAP_ZOOM = 12;
export const DEFAULT_SEARCH_RADIUS = 10; // км

// Валидация
export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Сообщения
export const MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Пожалуйста, проверьте подключение к интернету.',
  UNAUTHORIZED: 'Необходима авторизация. Пожалуйста, войдите в систему.',
  FORBIDDEN: 'У вас нет прав для выполнения этого действия.',
  NOT_FOUND: 'Запрашиваемый ресурс не найден.',
  VALIDATION_ERROR: 'Пожалуйста, проверьте правильность заполнения полей.',
  SERVER_ERROR: 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.',
  SUCCESS_SAVE: 'Данные успешно сохранены.',
  SUCCESS_DELETE: 'Данные успешно удалены.',
  SUCCESS_UPDATE: 'Данные успешно обновлены.',
  CONFIRM_DELETE: 'Вы действительно хотите удалить этот элемент?'
} as const; 