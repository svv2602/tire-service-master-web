import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { ANIMATIONS } from '../../../styles/theme';

/** Пропсы модального окна */
export interface ModalProps extends Omit<DialogProps, 'title' | 'maxWidth'> {
  /** Заголовок модального окна */
  title?: React.ReactNode;
  /** Контент модального окна */
  children?: React.ReactNode;
  /** Действия в футере модального окна */
  actions?: React.ReactNode;
  /** Колбэк закрытия */
  onClose?: () => void;
  /** Максимальная ширина */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Отображать кнопку закрытия */
  showCloseButton?: boolean;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: theme.spacing(2),
  },
}));

const ModalContent = styled(DialogContent)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(3),
  outline: 'none',
  maxHeight: '90vh',
  overflowY: 'auto',
  animation: `${ANIMATIONS.fadeIn} 0.3s ${ANIMATIONS.transition.cubic}`,
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500],
}));

/**
 * Компонент модального окна с поддержкой actions
 * 
 * @example
 * <Modal
 *   open={open}
 *   onClose={handleClose}
 *   title="Заголовок"
 *   maxWidth="sm"
 * >
 *   Содержимое модального окна
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  actions,
  onClose,
  maxWidth = 'sm',
  showCloseButton = true,
  ...props
}) => {
  const width = typeof maxWidth === 'string' ? {
    xs: 444,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  }[maxWidth] : maxWidth;

  return (
    <StyledDialog
      onClose={onClose}
      {...props}
    >
      {title && (
        <DialogTitle>
          {title}
        </DialogTitle>
      )}
      
      <DialogContent>
        {showCloseButton && (
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>
        )}
        <ModalContent
          sx={{
            width: '100%',
            maxWidth: width,
            mx: 2
          }}
        >
          {children}
        </ModalContent>
      </DialogContent>

      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;