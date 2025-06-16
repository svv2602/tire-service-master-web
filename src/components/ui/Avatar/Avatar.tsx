import React from 'react';
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
  styled
} from '@mui/material';
import { deepmerge } from '@mui/utils';

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
  const customSx = deepmerge(
    {
      bgcolor: src ? 'transparent' : 'primary.main',
      color: 'primary.contrastText',
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