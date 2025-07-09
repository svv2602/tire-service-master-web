import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BookingStatusBadgeProps {
  status: string;
  size?: ChipProps['size'];
  customLabel?: string;
}

/**
 * Компонент для отображения статуса бронирования в виде значка
 */
const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'medium', customLabel }) => {
  const { t } = useTranslation('components');
  
  // Определяем текст и цвет в зависимости от статуса
  const getStatusConfig = (status: string): { label: string; color: ChipProps['color'] } => {
    // Если передан customLabel, используем его и цвет по умолчанию
    if (customLabel) {
      return { label: customLabel, color: 'default' };
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return { label: t('bookingStatusBadge.pending'), color: 'primary' };
      case 'confirmed':
        return { label: t('bookingStatusBadge.confirmed'), color: 'info' };
      case 'in_progress':
        return { label: t('bookingStatusBadge.inProgress'), color: 'warning' };
      case 'completed':
        return { label: t('bookingStatusBadge.completed'), color: 'success' };
      case 'cancelled':
        return { label: t('bookingStatusBadge.cancelled'), color: 'error' };
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