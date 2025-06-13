import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface BookingStatusBadgeProps {
  status: string;
  size?: ChipProps['size'];
  customLabel?: string;
}

/**
 * Компонент для отображения статуса бронирования в виде значка
 */
const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'medium', customLabel }) => {
  // Определяем текст и цвет в зависимости от статуса
  const getStatusConfig = (status: string): { label: string; color: ChipProps['color'] } => {
    // Если передан customLabel, используем его и цвет по умолчанию
    if (customLabel) {
      return { label: customLabel, color: 'default' };
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return { label: 'В ожидании', color: 'primary' };
      case 'confirmed':
        return { label: 'Подтверждено', color: 'info' };
      case 'in_progress':
        return { label: 'В процессе', color: 'warning' };
      case 'completed':
        return { label: 'Завершено', color: 'success' };
      case 'cancelled':
        return { label: 'Отменено', color: 'error' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const { label, color } = getStatusConfig(status);

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
    />
  );
};

export default BookingStatusBadge; 