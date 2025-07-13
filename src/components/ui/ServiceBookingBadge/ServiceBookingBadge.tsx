import React from 'react';
import { Chip } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';

interface ServiceBookingBadgeProps {
  isServiceBooking: boolean;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const ServiceBookingBadge: React.FC<ServiceBookingBadgeProps> = ({
  isServiceBooking,
  size = 'small',
  variant = 'filled'
}) => {
  if (!isServiceBooking) {
    return null;
  }

  return (
    <Chip
      icon={<BuildIcon />}
      label="Служебное"
      size={size}
      variant={variant}
      color="warning"
      sx={{
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: 'inherit'
        }
      }}
    />
  );
};

export default ServiceBookingBadge; 