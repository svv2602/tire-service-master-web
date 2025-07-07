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
import { tokens } from '../../../styles/theme/tokens';
import { useTranslation } from 'react-i18next';

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

const StyledDialog = styled(MuiDialog)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiDialog-paper': {
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.lg,
      backgroundColor: themeColors.backgroundCard,
      border: `1px solid ${themeColors.borderPrimary}`,
      overflow: 'hidden',
    },
    '& .MuiDialogTitle-root': {
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${themeColors.borderPrimary}`,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(0, 0, 0, 0.02)',
    },
    '& .MuiDialogContent-root': {
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      color: themeColors.textPrimary,
    },
    '& .MuiDialogContentText-root': {
      marginBottom: tokens.spacing.md,
      color: themeColors.textSecondary,
      fontSize: tokens.typography.fontSize.md,
    },
    '& .MuiDialogActions-root': {
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg} ${tokens.spacing.md}`,
      borderTop: `1px solid ${themeColors.borderPrimary}`,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(0, 0, 0, 0.02)',
    },
  };
});

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
  const { t } = useTranslation();
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                color: themeColors.textPrimary,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeights.medium,
                fontFamily: tokens.typography.fontFamily,
              }}
            >
              {t(title)} {/* Локализация заголовка */}
            </Typography>
          ) : (
            title
          )}
          {showCloseButton && (
            <IconButton
              aria-label={t('dialog.close')}
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: themeColors.textSecondary,
                transition: tokens.transitions.duration.normal,
                '&:hover': {
                  color: themeColors.textPrimary,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={!!title}>
        {description && (
          <DialogContentText sx={{ color: themeColors.textSecondary }}>
            {/* Локализация описания только если это строка */}
            {typeof description === 'string' ? t(description) : description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </StyledDialog>
  );
};

export default Dialog;