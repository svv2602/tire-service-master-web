import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Alert,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Security as SecurityIcon,
  Language as LanguageIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LinkGoogleAccount } from '../../components/auth/LinkGoogleAccount';
import { PushNotificationToggle } from '../../components/notifications/PushNotificationToggle/PushNotificationToggle';
import { useGetCurrentUserQuery } from '../../api/auth.api';
import { useUnlinkGoogleMutation } from '../../api/oauth.api';
import Notification from '../../components/Notification';

/**
 * Страница настроек профиля пользователя
 * Включает управление Google аккаунтом, персональными данными и настройками
 */
export const ProfileSettingsPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const { t } = useTranslation();
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // API хуки
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const [unlinkGoogle, { isLoading: isUnlinking }] = useUnlinkGoogleMutation();

  // Проверяем параметры URL для отображения уведомлений
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('google_linked') === 'true') {
      setNotification({
        open: true,
        message: t('auth.google.linkSuccess'),
        severity: 'success'
      });
    }
  }, [location.search]);

  const handleUnlinkGoogle = async () => {
    try {
      await unlinkGoogle().unwrap();
      setNotification({
        open: true,
        message: t('auth.google.unlinkSuccess'),
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: t('auth.google.unlinkError'),
        severity: 'error'
      });
    }
  };

  const handleLinkGoogle = () => {
    // Логика уже в компоненте LinkGoogleAccount
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (isUserLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>{t('profile.settings.loadingUserData')}</Typography>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {t('profile.settings.failedToLoadUser')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonIcon />
        {t('profile.settings.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              {t('profile.settings.basicInfo')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentUser.user.email}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('profile.settings.role')}
                  value={currentUser.user.role}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('profile.settings.language')}</InputLabel>
                  <Select
                    value={currentUser.user.preferred_locale || 'ru'}
                    label={t('profile.settings.language')}
                  >
                    <MenuItem value="ru">Русский</MenuItem>
                    <MenuItem value="uk">Українська</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled
              >
                {t('profile.settings.saveChanges')}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Безопасность и авторизация */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              {t('profile.settings.security')}
            </Typography>
            
            <LinkGoogleAccount
              user={{
                id: currentUser.user.id,
                email: currentUser.user.email,
                google_id: currentUser.user.google_id,
                google_email: currentUser.user.google_email,
                provider: currentUser.user.provider
              }}
              onLinkAccount={handleLinkGoogle}
              onUnlinkAccount={handleUnlinkGoogle}
              isLoading={isUnlinking}
            />

            <Divider sx={{ my: 3 }} />

            <Box>
                            <Typography variant="subtitle1" gutterBottom>
                {t('profile.settings.changePassword')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentUser.user.google_id ? 
                  t('auth.google.passwordChangeDisabled') :
                  t('auth.google.passwordChangeEnabled')
                }
              </Typography>
              <Button
                variant="outlined"
                disabled={!!currentUser.user.google_id}
              >
                {t('profile.settings.changePassword')}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Настройки уведомлений */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('profile.settings.notifications')}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PushNotificationToggle
                  variant="card"
                  showDetails={true}
                  onSubscriptionChange={(isSubscribed) => {
                    setNotification({
                      open: true,
                      message: isSubscribed 
                        ? 'Push-уведомления включены' 
                        : 'Push-уведомления отключены',
                      severity: 'success'
                    });
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Уведомления */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Container>
  );
};

export default ProfileSettingsPage; 