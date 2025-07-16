import React from 'react';
import { Box, Button, Typography, Alert, Chip } from '@mui/material';
import { Google as GoogleIcon, Link as LinkIcon, LinkOff as LinkOffIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface LinkGoogleAccountProps {
  /** Данные пользователя с информацией о Google аккаунте */
  user: {
    id: number;
    email: string;
    google_id?: string;
    google_email?: string;
    provider?: string;
  };
  /** Функция для обработки привязки аккаунта */
  onLinkAccount: () => void;
  /** Функция для обработки отвязки аккаунта */
  onUnlinkAccount: () => void;
  /** Состояние загрузки */
  isLoading?: boolean;
}

/**
 * Компонент для управления привязкой Google аккаунта
 * Позволяет пользователю привязать или отвязать Google аккаунт
 */
export const LinkGoogleAccount: React.FC<LinkGoogleAccountProps> = ({
  user,
  onLinkAccount,
  onUnlinkAccount,
  isLoading = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const isGoogleLinked = user.google_id && user.provider === 'google';

  const handleLinkAccount = () => {
    // Перенаправляем на OAuth endpoint с параметром для связывания
    window.location.href = `/auth/google?link_account=true&user_id=${user.id}`;
  };

  const handleUnlinkAccount = () => {
    if (window.confirm(t('auth.google.unlinkConfirm'))) {
      onUnlinkAccount();
    }
  };

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GoogleIcon sx={{ color: '#4285F4' }} />
        {t('profile.settings.googleAccount')}
      </Typography>

      {isGoogleLinked ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t('auth.google.accountLinked')}
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={<GoogleIcon />}
              label={user.google_email || user.email}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('auth.google.linkBenefit')}
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LinkOffIcon />}
            onClick={handleUnlinkAccount}
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            {isLoading ? t('auth.google.unlinking') : t('auth.google.unlinkAccount')}
          </Button>
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t('auth.google.linkDescription')}
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('auth.google.linkBenefit')}
          </Typography>

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleLinkAccount}
            disabled={isLoading}
            sx={{
              backgroundColor: '#4285F4',
              color: 'white',
              '&:hover': {
                backgroundColor: '#357ae8',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
          >
            {isLoading ? t('auth.google.linking') : t('auth.google.linkAccount')}
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            {t('auth.google.secureAuth')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LinkGoogleAccount; 