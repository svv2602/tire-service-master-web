import React from 'react';
import { Backdrop as MuiBackdrop, CircularProgress, Box, styled } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import { BackdropProps } from './types';

const StyledBackdrop = styled(MuiBackdrop)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    zIndex: theme.zIndex.drawer + 1,
    color: themeColors.white,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.8)' 
      : 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  };
});

// Стилизованный CircularProgress
const StyledCircularProgress = styled(CircularProgress)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: tokens.colors.primary.main,
    marginBottom: tokens.spacing.md,
  };
});

// Стилизованный текст для сообщения
const MessageText = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: themeColors.textPrimary,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.md,
    textAlign: 'center',
    maxWidth: '80%',
  };
});

/**
 * Компонент Backdrop - затемнение для отображения загрузки или блокировки интерфейса
 * 
 * @example
 * <Backdrop open={loading} message="Загрузка данных..." />
 */
export const Backdrop: React.FC<BackdropProps> = ({ open, message, customContent, spinner = true, onClose, sx }) => {
  return (
    <StyledBackdrop open={open} onClick={onClose} sx={sx}>
      {customContent ? (
        customContent
      ) : spinner ? (
        <>
          <StyledCircularProgress size={40} thickness={4} />
          {message && <MessageText>{message}</MessageText>}
        </>
      ) : (
        <Box
          sx={{
            transition: tokens.transitions.duration.normal,
            animation: `animation-${tokens.transitions.duration.long} ${tokens.transitions.easing.easeInOut} infinite`,
          }}
        />
      )}
    </StyledBackdrop>
  );
};

export default Backdrop; 