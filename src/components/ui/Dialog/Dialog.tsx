import React from 'react';
import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface DialogProps extends Omit<MuiDialogProps, 'title'> {
  /** Заголовок диалога */
  title?: React.ReactNode;
  /** Содержимое диалога */
  children?: React.ReactNode;
  /** Текст описания (опционально) */
  description?: React.ReactNode;
  /** Действия в футере */
  actions?: React.ReactNode;
  /** Показать кнопку закрытия в заголовке */
  showCloseButton?: boolean;
  /** Колбэк закрытия */
  onClose?: () => void;
  /** Максимальная ширина */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Полноэкранный режим */
  fullScreen?: boolean;
  /** Прокручиваемое содержимое */
  scroll?: 'paper' | 'body';
  /** Кастомные стили */
  sx?: Record<string, any>;
}

const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[10],
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2, 3),
  },
  '& .MuiDialogContentText-root': {
    marginBottom: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1, 3, 2),
  },
}));

/**
 * Компонент Dialog - модальное окно для отображения важной информации или получения решения от пользователя
 * 
 * @example
 * <Dialog
 *   open={open}
 *   title="Подтверждение"
 *   description="Вы уверены, что хотите удалить этот элемент?"
 *   actions={
 *     <>
 *       <Button onClick={handleClose}>Отмена</Button>
 *       <Button variant="contained" color="error" onClick={handleDelete}>Удалить</Button>
 *     </>
 *   }
 *   onClose={handleClose}
 * />
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  children,
  description,
  actions,
  showCloseButton = true,
  onClose,
  maxWidth = 'sm',
  fullScreen = false,
  scroll = 'paper',
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  const handleClose = () => {
    onClose?.();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      scroll={scroll}
      sx={sx}
      {...props}
    >
      {title && (
        <DialogTitle>
          {typeof title === 'string' ? (
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          ) : (
            title
          )}
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={!!title}>
        {description && <DialogContentText>{description}</DialogContentText>}
        {children}
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </StyledDialog>
  );
};

export default Dialog;