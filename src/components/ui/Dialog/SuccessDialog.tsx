import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Dialog } from './Dialog';
import { tokens } from '../../../styles/theme/tokens';

export interface SuccessDialogProps {
  /** Открыто ли диалоговое окно */
  open: boolean;
  /** Заголовок */
  title?: string;
  /** Основное сообщение */
  message?: string;
  /** Дополнительное описание */
  description?: string;
  /** Детали бронирования */
  bookingDetails?: {
    id?: string | number;
    date?: string;
    time?: string;
    servicePoint?: string;
    servicePointAddress?: string;
    servicePointPhone?: string;
    clientName?: string;
    carInfo?: string;
  };
  /** Текст основной кнопки */
  primaryButtonText?: string;
  /** Текст вторичной кнопки */
  secondaryButtonText?: string;
  /** Обработчик основной кнопки */
  onPrimaryAction?: () => void;
  /** Обработчик вторичной кнопки */
  onSecondaryAction?: () => void;
  /** Обработчик закрытия */
  onClose?: () => void;
  /** Показать кнопку закрытия */
  showCloseButton?: boolean;
}

/**
 * Компонент SuccessDialog - модальное окно для отображения успешного выполнения операции
 * 
 * @example
 * <SuccessDialog
 *   open={open}
 *   title="Бронирование создано!"
 *   message="Спасибо за ваше бронирование!"
 *   description="Мы получили ваш запрос и скоро свяжемся с вами для подтверждения."
 *   bookingDetails={{
 *     id: '12345',
 *     date: '27 июня 2025',
 *     time: '10:00',
 *     servicePoint: 'ШиноСервис Центр'
 *   }}
 *   primaryButtonText="Перейти в личный кабинет"
 *   secondaryButtonText="Создать еще одно бронирование"
 *   onPrimaryAction={handleGoToProfile}
 *   onSecondaryAction={handleCreateAnother}
 *   onClose={handleClose}
 * />
 */
export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  title = 'Операция выполнена успешно!',
  message = 'Ваш запрос был успешно обработан.',
  description,
  bookingDetails,
  primaryButtonText = 'Продолжить',
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
  showCloseButton = true,
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const actions = (
    <Box sx={{ display: 'flex', gap: 1, width: '100%', flexDirection: { xs: 'column', sm: 'row' } }}>
      {secondaryButtonText && onSecondaryAction && (
        <Button
          variant="outlined"
          onClick={onSecondaryAction}
          sx={{ 
            flex: { xs: 'none', sm: 1 },
            order: { xs: 2, sm: 1 }
          }}
        >
          {secondaryButtonText}
        </Button>
      )}
      <Button
        variant="contained"
        onClick={onPrimaryAction || onClose}
        sx={{ 
          flex: { xs: 'none', sm: 1 },
          order: { xs: 1, sm: 2 }
        }}
      >
        {primaryButtonText}
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon 
            sx={{ 
              color: theme.palette.success.main,
              fontSize: 28,
            }} 
          />
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      }
      actions={actions}
      onClose={onClose}
      showCloseButton={showCloseButton}
      maxWidth="sm"
    >
      <Box sx={{ textAlign: 'center', py: 1 }}>
        {/* Основное сообщение */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2,
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeights.medium,
            color: themeColors.textPrimary,
          }}
        >
          {message}
        </Typography>

        {/* Описание */}
        {description && (
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3,
              color: themeColors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Детали бронирования */}
        {bookingDetails && (
          <Box 
            sx={{ 
              mt: 3,
              p: 2,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(46, 125, 50, 0.1)' 
                : 'rgba(46, 125, 50, 0.05)',
              border: `1px solid ${theme.palette.success.main}20`,
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2,
                color: themeColors.textPrimary,
                fontWeight: tokens.typography.fontWeights.medium,
              }}
            >
              Детали бронирования:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left' }}>
              {bookingDetails.id && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: 80 }}>
                    № {bookingDetails.id}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.date && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ fontSize: 18, color: themeColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {formatDate(bookingDetails.date)}
                    {bookingDetails.time && ` в ${bookingDetails.time}`}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.servicePoint && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 18, color: themeColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {bookingDetails.servicePoint}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.servicePointAddress && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 18, color: themeColors.textSecondary, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {bookingDetails.servicePointAddress}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.servicePointPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: themeColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {bookingDetails.servicePointPhone}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.clientName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: themeColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {bookingDetails.clientName}
                  </Typography>
                </Box>
              )}
              
              {bookingDetails.carInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarIcon sx={{ fontSize: 18, color: themeColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {bookingDetails.carInfo}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default SuccessDialog; 