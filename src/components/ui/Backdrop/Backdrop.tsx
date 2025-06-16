import React from 'react';
import MuiBackdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import { BackdropProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Backdrop
const StyledBackdrop = styled(MuiBackdrop)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.8)' 
      : 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
    zIndex: theme.zIndex.drawer + 1,
  };
});

/**
 * Компонент Backdrop - затемняющий фон с возможностью отображения индикатора загрузки
 * или кастомного контента
 */
export const Backdrop: React.FC<BackdropProps> = ({
  open,
  onClose,
  children,
  transitionDuration = parseInt(tokens.transitions.duration.normal),
  loading = false,
  loadingColor = 'primary',
  loadingSize = 40,
  sx,
  ...props
}) => {
  return (
    <StyledBackdrop
      open={open}
      onClick={onClose}
      transitionDuration={transitionDuration}
      sx={sx}
      {...props}
    >
      {loading ? (
        <CircularProgress 
          color={loadingColor} 
          size={loadingSize} 
          sx={{
            transition: tokens.transitions.duration.normal,
            animation: `animation-${tokens.transitions.duration.slow} ${tokens.transitions.easing.easeInOut} infinite`,
          }}
        />
      ) : (
        children
      )}
    </StyledBackdrop>
  );
}; 