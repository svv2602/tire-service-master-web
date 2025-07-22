import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Science as TestIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getTablePageStyles } from '../../../styles';
import {
  useGetGoogleOauthSettingsQuery,
  useUpdateGoogleOauthSettingsMutation,
  useTestGoogleOauthConnectionMutation,
  type UpdateGoogleOauthSettingsRequest,
} from '../../../api/googleOauthSettings.api';

const GoogleOauthSettingsPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // API хуки
  const { data, isLoading, error, refetch } = useGetGoogleOauthSettingsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdateGoogleOauthSettingsMutation();
  const [testConnection, { isLoading: testing }] = useTestGoogleOauthConnectionMutation();

  // Состояния формы
  const [settings, setSettings] = useState<UpdateGoogleOauthSettingsRequest>({
    client_id: '',
    client_secret: '',
    redirect_uri: 'http://localhost:3008/auth/google/callback',
    enabled: false,
    allow_registration: true,
    auto_verify_email: true,
    scopes_list: 'email,profile',
  });

  // Состояния UI
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testDialog, setTestDialog] = useState(false);
  const [setupDialog, setSetupDialog] = useState(false);

  // Загрузка данных
  useEffect(() => {
    if (data?.google_oauth_settings) {
      const oauthSettings = data.google_oauth_settings;
      setSettings({
        client_id: oauthSettings.client_id || '',
        client_secret: oauthSettings.client_secret || '',
        redirect_uri: oauthSettings.redirect_uri || 'http://localhost:3008/auth/google/callback',
        enabled: oauthSettings.enabled,
        allow_registration: oauthSettings.allow_registration,
        auto_verify_email: oauthSettings.auto_verify_email,
        scopes_list: oauthSettings.scopes_list || 'email,profile',
      });
    }
  }, [data]);

  // Обработчик изменения настроек
  const handleSettingChange = (field: keyof UpdateGoogleOauthSettingsRequest, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем сообщения при изменении
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Валидация настроек
  const validateSettings = (): string[] => {
    const errors: string[] = [];
    
    if (settings.enabled) {
      if (!settings.client_id?.trim()) {
        errors.push('Client ID обязателен для заполнения');
      } else if (!settings.client_id.includes('.apps.googleusercontent.com')) {
        errors.push('Client ID должен быть в формате: xxxxxx.apps.googleusercontent.com');
      }
      
      if (!settings.client_secret?.trim()) {
        errors.push('Client Secret обязателен для заполнения');
      }
      
      if (!settings.redirect_uri?.trim()) {
        errors.push('Redirect URI обязателен для заполнения');
      } else if (!settings.redirect_uri.match(/^https?:\/\/.+/)) {
        errors.push('Redirect URI должен быть корректным URL');
      }
    }
    
    return errors;
  };

  // Сохранение настроек
  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);

    const validationErrors = validateSettings();
    if (validationErrors.length > 0) {
      setSaveError(validationErrors.join('\n'));
      return;
    }

    try {
      await updateSettings(settings).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
      refetch();
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error);
      if (error?.data?.errors) {
        setSaveError(error.data.errors.join('\n'));
      } else {
        setSaveError('Произошла ошибка при сохранении настроек');
      }
    }
  };

  // Тестирование подключения
  const handleTestConnection = async () => {
    setTestResult(null);
    
    try {
      const result = await testConnection().unwrap();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
        if (result.authorization_url) {
          setTestResult(prev => `${prev}\n🔗 URL авторизации сгенерирован успешно`);
        }
      } else {
        setTestResult(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка тестирования: ${error.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки настроек Google OAuth. Попробуйте обновить страницу.
        </Alert>
      </Box>
    );
  }

  const oauthSettings = data?.google_oauth_settings;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" sx={tablePageStyles.title}>
          <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Google OAuth настройки
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление интеграцией с Google OAuth для входа пользователей через Google аккаунты
        </Typography>
      </Box>

      {/* Статус системы */}
      {oauthSettings && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Статус системы:</Typography>
              <Chip 
                label={oauthSettings.status_text}
                color={oauthSettings.status_color as any}
                icon={oauthSettings.system_status === 'production' ? <CheckIcon /> : undefined}
              />
              {!oauthSettings.valid_configuration && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => setSetupDialog(true)}
                >
                  Инструкция по настройке
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Основные настройки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Основные настройки"
              avatar={<SettingsIcon />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled || false}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                }
                label="Включить Google OAuth"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allow_registration || false}
                    onChange={(e) => handleSettingChange('allow_registration', e.target.checked)}
                    disabled={!settings.enabled}
                  />
                }
                label="Разрешить регистрацию новых пользователей"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_verify_email || false}
                    onChange={(e) => handleSettingChange('auto_verify_email', e.target.checked)}
                    disabled={!settings.enabled}
                  />
                }
                label="Автоматически верифицировать email"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* OAuth настройки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Google OAuth конфигурация"
              avatar={<SecurityIcon />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="Client ID"
                value={settings.client_id || ''}
                onChange={(e) => handleSettingChange('client_id', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                placeholder="xxxxxx.apps.googleusercontent.com"
                helperText="Client ID из Google Cloud Console"
                disabled={!settings.enabled}
              />

              <TextField
                fullWidth
                label="Client Secret"
                value={settings.client_secret || ''}
                onChange={(e) => handleSettingChange('client_secret', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                type="password"
                helperText="Client Secret из Google Cloud Console"
                disabled={!settings.enabled}
              />

              <TextField
                fullWidth
                label="Redirect URI"
                value={settings.redirect_uri || ''}
                onChange={(e) => handleSettingChange('redirect_uri', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                helperText="URL для возврата после авторизации"
                disabled={!settings.enabled}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кнопка сохранения и сообщения */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={updating}
                startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minWidth: 200,
                  background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3367d6 30%, #2d8f47 90%)',
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                🔑 {updating ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleTestConnection}
                disabled={!settings.enabled || updating || testing}
                startIcon={testing ? <CircularProgress size={20} /> : <TestIcon />}
                sx={{ px: 3, py: 1.5 }}
              >
                🧪 {testing ? 'Тестирование...' : 'Тест'}
              </Button>
            </Box>

            {/* Сообщения об успехе/ошибке */}
            {saveSuccess && (
              <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
                ✅ Настройки Google OAuth успешно сохранены!
              </Alert>
            )}

            {saveError && (
              <Alert severity="error" sx={{ maxWidth: 600, width: '100%', whiteSpace: 'pre-line' }}>
                ❌ {saveError}
              </Alert>
            )}

            {testResult && (
              <Alert 
                severity={testResult.includes('✅') ? 'success' : 'error'} 
                sx={{ maxWidth: 600, width: '100%', whiteSpace: 'pre-line' }}
              >
                {testResult}
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Диалог инструкции по настройке */}
      <Dialog open={setupDialog} onClose={() => setSetupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>🔧 Настройка Google OAuth</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Шаг 1: Создание проекта в Google Cloud Console
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>1️⃣</ListItemIcon>
              <ListItemText 
                primary="Перейдите в Google Cloud Console"
                secondary={
                  <Link href="https://console.cloud.google.com/" target="_blank" rel="noopener">
                    https://console.cloud.google.com/
                  </Link>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>2️⃣</ListItemIcon>
              <ListItemText primary="Создайте новый проект или выберите существующий" />
            </ListItem>
            <ListItem>
              <ListItemIcon>3️⃣</ListItemIcon>
              <ListItemText primary="Включите Google+ API и Google Identity Services" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Шаг 2: Настройка OAuth 2.0
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>1️⃣</ListItemIcon>
              <ListItemText primary="Перейдите в APIs & Services → Credentials" />
            </ListItem>
            <ListItem>
              <ListItemIcon>2️⃣</ListItemIcon>
              <ListItemText primary="Нажмите Create Credentials → OAuth 2.0 Client IDs" />
            </ListItem>
            <ListItem>
              <ListItemIcon>3️⃣</ListItemIcon>
              <ListItemText primary="Выберите тип: Web application" />
            </ListItem>
            <ListItem>
              <ListItemIcon>4️⃣</ListItemIcon>
              <ListItemText 
                primary="Добавьте Authorized redirect URIs:"
                secondary={settings.redirect_uri}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Шаг 3: Получение учетных данных
          </Typography>
          <Typography variant="body2" color="text.secondary">
            После создания OAuth клиента скопируйте Client ID и Client Secret в форму выше.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialog(false)}>
            Закрыть
          </Button>
          <Button 
            variant="contained" 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank"
            startIcon={<LaunchIcon />}
          >
            Открыть Google Console
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleOauthSettingsPage; 