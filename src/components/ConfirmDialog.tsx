import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SIZES } from '../styles/theme';
import { FlexBox } from './styled/CommonComponents';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  /** Открыто ли диалоговое окно */
  open: boolean;
  /** Заголовок */
  title: string;
  /** Сообщение */
  message: string;
  /** Текст кнопки подтверждения */
  confirmText?: string;
  /** Текст кнопки отмены */
  cancelText?: string;
  /** Обработчик подтверждения */
  onConfirm: () => void;
  /** Обработчик отмены */
  onCancel: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
}));

/**
 * Компонент диалогового окна подтверждения
 * 
 * @example
 * <ConfirmDialog
 *   open={open}
 *   title="Подтверждение"
 *   message="Вы уверены, что хотите удалить этот элемент?"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'dialog.confirm',
  cancelText = 'dialog.cancel',
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          {t(title)} {/* Локализация заголовка */}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(message)} {/* Локализация сообщения */}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: SIZES.spacing.md }}>
        <FlexBox gap={1}>
          <StyledButton 
            variant="outlined"
            color="primary"
            onClick={onCancel}
          >
            {t(cancelText)} {/* Локализация кнопки отмены */}
          </StyledButton>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={onConfirm}
          >
            {t(confirmText)} {/* Локализация кнопки подтверждения */}
          </StyledButton>
        </FlexBox>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
