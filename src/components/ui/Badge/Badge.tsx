import React from 'react';
import MuiBadge from '@mui/material/Badge';
import { BadgeProps } from './types';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный базовый компонент Badge
const StyledBadge = styled(MuiBadge)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiBadge-badge': {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeights.medium,
      transition: tokens.transitions.duration.normal,
      
      // Уменьшаем размер бейджа для лучшего соответствия дизайн-системе
      minWidth: '18px',
      height: '18px',
      padding: '0 4px',
    },
  };
});

// Создаем стилизованный компонент для пульсирующей анимации
const PulsingBadge = styled(StyledBadge)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
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
  };
});

/**
 * Компонент Badge - отображает индикатор с числом или точку над дочерним элементом
 */
const Badge: React.FC<BadgeProps> = ({
  dot = false,
  pulse = false,
  badgeContent,
  color = 'primary',
  children,
  ...rest
}) => {
  const BadgeComponent = pulse ? PulsingBadge : StyledBadge;

  return (
    <BadgeComponent
      badgeContent={badgeContent}
      variant={dot ? 'dot' : 'standard'}
      color={color}
      {...rest}
    >
      {children}
    </BadgeComponent>
  );
};

export default Badge;