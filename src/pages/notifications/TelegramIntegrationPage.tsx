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
  useGetChatIdMutation,
  useSendTestMessageMutation,
  useSetWebhookMutation,
  useGetWebhookInfoQuery,
  useGenerateNgrokWebhookMutation,
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
  const [getChatId, { isLoading: gettingChatId }] = useGetChatIdMutation();
  const [sendTestMessage] = useSendTestMessageMutation();
  const [setWebhook] = useSetWebhookMutation();
  const [generateNgrokWebhook] = useGenerateNgrokWebhookMutation();
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [generatingWebhook, setGeneratingWebhook] = useState(false);
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

  const validateSettings = () => {
    const errors = [];
    
    // Валидация Bot Token
    if (settings.botToken && settings.botToken.trim()) {
      const botTokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
      if (!botTokenRegex.test(settings.botToken.trim())) {
        errors.push('Bot Token должен быть в формате: 123456789:ABCDEFghijklmnop');
      }
    }
    
    // Валидация Webhook URL
    if (settings.webhookUrl && settings.webhookUrl.trim()) {
      try {
        const url = new URL(settings.webhookUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Webhook URL должен начинаться с http:// или https://');
        }
      } catch {
        errors.push('Webhook URL должен быть корректным URL адресом');
      }
    }
    
    // Валидация Admin Chat ID
    if (settings.adminChatId && settings.adminChatId.trim()) {
      const chatIdRegex = /^-?\d+$/;
      if (!chatIdRegex.test(settings.adminChatId.trim())) {
        errors.push('Admin Chat ID должен содержать только цифры (может начинаться с -)');
      }
    }
    
    return errors;
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    
    // Валидация на фронтенде
    const validationErrors = validateSettings();
    if (validationErrors.length > 0) {
      setSaveError(`Ошибки валидации:\n${validationErrors.join('\n')}`);
      return;
    }
    
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
      setTimeout(() => setSaveSuccess(false), 4000);
      
      // Автоматически устанавливаем webhook если URL указан
      if (settings.webhookUrl && settings.webhookUrl.trim()) {
        try {
          await setWebhook({ webhook_url: settings.webhookUrl }).unwrap();
          console.log('✅ Webhook автоматически установлен');
        } catch (webhookError) {
          console.warn('⚠️ Не удалось автоматически установить webhook:', webhookError);
        }
      }
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error);
      
      // Показываем детали ошибки пользователю
      let errorMessage = 'Произошла ошибка при сохранении настроек';
      if (error?.data?.errors) {
        console.error('Ошибки валидации:', error.data.errors);
        errorMessage = `Ошибки валидации:\n${error.data.errors.join('\n')}`;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      setTimeout(() => setSaveError(null), 5000);
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
      console.error('Ошибка тестирования подключения:', error);
      let errorMessage = 'Помилка з\'єднання';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setTestResult(`❌ ${errorMessage}`);
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    try {
      await deleteSubscription(id).unwrap();
    } catch (error) {
      console.error('Ошибка удаления подписки:', error);
    }
  };

  const handleGenerateWebhookUrl = async () => {
    setGeneratingWebhook(true);
    setSaveError(null);
    
    try {
      const result = await generateNgrokWebhook().unwrap();
      
      if (result.success && result.webhook_url) {
        setSettings(prev => ({
          ...prev,
          webhookUrl: result.webhook_url || ''
        }));
        
        console.log('✅ Webhook URL сгенерирован:', result.webhook_url);
        console.log('🔗 Ngrok URL:', result.ngrok_url);
      } else {
        setSaveError(result.message);
      }
    } catch (error: any) {
      console.error('Ошибка получения ngrok URL:', error);
      setSaveError(error?.data?.message || 'Ошибка подключения к ngrok.\nУбедитесь, что ngrok запущен: ngrok http 8000');
    } finally {
      setGeneratingWebhook(false);
    }
  };

  const handleGetChatId = async () => {
    setSaveError(null);
    setTestResult(null);
    
    try {
      const response = await getChatId().unwrap();
      
      if (response.success && response.chat_id) {
        // Автоматически обновляем поле adminChatId
        handleSettingChange('adminChatId', response.chat_id);
        
        const userInfo = response.user_info;
        const successMessage = `✅ Chat ID найден и установлен!\n\n` +
          `🆔 Chat ID: ${response.chat_id}\n` +
          `👤 Пользователь: ${userInfo?.first_name} ${userInfo?.last_name}\n` +
          `📱 Username: @${userInfo?.username || 'не указан'}\n` +
          `💬 Сообщение: "${userInfo?.message_text}"\n` +
          `📅 Дата: ${userInfo?.date}`;
        
        setTestResult(successMessage);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setTestResult(null);
        }, 8000);
      }
    } catch (error: any) {
      const errorData = error?.data;
      
      if (errorData?.instruction) {
        const instructionMessage = `${errorData.message}\n\n📋 Инструкция:\n` +
          `1️⃣ ${errorData.instruction.step1}\n` +
          `2️⃣ ${errorData.instruction.step2}\n` +
          `3️⃣ ${errorData.instruction.step3}`;
        setTestResult(instructionMessage);
      } else {
        setSaveError(errorData?.message || 'Ошибка получения Chat ID');
      }
      
      setTimeout(() => {
        setTestResult(null);
        setSaveError(null);
      }, 10000);
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
              onClick={() => window.open('/admin/notifications/templates?channel=telegram', '_blank')}
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
                helperText="Формат: числа:буквы_цифры_дефисы (получите у @BotFather)"
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
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={settings.webhookUrl}
                  onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                  size="small"
                  placeholder="https://yourdomain.com/api/telegram/webhook"
                  helperText="Полный URL для получения сообщений от Telegram (https://)"
                />
                <Button
                  variant="outlined"
                  onClick={handleGenerateWebhookUrl}
                  disabled={generatingWebhook}
                  startIcon={generatingWebhook ? <CircularProgress size={16} /> : <SettingsIcon />}
                  sx={{ 
                    minWidth: 120,
                    height: 40,
                    mt: 0.5,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {generatingWebhook ? 'Получение...' : 'Auto ngrok'}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Admin Chat ID"
                  value={settings.adminChatId}
                  onChange={(e) => handleSettingChange('adminChatId', e.target.value)}
                  size="small"
                  placeholder="123456789"
                  helperText="ID чата администратора (только цифры, может начинаться с -)"
                />
                <Button
                  variant="outlined"
                  onClick={handleGetChatId}
                  disabled={gettingChatId || !settings.botToken}
                  startIcon={gettingChatId ? <CircularProgress size={16} /> : <PersonIcon />}
                  sx={{ 
                    minWidth: 140,
                    height: 40,
                    mt: 0.5,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {gettingChatId ? 'Получение...' : 'Получить Chat ID'}
                </Button>
              </Box>
              
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

      {/* Кнопка сохранения настроек */}
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
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={updating}
              startIcon={updating ? <CircularProgress size={24} /> : <SettingsIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 250,
                boxShadow: theme.shadows[4],
                background: 'linear-gradient(45deg, #0088cc 30%, #00a0e0 90%)',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-1px)',
                  background: 'linear-gradient(45deg, #006699 30%, #0088cc 90%)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {updating ? 'Сохранение настроек...' : '💾 Сохранить настройки Telegram'}
            </Button>

            {saveSuccess && (
              <Alert 
                severity="success" 
                sx={{ width: '100%', maxWidth: 500, textAlign: 'center' }}
                icon={<CheckIcon />}
              >
                ✅ Настройки успешно сохранены!
                {settings.webhookUrl && (
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                    Webhook автоматически установлен
                  </Typography>
                )}
              </Alert>
            )}

            {saveError && (
              <Alert 
                severity="error" 
                sx={{ width: '100%', maxWidth: 500 }}
                icon={<ErrorIcon />}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {saveError}
                </Typography>
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>

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