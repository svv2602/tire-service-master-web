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
  MenuItem,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  TestTube as TestIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import {
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useTestEmailMutation,
  type UpdateEmailSettingsRequest,
} from '../../../api/emailSettings.api';

const EmailSettingsPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // API хуки
  const { data, isLoading, error, refetch } = useGetEmailSettingsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdateEmailSettingsMutation();
  const [testEmail, { isLoading: testing }] = useTestEmailMutation();

  // Состояния формы
  const [settings, setSettings] = useState<UpdateEmailSettingsRequest>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_authentication: 'plain',
    smtp_starttls_auto: true,
    smtp_tls: false,
    from_email: '',
    from_name: 'Tire Service',
    enabled: false,
    test_mode: false,
  });

  // Состояния UI
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testDialog, setTestDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Загрузка данных
  useEffect(() => {
    if (data?.email_settings) {
      const emailSettings = data.email_settings;
      setSettings({
        smtp_host: emailSettings.smtp_host || '',
        smtp_port: emailSettings.smtp_port,
        smtp_username: emailSettings.smtp_username || '',
        smtp_password: '', // Не показываем пароль
        smtp_authentication: emailSettings.smtp_authentication || 'plain',
        smtp_starttls_auto: emailSettings.smtp_starttls_auto,
        smtp_tls: emailSettings.smtp_tls,
        from_email: emailSettings.from_email || '',
        from_name: emailSettings.from_name || 'Tire Service',
        enabled: emailSettings.enabled,
        test_mode: emailSettings.test_mode,
      });
    }
  }, [data]);

  // Обработка изменения настроек
  const handleSettingChange = (key: keyof UpdateEmailSettingsRequest, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Валидация формы
  const validateSettings = (): string[] => {
    const errors: string[] = [];
    
    if (settings.enabled) {
      if (!settings.smtp_host?.trim()) {
        errors.push('SMTP хост обязателен при включенной почте');
      }
      if (!settings.smtp_port || settings.smtp_port < 1 || settings.smtp_port > 65535) {
        errors.push('SMTP порт должен быть от 1 до 65535');
      }
      if (!settings.from_email?.trim()) {
        errors.push('Email отправителя обязателен');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.from_email)) {
        errors.push('Некорректный формат email отправителя');
      }
      if (settings.smtp_authentication && settings.smtp_authentication !== 'none') {
        if (!settings.smtp_username?.trim()) {
          errors.push('Имя пользователя SMTP обязательно при включенной аутентификации');
        }
        if (!settings.smtp_password?.trim()) {
          errors.push('Пароль SMTP обязателен при включенной аутентификации');
        }
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

  // Тестирование email
  const handleTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      setTestResult('❌ Введите email адрес для теста');
      return;
    }

    setTestResult(null);
    
    try {
      const result = await testEmail({ email: testEmailAddress }).unwrap();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
        if (result.sent_to) {
          setTestResult(prev => `${prev}\n📧 Отправлено на: ${result.sent_to}`);
        }
      } else {
        setTestResult(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка отправки: ${error.data?.message || error.message}`);
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
          Ошибка загрузки настроек почты. Попробуйте обновить страницу.
        </Alert>
      </Box>
    );
  }

  const emailSettings = data?.email_settings;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Typography variant="h4" sx={tablePageStyles.title}>
          📧 Настройки почты
        </Typography>
        <Typography variant="body1" sx={tablePageStyles.subtitle}>
          Управление SMTP сервером и параметрами отправки email уведомлений
        </Typography>
      </Box>

      {/* Статус системы */}
      {emailSettings && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Статус системы"
                avatar={<EmailIcon />}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={emailSettings.status_text}
                    color={emailSettings.status_color as any}
                    size="medium"
                    icon={emailSettings.ready_for_production ? <SendIcon /> : <SecurityIcon />}
                  />
                  {emailSettings.enabled && (
                    <Chip
                      label={emailSettings.test_mode ? 'Тестовый режим' : 'Продакшн'}
                      color={emailSettings.test_mode ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {data.statistics && (
                  <Typography variant="body2" color="text.secondary">
                    📊 Статистика: {data.statistics.total_sent} отправлено, 
                    {data.statistics.success_rate}% успешных доставок
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
                label="Включить email уведомления"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.test_mode || false}
                    onChange={(e) => handleSettingChange('test_mode', e.target.checked)}
                  />
                }
                label="Тестовый режим"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email отправителя"
                value={settings.from_email || ''}
                onChange={(e) => handleSettingChange('from_email', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                type="email"
                helperText="Email адрес, от имени которого отправляются письма"
              />

              <TextField
                fullWidth
                label="Имя отправителя"
                value={settings.from_name || ''}
                onChange={(e) => handleSettingChange('from_name', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                helperText="Отображаемое имя отправителя"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* SMTP настройки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="SMTP сервер"
              avatar={<SecurityIcon />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="SMTP хост"
                value={settings.smtp_host || ''}
                onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                placeholder="smtp.gmail.com"
                helperText="Адрес SMTP сервера"
              />

              <TextField
                fullWidth
                label="SMTP порт"
                value={settings.smtp_port || 587}
                onChange={(e) => handleSettingChange('smtp_port', parseInt(e.target.value) || 587)}
                sx={{ mb: 2 }}
                size="small"
                type="number"
                helperText="Порт SMTP сервера (обычно 587 или 465)"
              />

              <TextField
                fullWidth
                label="Аутентификация"
                value={settings.smtp_authentication || 'plain'}
                onChange={(e) => handleSettingChange('smtp_authentication', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                select
                helperText="Тип аутентификации SMTP"
              >
                <MenuItem value="">Без аутентификации</MenuItem>
                <MenuItem value="plain">Plain</MenuItem>
                <MenuItem value="login">Login</MenuItem>
                <MenuItem value="cram_md5">CRAM-MD5</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Имя пользователя"
                value={settings.smtp_username || ''}
                onChange={(e) => handleSettingChange('smtp_username', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                helperText="Имя пользователя для SMTP"
              />

              <TextField
                fullWidth
                label="Пароль"
                value={settings.smtp_password || ''}
                onChange={(e) => handleSettingChange('smtp_password', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                type="password"
                helperText="Пароль для SMTP"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smtp_starttls_auto || false}
                    onChange={(e) => handleSettingChange('smtp_starttls_auto', e.target.checked)}
                  />
                }
                label="STARTTLS"
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smtp_tls || false}
                    onChange={(e) => handleSettingChange('smtp_tls', e.target.checked)}
                  />
                }
                label="TLS"
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
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                💾 {updating ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => setTestDialog(true)}
                disabled={!settings.enabled || updating}
                startIcon={<TestIcon />}
                sx={{ px: 3, py: 1.5 }}
              >
                🧪 Тест
              </Button>
            </Box>

            {/* Сообщения об успехе/ошибке */}
            {saveSuccess && (
              <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
                ✅ Настройки почты успешно сохранены!
              </Alert>
            )}

            {saveError && (
              <Alert severity="error" sx={{ maxWidth: 600, width: '100%', whiteSpace: 'pre-line' }}>
                ❌ {saveError}
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Диалог тестирования */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🧪 Тестирование почтовых настроек</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email для теста"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            type="email"
            placeholder="admin@example.com"
            helperText="На этот адрес будет отправлено тестовое письмо"
          />
          
          {testResult && (
            <Alert 
              severity={testResult.includes('✅') ? 'success' : 'error'} 
              sx={{ mt: 2, whiteSpace: 'pre-line' }}
            >
              {testResult}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)}>
            Закрыть
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTestEmail}
            disabled={testing || !testEmailAddress.trim()}
            startIcon={testing ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {testing ? 'Отправка...' : 'Отправить тест'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailSettingsPage; 