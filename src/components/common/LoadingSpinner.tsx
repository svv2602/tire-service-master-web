import React from 'react';
import { Box, CircularProgress, CircularProgressProps } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  circularProgressProps?: CircularProgressProps;
}

/**
 * Компонент для отображения индикатора загрузки
 * @param size - размер спиннера: small, medium, large
 * @param fullScreen - занимать ли весь экран
 * @param circularProgressProps - дополнительные пропсы для CircularProgress
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
  circularProgressProps
}) => {
  // Определяем размер спиннера в зависимости от пропса size
  const spinnerSize = {
    small: 24,
    medium: 40,
    large: 60
  }[size];
  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height={fullScreen ? '100vh' : '100%'}
      minHeight={fullScreen ? '100vh' : 'inherit'}
      py={fullScreen ? 0 : 4}
      data-testid="loading-spinner"
    >
      <CircularProgress 
        size={spinnerSize} 
        {...circularProgressProps} 
      />
    </Box>
  );
};

export default LoadingSpinner; 