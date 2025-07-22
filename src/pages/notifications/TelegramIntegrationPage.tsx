import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  Settings as SettingsIcon,
  QrCode as QrCodeIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';
import {
  useGetTelegramSettingsQuery,
  useUpdateTelegramSettingsMutation,
  useTestTelegramConnectionMutation,
  useSendTestMessageMutation,
  useSetWebhookMutation,
  useGetWebhookInfoQuery,
  useGetTelegramSubscriptionsQuery,
  useUpdateTelegramSubscriptionMutation,
  useDeleteTelegramSubscriptionMutation,
  type TelegramSettings as ApiTelegramSettings,
  type TelegramSubscription as ApiTelegramSubscription,
} from '../../api/telegramSettings.api';

interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  botUsername: string;
  webhookUrl: string;
  adminChatId: string;
  testMode: boolean;
  autoSubscription: boolean;
}

export const TelegramIntegrationPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  // API хуки
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useGetTelegramSettingsQuery();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useGetTelegramSubscriptionsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateTelegramSettingsMutation();
  const [testConnection, { isLoading: testLoading }] = useTestTelegramConnectionMutation();
  const [sendTestMessage] = useSendTestMessageMutation();
  const [setWebhook] = useSetWebhookMutation();
  const [updateSubscription] = useUpdateTelegramSubscriptionMutation();
  const [deleteSubscription] = useDeleteTelegramSubscriptionMutation();
  
  // Локальное состояние для формы
  const [settings, setSettings] = useState<TelegramSettings>({
    enabled: false,
    botToken: '',
    botUsername: '',
    webhookUrl: '',
    adminChatId: '',
    testMode: false,
    autoSubscription: true,
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Обновление локального состояния при загрузке данных
  useEffect(() => {
    if (settingsData?.telegram_settings) {
      const apiSettings = settingsData.telegram_settings;
      setSettings({
        enabled: apiSettings.enabled,
        botToken: apiSettings.bot_token || '',
        botUsername: apiSettings.bot_username || 'tire_service_ua_bot',
        webhookUrl: apiSettings.webhook_url || '',
        adminChatId: apiSettings.admin_chat_id || '',
        testMode: apiSettings.test_mode,
        autoSubscription: apiSettings.auto_subscription,
      });
    }
  }, [settingsData]);

  // Генерация QR кода
  useEffect(() => {
    if (qrCodeDialog && qrCanvasRef.current) {
      const botUrl = settings.botUsername 
        ? `https://t.me/${settings.botUsername}` 
        : 'https://t.me/tire_service_ua_bot';
      
      console.log('Generating QR code for:', botUrl);
      console.log('Canvas element:', qrCanvasRef.current);
      
      setQrCodeUrl(botUrl);
      
      // Увеличиваем задержку и проверяем готовность canvas
      setTimeout(() => {
        if (qrCanvasRef.current) {
          const canvas = qrCanvasRef.current;
          
          // Устанавливаем размеры canvas
          canvas.width = 256;
          canvas.height = 256;
          
          console.log('Canvas dimensions:', canvas.width, canvas.height);
          
          QRCode.toCanvas(canvas, botUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }).then(() => {
            console.log('QR code generated successfully');
          }).catch((error) => {
            console.error('QR code generation error:', error);
            
            // Fallback - попробуем сгенерировать как DataURL и нарисовать на canvas
            QRCode.toDataURL(botUrl, {
              width: 256,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            }).then((dataUrl) => {
              const img = new Image();
              img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, 256, 256);
                  console.log('QR code drawn via DataURL fallback');
                }
              };
              img.src = dataUrl;
            }).catch((fallbackError) => {
              console.error('Fallback QR generation also failed:', fallbackError);
            });
          });
        }
      }, 300); // Увеличиваем задержку
    }
  }, [qrCodeDialog, settings.botUsername]);

  const handleSettingChange = (key: keyof TelegramSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    
    try {
      await updateSettings({
        bot_token: settings.botToken,
        webhook_url: settings.webhookUrl,
        admin_chat_id: settings.adminChatId,
        enabled: settings.enabled,
        test_mode: settings.testMode,
        auto_subscription: settings.autoSubscription,
      }).unwrap();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const handleTestMessage = async () => {
    setTestResult(null);
    
    try {
      const result = await testConnection().unwrap();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
        if (result.bot_info) {
          setTestResult(prev => `${prev}\n🤖 Бот: ${result.bot_info?.first_name} (@${result.bot_info?.username})`);
        }
      } else {
        setTestResult(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Помилка з'єднання: ${error.data?.message || error.message}`);
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    try {
      await deleteSubscription(id).unwrap();
    } catch (error) {
      console.error('Ошибка удаления подписки:', error);
    }
  };

  const handleToggleSubscription = async (id: number, currentActive: boolean) => {
    try {
      await updateSubscription({
        id,
        data: { is_active: !currentActive }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка обновления подписки:', error);
    }
  };

  const handleQrCodeOpen = () => {
    console.log('Opening QR dialog, current settings:', settings);
    setQrCodeDialog(true);
    
    // Принудительно генерируем QR код через небольшую задержку после открытия диалога
    setTimeout(() => {
      generateQRCode();
    }, 100);
  };

  const generateQRCode = () => {
    const botUrl = settings.botUsername 
      ? `https://t.me/${settings.botUsername}` 
      : 'https://t.me/tire_service_ua_bot';
    
    console.log('Generating QR code for:', botUrl);
    setQrCodeUrl(botUrl);
    
    if (qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      
      // Устанавливаем размеры canvas
      canvas.width = 256;
      canvas.height = 256;
      
      console.log('Canvas ready, dimensions:', canvas.width, canvas.height);
      
      // Очищаем canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      QRCode.toCanvas(canvas, botUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(() => {
        console.log('QR code generated successfully');
      }).catch((error) => {
        console.error('QR code generation error:', error);
        
        // Fallback - попробуем сгенерировать как DataURL и нарисовать на canvas
        QRCode.toDataURL(botUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }).then((dataUrl) => {
          const img = new Image();
          img.onload = () => {
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, 256, 256);
              console.log('QR code drawn via DataURL fallback');
            }
          };
          img.src = dataUrl;
        }).catch((fallbackError) => {
          console.error('Fallback QR generation also failed:', fallbackError);
        });
      });
    } else {
      console.warn('Canvas ref not available');
    }
  };

  if (settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (settingsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Ошибка загрузки настроек Telegram
      </Alert>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TelegramIcon sx={{ fontSize: 32, color: '#0088cc' }} />
          <Typography variant="h4" sx={tablePageStyles.pageTitle}>
            Telegram интеграция
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Управление Telegram ботом и рассылкой уведомлений клиентам
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            📝 <strong>Шаблоны сообщений</strong> теперь управляются через{' '}
            <Button 
              variant="text" 
              size="small" 
              onClick={() => window.open('/admin/notifications/email-templates?channel=telegram', '_blank')}
              sx={{ p: 0, textTransform: 'none' }}
            >
              Шаблоны уведомлений
            </Button>
          </Typography>
        </Alert>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки успешно сохранены!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статус подключения */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Статус подключения"
              avatar={<TelegramIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {settings.enabled ? (
                  <CheckIcon sx={{ color: 'success.main' }} />
                ) : (
                  <ErrorIcon sx={{ color: 'error.main' }} />
                )}
                <Typography variant="body2">
                  {settings.enabled ? 'Telegram бот включен' : 'Telegram бот отключен'}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                onClick={handleTestMessage}
                disabled={testLoading || !settings.botToken}
                startIcon={testLoading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ mr: 1, mb: 2 }}
              >
                {testLoading ? 'Тестирование...' : 'Тест подключения'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleQrCodeOpen}
                startIcon={<QrCodeIcon />}
                sx={{ mb: 2 }}
              >
                QR код для подписки
              </Button>
              
              {testResult && (
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  >
                    {testResult}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Настройки бота */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Настройки бота"
              avatar={<TelegramIcon />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                }
                label="Включить Telegram бота"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Bot Token"
                value={settings.botToken}
                onChange={(e) => handleSettingChange('botToken', e.target.value)}
                type="password"
                sx={{ mb: 2 }}
                size="small"
                placeholder="1234567890:ABCDEFghijklmnopQRSTUVwxyz"
              />
              
              <TextField
                fullWidth
                label="Bot Username"
                value={settings.botUsername}
                onChange={(e) => handleSettingChange('botUsername', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                placeholder="tire_service_ua_bot"
                helperText="Имя пользователя бота (без @)"
              />
              
              <TextField
                fullWidth
                label="Webhook URL"
                value={settings.webhookUrl}
                onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                placeholder="https://yourdomain.com/api/telegram/webhook"
              />
              
              <TextField
                fullWidth
                label="Admin Chat ID"
                value={settings.adminChatId}
                onChange={(e) => handleSettingChange('adminChatId', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                placeholder="123456789"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.testMode}
                    onChange={(e) => handleSettingChange('testMode', e.target.checked)}
                  />
                }
                label="Тестовый режим"
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSubscription}
                    onChange={(e) => handleSettingChange('autoSubscription', e.target.checked)}
                  />
                }
                label="Автоматическая подписка"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Подписчики */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={`Подписчики (${subscriptionsData?.data?.length || 0})`}
              avatar={<GroupIcon />}
            />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              {subscriptionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List dense>
                  {subscriptionsData?.data?.map((subscription: any) => (
                    <ListItem key={subscription.id}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <ListItemText
                        primary={`${subscription.first_name || ''} ${subscription.last_name || ''}`.trim() || 'Без имени'}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              @{subscription.username || 'не указан'} • {formatDate(subscription.created_at)}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={subscription.status}
                                size="small"
                                color={subscription.is_active ? 'success' : 'default'}
                                sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                              />
                              <Chip
                                label={subscription.language_code}
                                size="small"
                                sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleToggleSubscription(subscription.id, subscription.is_active)}
                            color={subscription.is_active ? 'success' : 'default'}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteSubscription(subscription.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {!subscriptionsLoading && (!subscriptionsData?.data || subscriptionsData.data.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Нет подписчиков
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кнопки действий */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updating}
          startIcon={updating ? <CircularProgress size={20} /> : <SettingsIcon />}
        >
          {updating ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialog} onClose={() => setQrCodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR код для подписки на бота</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                minHeight: 260,
                minWidth: 260
              }}
            >
              <canvas 
                ref={qrCanvasRef}
                width={256}
                height={256}
                style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Отсканируйте QR код для быстрой подписки на уведомления
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
              {qrCodeUrl || (settings.botUsername ? `https://t.me/${settings.botUsername}` : 'https://t.me/tire_service_ua_bot')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TelegramIntegrationPage; 