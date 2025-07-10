import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  useTheme,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonOff as GuestIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getButtonStyles } from '../../styles';

export interface BookingTypeChoiceDialogProps {
  /** Открыто ли диалоговое окно */
  open: boolean;
  /** Обработчик закрытия */
  onClose: () => void;
  /** Обработчик создания с аккаунтом */
  onCreateWithAccount: () => void;
  /** Обработчик создания без аккаунта */
  onCreateWithoutAccount: () => void;
}

export const BookingTypeChoiceDialog: React.FC<BookingTypeChoiceDialogProps> = ({
  open,
  onClose,
  onCreateWithAccount,
  onCreateWithoutAccount,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CheckCircleIcon color="success" />
          <Typography variant="h6">
            {t('bookingModals.bookingTypeChoice.title')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('bookingModals.bookingTypeChoice.subtitle')}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Вариант с созданием аккаунта */}
          <Box
            sx={{
              p: 3,
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
            }}
            onClick={onCreateWithAccount}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PersonAddIcon color="primary" fontSize="large" />
              <Typography variant="h6" color="primary">
                {t('bookingModals.bookingTypeChoice.withAccount.title')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('bookingModals.bookingTypeChoice.withAccount.subtitle')}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {t('bookingModals.bookingTypeChoice.withAccount.features.management')}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {t('bookingModals.bookingTypeChoice.withAccount.features.notifications')}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {t('bookingModals.bookingTypeChoice.withAccount.features.rebooking')}
              </Typography>
              <Typography component="li" variant="body2">
                {t('bookingModals.bookingTypeChoice.withAccount.features.carData')}
              </Typography>
            </Box>
          </Box>

          {/* Вариант без аккаунта */}
          <Box
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.grey[300]}`,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[2],
              },
            }}
            onClick={onCreateWithoutAccount}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <GuestIcon color="action" fontSize="large" />
              <Typography variant="h6" color="text.primary">
                {t('bookingModals.bookingTypeChoice.asGuest.title')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('bookingModals.bookingTypeChoice.asGuest.subtitle')}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {t('bookingModals.bookingTypeChoice.asGuest.features.noAccount')}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {t('bookingModals.bookingTypeChoice.asGuest.features.quickProcess')}
              </Typography>
              <Typography component="li" variant="body2">
                {t('bookingModals.bookingTypeChoice.asGuest.features.limitations')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={secondaryButtonStyles}
        >
          {t('bookingModals.bookingTypeChoice.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingTypeChoiceDialog; 