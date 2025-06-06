import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import { SIZES } from '../styles';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: SIZES.borderRadius.md,
          padding: SIZES.spacing.sm,
          minWidth: 320,
        }
      }}
    >
      <DialogTitle 
        id="confirm-dialog-title"
        sx={{
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600,
          paddingBottom: SIZES.spacing.sm,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: SIZES.spacing.md }}>
        <DialogContentText 
          id="confirm-dialog-description"
          sx={{
            fontSize: SIZES.fontSize.md,
            color: theme.palette.text.secondary,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ gap: SIZES.spacing.sm, padding: SIZES.spacing.md }}>
        <Button 
          onClick={onCancel} 
          color="primary"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            padding: `${SIZES.spacing.sm}px ${SIZES.spacing.md}px`,
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color="primary" 
          variant="contained" 
          autoFocus
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            padding: `${SIZES.spacing.sm}px ${SIZES.spacing.md}px`,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
