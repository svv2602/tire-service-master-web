import React from 'react';
import MuiBackdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { BackdropProps } from './types';

/**
 * Компонент Backdrop - затемняющий фон с возможностью отображения индикатора загрузки
 * или кастомного контента
 */
export const Backdrop: React.FC<BackdropProps> = ({
  open,
  onClose,
  children,
  transitionDuration = 225,
  loading = false,
  loadingColor = 'primary',
  loadingSize = 40,
  sx,
  ...props
}) => {
  return (
    <MuiBackdrop
      open={open}
      onClick={onClose}
      transitionDuration={transitionDuration}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress color={loadingColor} size={loadingSize} />
      ) : (
        children
      )}
    </MuiBackdrop>
  );
}; 