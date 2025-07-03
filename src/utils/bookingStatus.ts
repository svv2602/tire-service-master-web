import { BookingStatusEnum } from '../types/booking';

/**
 * Преобразует данные статуса из API в строковый enum
 */
export const convertStatusToEnum = (statusData: any): BookingStatusEnum => {
  if (!statusData || !statusData.name) {
    return BookingStatusEnum.PENDING;
  }
  
  const statusName = statusData.name.toLowerCase();
  
  // Маппинг названий статусов из API в enum
  switch (statusName) {
    case 'в ожидании':
    case 'pending':
      return BookingStatusEnum.PENDING;
    case 'подтверждено':
    case 'confirmed':
      return BookingStatusEnum.CONFIRMED;
    case 'в процессе':
    case 'in_progress':
      return BookingStatusEnum.IN_PROGRESS;
    case 'завершено':
    case 'completed':
      return BookingStatusEnum.COMPLETED;
    case 'отменено клиентом':
    case 'cancelled_by_client':
      return BookingStatusEnum.CANCELLED_BY_CLIENT;
    case 'отменено партнером':
    case 'cancelled_by_partner':
      return BookingStatusEnum.CANCELLED_BY_PARTNER;
    case 'не явился':
    case 'no_show':
      return BookingStatusEnum.NO_SHOW;
    default:
      return BookingStatusEnum.PENDING;
  }
};

/**
 * Получает читаемое название статуса на русском языке
 */
export const getStatusDisplayName = (status: BookingStatusEnum): string => {
  switch (status) {
    case BookingStatusEnum.PENDING:
      return 'В ожидании';
    case BookingStatusEnum.CONFIRMED:
      return 'Подтверждено';
    case BookingStatusEnum.IN_PROGRESS:
      return 'В процессе';
    case BookingStatusEnum.COMPLETED:
      return 'Завершено';
    case BookingStatusEnum.CANCELLED_BY_CLIENT:
      return 'Отменено клиентом';
    case BookingStatusEnum.CANCELLED_BY_PARTNER:
      return 'Отменено партнером';
    case BookingStatusEnum.NO_SHOW:
      return 'Не явился';
    default:
      return 'Неизвестный статус';
  }
};

/**
 * Получает цвет для статуса (для UI компонентов)
 */
export const getStatusColor = (status: BookingStatusEnum): string => {
  switch (status) {
    case BookingStatusEnum.PENDING:
      return '#FFC107'; // Желтый
    case BookingStatusEnum.CONFIRMED:
      return '#4CAF50'; // Зеленый
    case BookingStatusEnum.IN_PROGRESS:
      return '#2196F3'; // Синий
    case BookingStatusEnum.COMPLETED:
      return '#8BC34A'; // Светло-зеленый
    case BookingStatusEnum.CANCELLED_BY_CLIENT:
    case BookingStatusEnum.CANCELLED_BY_PARTNER:
      return '#F44336'; // Красный
    case BookingStatusEnum.NO_SHOW:
      return '#607D8B'; // Серый
    default:
      return '#9E9E9E'; // Серый по умолчанию
  }
};

/**
 * Проверяет, является ли статус отмененным
 */
export const isCancelledStatus = (status: BookingStatusEnum): boolean => {
  return [
    BookingStatusEnum.CANCELLED_BY_CLIENT,
    BookingStatusEnum.CANCELLED_BY_PARTNER,
    BookingStatusEnum.NO_SHOW
  ].includes(status);
};

/**
 * Проверяет, можно ли отменить бронирование в данном статусе
 */
export const canCancelBooking = (status: BookingStatusEnum): boolean => {
  return [
    BookingStatusEnum.PENDING,
    BookingStatusEnum.CONFIRMED
  ].includes(status);
}; 