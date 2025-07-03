import { BookingStatusKey, BookingStatus, BOOKING_STATUSES } from '../types/booking';

/**
 * Преобразует данные статуса из API в строковый ключ
 */
export const convertStatusToKey = (statusData: any): BookingStatusKey => {
  if (!statusData) {
    return BOOKING_STATUSES.PENDING;
  }
  
  // Если это уже строка, проверяем что она валидна
  if (typeof statusData === 'string') {
    const statusKey = statusData.toLowerCase();
    if (Object.values(BOOKING_STATUSES).includes(statusKey as BookingStatusKey)) {
      return statusKey as BookingStatusKey;
    }
    return BOOKING_STATUSES.PENDING;
  }
  
  // Если это объект с полем name или key
  const statusName = String(statusData.key || statusData.name || '').toLowerCase();
  
  // Маппинг названий статусов из API в строковые ключи
  switch (statusName) {
    case 'в ожидании':
    case 'pending':
      return BOOKING_STATUSES.PENDING;
    case 'подтверждено':
    case 'confirmed':
      return BOOKING_STATUSES.CONFIRMED;
    case 'в процессе':
    case 'in_progress':
      return BOOKING_STATUSES.IN_PROGRESS;
    case 'завершено':
    case 'completed':
      return BOOKING_STATUSES.COMPLETED;
    case 'отменено клиентом':
    case 'cancelled_by_client':
      return BOOKING_STATUSES.CANCELLED_BY_CLIENT;
    case 'отменено партнером':
    case 'cancelled_by_partner':
      return BOOKING_STATUSES.CANCELLED_BY_PARTNER;
    case 'не явился':
    case 'no_show':
      return BOOKING_STATUSES.NO_SHOW;
    default:
      return BOOKING_STATUSES.PENDING;
  }
};

/**
 * Получает читаемое название статуса на русском языке
 */
export const getStatusDisplayName = (status: BookingStatus): string => {
  const statusKey = convertStatusToKey(status);
  
  switch (statusKey) {
    case BOOKING_STATUSES.PENDING:
      return 'В ожидании';
    case BOOKING_STATUSES.CONFIRMED:
      return 'Подтверждено';
    case BOOKING_STATUSES.IN_PROGRESS:
      return 'В процессе';
    case BOOKING_STATUSES.COMPLETED:
      return 'Завершено';
    case BOOKING_STATUSES.CANCELLED_BY_CLIENT:
      return 'Отменено клиентом';
    case BOOKING_STATUSES.CANCELLED_BY_PARTNER:
      return 'Отменено партнером';
    case BOOKING_STATUSES.NO_SHOW:
      return 'Не явился';
    default:
      return 'Неизвестный статус';
  }
};

/**
 * Получает цвет для статуса (для UI компонентов)
 */
export const getStatusColor = (status: BookingStatus): string => {
  const statusKey = convertStatusToKey(status);
  
  switch (statusKey) {
    case BOOKING_STATUSES.PENDING:
      return '#FFC107'; // Желтый
    case BOOKING_STATUSES.CONFIRMED:
      return '#4CAF50'; // Зеленый
    case BOOKING_STATUSES.IN_PROGRESS:
      return '#2196F3'; // Синий
    case BOOKING_STATUSES.COMPLETED:
      return '#8BC34A'; // Светло-зеленый
    case BOOKING_STATUSES.CANCELLED_BY_CLIENT:
    case BOOKING_STATUSES.CANCELLED_BY_PARTNER:
      return '#F44336'; // Красный
    case BOOKING_STATUSES.NO_SHOW:
      return '#607D8B'; // Серый
    default:
      return '#9E9E9E'; // Серый по умолчанию
  }
};

/**
 * Проверяет, является ли статус отмененным
 */
export const isCancelledStatus = (status: BookingStatus): boolean => {
  const statusKey = convertStatusToKey(status);
  const cancelledStatuses: BookingStatusKey[] = [
    BOOKING_STATUSES.CANCELLED_BY_CLIENT,
    BOOKING_STATUSES.CANCELLED_BY_PARTNER,
    BOOKING_STATUSES.NO_SHOW
  ];
  return cancelledStatuses.includes(statusKey);
};

/**
 * Проверяет, можно ли отменить бронирование в данном статусе
 */
export const canCancelBooking = (status: BookingStatus): boolean => {
  const statusKey = convertStatusToKey(status);
  const cancellableStatuses: BookingStatusKey[] = [
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.CONFIRMED
  ];
  return cancellableStatuses.includes(statusKey);
};

/**
 * Получает цвет для Chip компонента MUI
 */
export const getStatusChipColor = (status: BookingStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const statusKey = convertStatusToKey(status);
  
  switch (statusKey) {
    case BOOKING_STATUSES.PENDING:
      return 'warning';
    case BOOKING_STATUSES.CONFIRMED:
      return 'success';
    case BOOKING_STATUSES.IN_PROGRESS:
      return 'info';
    case BOOKING_STATUSES.COMPLETED:
      return 'success';
    case BOOKING_STATUSES.CANCELLED_BY_CLIENT:
    case BOOKING_STATUSES.CANCELLED_BY_PARTNER:
    case BOOKING_STATUSES.NO_SHOW:
      return 'error';
    default:
      return 'default';
  }
}; 