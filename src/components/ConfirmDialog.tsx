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
import { SIZES, getFormStyles } from '../styles';
import { StyledButton, FlexBox } from './styled/CommonComponents';

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
  const formStyles = getFormStyles(theme);
  
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          ...formStyles.container,
          minWidth: 320,
        }
      }}
    >
      <DialogTitle 
        id="confirm-dialog-title"
        sx={formStyles.sectionTitle}
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
      <DialogActions sx={{ padding: SIZES.spacing.md }}>
        <FlexBox gap={SIZES.spacing.sm}>
          <StyledButton 
            styleVariant="secondary"
          onClick={onCancel} 
        >
          {cancelText}
          </StyledButton>
          <StyledButton 
            styleVariant="primary"
          onClick={onConfirm} 
          autoFocus
        >
          {confirmText}
          </StyledButton>
        </FlexBox>
      </DialogActions>
    </Dialog>
  );
};
