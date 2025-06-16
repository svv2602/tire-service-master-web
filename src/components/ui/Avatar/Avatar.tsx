import React from 'react';
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
  styled,
  useTheme
} from '@mui/material';
import { deepmerge } from '@mui/utils';
import { tokens } from '../../../styles/theme/tokens';

export interface AvatarProps extends MuiAvatarProps {
  /** Размер аватара */
  size?: 'small' | 'medium' | 'large' | number;
  /** Вариант отображения */
  variant?: 'circular' | 'rounded' | 'square';
  /** URL изображения */
  src?: string;
  /** Альтернативный текст */
  alt?: string;
  /** Дочерний элемент (текст или иконка) */
  children?: React.ReactNode;
}

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: 'small' | 'medium' | 'large' | number }>(({ theme, size }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const sizeValue = typeof size === 'string' ? sizeMap[size] : size;

  return {
    width: sizeValue,
    height: sizeValue,
    fontSize: typeof sizeValue === 'number' ? sizeValue * 0.4 : undefined,
    fontFamily: tokens.typography.fontFamily,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: tokens.transitions.duration.normal,
    
    '&.MuiAvatar-circular': {
      borderRadius: '50%',
    },
    
    '&.MuiAvatar-rounded': {
      borderRadius: tokens.borderRadius.md,
    },
    
    '&.MuiAvatar-square': {
      borderRadius: tokens.borderRadius.none,
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: `calc(${typeof sizeValue === 'number' ? sizeValue : 40}px * 0.6)`,
    },
  };
});

/**
 * Компонент Avatar - отображает аватар пользователя или иконку
 * 
 * @example
 * <Avatar size="medium" src="/path/to/image.jpg" alt="User Avatar" />
 * <Avatar size="small">JD</Avatar>
 * <Avatar size={64}><PersonIcon /></Avatar>
 */
export const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  variant = 'circular',
  src,
  alt,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const customSx = deepmerge(
    {
      bgcolor: src ? 'transparent' : themeColors.primary,
      color: theme.palette.mode === 'dark' ? themeColors.textPrimary : '#fff',
      boxShadow: src ? tokens.shadows.xs : 'none',
    },
    sx || {}
  );

  return (
    <StyledAvatar
      size={size}
      variant={variant}
      src={src}
      alt={alt}
      sx={customSx}
      {...props}
    >
      {children}
    </StyledAvatar>
  );
};

export default Avatar; 