import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Link
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors } from '../../../styles';

export interface PhoneBookingDialogProps {
  open: boolean;
  onClose: () => void;
  servicePointName: string;
  contactPhone?: string;
}

const PhoneBookingDialog: React.FC<PhoneBookingDialogProps> = ({
  open,
  onClose,
  servicePointName,
  contactPhone
}) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const colors = getThemeColors(theme);

  const handlePhoneClick = () => {
    if (contactPhone) {
      window.location.href = `tel:${contactPhone}`;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1
      }}>
        <InfoIcon sx={{ color: colors.warning }} />
        <Typography variant="h6" component="span">
          {t('components:servicePointCard.onlineBooking.phoneBookingTitle')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t('components:servicePointCard.onlineBooking.phoneBookingMessage')}
          </Typography>
        </Alert>

        <Box sx={{ 
          p: 2, 
          bgcolor: colors.backgroundField, 
          borderRadius: 1,
          border: `1px solid ${colors.border}`
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {servicePointName}
          </Typography>
          
          {contactPhone ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: colors.primary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                {t('components:servicePointCard.onlineBooking.contactPhone')}:
              </Typography>
              <Link
                component="button"
                variant="body1"
                onClick={handlePhoneClick}
                sx={{
                  fontWeight: 600,
                  color: colors.primary,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {contactPhone}
              </Link>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {t('components:servicePointCard.onlineBooking.noPhoneAvailable')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth
        >
          {t('components:servicePointCard.onlineBooking.closeDialog')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhoneBookingDialog; 