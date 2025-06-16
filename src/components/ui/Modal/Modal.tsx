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
import { tokens } from '../../../styles/theme/tokens';

export interface ModalProps {
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
  /** Максимальная ширина модального окна */
  maxWidth?: number | string;
  /** Высота модального окна */
  height?: number | string;
  /** Кастомные стили */
  sx?: Record<string, any>;
  /** Флаг открытия модального окна */
  open: boolean;
  /** Полная ширина */
  fullWidth?: boolean;
  /** Остальные свойства MUI Modal */
  [key: string]: any;
}

const StyledModalContent = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: themeColors.backgroundCard,
    boxShadow: tokens.shadows.lg,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${themeColors.borderPrimary}`,
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    transition: tokens.transitions.duration.normal,
  };
});

const ModalHeader = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.02)',
  };
});

const ModalBody = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: tokens.spacing.lg,
    overflowY: 'auto',
    flexGrow: 1,
    color: themeColors.textPrimary,
  };
});

const ModalFooter = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg} ${tokens.spacing.md}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${themeColors.borderPrimary}`,
    gap: tokens.spacing.sm,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.02)',
  };
});

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
 *   maxWidth={800}
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
  maxWidth,
  height = 'auto',
  sx,
  fullWidth,
  ...props
}) => {
  const theme = useTheme();
const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
          width: fullWidth ? '100%' : width,
          maxWidth,
          height,
          ...(sx || {}),
        }}
      >
        {title && (
          <ModalHeader>
            {typeof title === 'string' ? (
              <Typography 
                variant="h6" 
                component="h2" 
                id="modal-title"
                sx={{ 
                  color: themeColors.textPrimary,
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeights.medium,
                  fontFamily: tokens.typography.fontFamily,
                }}
              >
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
                sx={{
                  color: themeColors.textSecondary,
                  transition: tokens.transitions.duration.normal,
                  '&:hover': {
                    color: themeColors.textPrimary,
                  },
                }}
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