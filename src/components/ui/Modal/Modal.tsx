import React from 'react';
import {
  Modal as MuiModal,
  ModalProps as MuiModalProps,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface ModalProps extends Omit<MuiModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  maxWidth?: number | string;
  fullWidth?: boolean;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  maxWidth = 600,
  fullWidth = false,
  showCloseButton = true,
  actions,
  onClose,
  ...props
}) => {
  return (
    <MuiModal
      onClose={onClose}
      {...props}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: fullWidth ? '90%' : 'auto',
          maxWidth: maxWidth,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: 3,
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {(title || showCloseButton) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2
            }}
          >
            {title && (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            )}
            {showCloseButton && (
              <IconButton
                onClick={(e) => onClose?.(e, 'backdropClick')}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        )}
        {children}
        {actions && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 3
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </MuiModal>
  );
};

export default Modal;