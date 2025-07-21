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
      case 'cancelled_by_client':
        return { label: t('bookingStatusBadge.cancelled_by_client'), color: 'error' };
      case 'cancelled_by_partner':
        return { label: t('bookingStatusBadge.cancelled_by_partner'), color: 'error' };
      case 'cancelled_by_admin':
        return { label: t('bookingStatusBadge.cancelled_by_admin'), color: 'error' };
      case 'no_show':
        return { label: t('bookingStatusBadge.no_show'), color: 'error' };
      case 'in_service':
        return { label: t('bookingStatusBadge.in_service'), color: 'warning' };
      case 'rescheduled':
        return { label: t('bookingStatusBadge.rescheduled'), color: 'secondary' };
      case 'expired':
        return { label: t('bookingStatusBadge.expired'), color: 'error' };
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