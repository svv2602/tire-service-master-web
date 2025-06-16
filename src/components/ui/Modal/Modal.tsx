import React from 'react';
import {
  Modal as MuiModal,
  ModalProps as MuiModalProps,
  Box,
  IconButton,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface ModalProps extends Omit<MuiModalProps, 'children'> {
  /** Заголовок модального окна */
  title?: React.ReactNode;
  /** Содержимое модального окна */
  children?: React.ReactNode;
  /** Действия в футере */
  actions?: React.ReactNode;
  /** Показать кнопку закрытия в заголовке */
  showCloseButton?: boolean;
  /** Колбэк закрытия */
  onClose?: () => void;
  /** Ширина модального окна */
  width?: number | string;
  /** Высота модального окна */
  height?: number | string;
  /** Кастомные стили */
  sx?: Record<string, any>;
}

const StyledModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[10],
  borderRadius: theme.shape.borderRadius,
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flexGrow: 1,
}));

const ModalFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
}));

/**
 * Компонент Modal - модальное окно для отображения содержимого поверх основного интерфейса
 * 
 * @example
 * <Modal
 *   open={open}
 *   title="Заголовок модального окна"
 *   actions={
 *     <>
 *       <Button onClick={handleClose}>Отмена</Button>
 *       <Button variant="contained" onClick={handleSave}>Сохранить</Button>
 *     </>
 *   }
 *   onClose={handleClose}
 *   width={500}
 * >
 *   <Typography>Содержимое модального окна</Typography>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  actions,
  showCloseButton = true,
  onClose,
  width = 500,
  height = 'auto',
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  const handleClose = () => {
    onClose?.();
  };

  return (
    <MuiModal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      {...props}
    >
      <StyledModalContent
        sx={{
          width,
          height,
          ...(sx || {}),
        }}
      >
        {title && (
          <ModalHeader>
            {typeof title === 'string' ? (
              <Typography variant="h6" component="h2" id="modal-title">
                {title}
              </Typography>
            ) : (
              title
            )}
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={handleClose}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </ModalHeader>
        )}
        <ModalBody id="modal-description">{children}</ModalBody>
        {actions && <ModalFooter>{actions}</ModalFooter>}
      </StyledModalContent>
    </MuiModal>
  );
};

export default Modal;