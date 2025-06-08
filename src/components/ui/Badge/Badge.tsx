import React from 'react';
import MuiBadge from '@mui/material/Badge';
import { BadgeProps } from './types';
import { styled } from '@mui/material/styles';

// Создаем стилизованный компонент для пульсирующей анимации
const PulsingBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2)',
      opacity: 0,
    },
  },
}));

/**
 * Компонент Badge - отображает индикатор с числом или точку над дочерним элементом
 */
const Badge: React.FC<BadgeProps> = ({
  dot = false,
  pulse = false,
  badgeContent,
  children,
  ...rest
}) => {
  const BadgeComponent = pulse ? PulsingBadge : MuiBadge;

  return (
    <BadgeComponent
      badgeContent={badgeContent}
      variant={dot ? 'dot' : 'standard'}
      {...rest}
    >
      {children}
    </BadgeComponent>
  );
};

export default Badge;