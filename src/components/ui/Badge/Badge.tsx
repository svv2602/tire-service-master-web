import React from 'react';
import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { SIZES, ANIMATIONS, getThemeColors } from '../../../styles/theme';

export type BadgeProps = MuiBadgeProps & {
  /** Содержимое бейджа */
  badgeContent?: React.ReactNode;
  /** Цвет бейджа */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Размер бейджа */
  size?: 'small' | 'medium' | 'large';
  /** Максимальное значение */
  max?: number;
  /** Пульсирующая анимация */
  pulse?: boolean;
};

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StyledBadge = styled(MuiBadge)<BadgeProps>(({ theme, pulse }) => ({
  '& .MuiBadge-badge': {
    animation: pulse ? `${pulseAnimation} 2s infinite` : 'none',
    '&.MuiBadge-colorPrimary': {
      backgroundColor: theme.palette.primary.main,
    },
    '&.MuiBadge-colorSecondary': {
      backgroundColor: theme.palette.secondary.main,
    },
    '&.MuiBadge-colorError': {
      backgroundColor: theme.palette.error.main,
    },
    '&.MuiBadge-colorInfo': {
      backgroundColor: theme.palette.info.main,
    },
    '&.MuiBadge-colorSuccess': {
      backgroundColor: theme.palette.success.main,
    },
    '&.MuiBadge-colorWarning': {
      backgroundColor: theme.palette.warning.main,
    },
  },
}));

/**
 * Компонент бейджа для отображения меток и счетчиков
 * 
 * @example
 * // Простой бейдж
 * <Badge badgeContent={4} color="primary" pulse>
 *   <NotificationsIcon />
 * </Badge>
 * 
 * // Пульсирующий бейдж с максимальным значением
 * <Badge badgeContent={100} max={99} color="error" pulse>
 *   <MailIcon />
 * </Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  badgeContent,
  color = 'primary',
  size = 'medium',
  max = 99,
  pulse = false,
  children,
  ...props
}) => {
  // Форматируем контент, если это число
  const formattedContent = typeof badgeContent === 'number' && max
    ? badgeContent > max ? `${max}+` : badgeContent
    : badgeContent;

  return (
    <StyledBadge
      badgeContent={formattedContent}
      color={color}
      size={size}
      max={max}
      pulse={pulse}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

export default Badge;