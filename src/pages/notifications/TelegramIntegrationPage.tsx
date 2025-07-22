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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Edit as EditIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Message as MessageIcon,
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
  welcomeMessage: string;
  helpMessage: string;
  errorMessage: string;
}

interface TelegramSubscription {
  id: number;
  chatId: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  subscribedAt: string;
  notificationTypes: string[];
}

interface TelegramTemplate {
  id: number;
  name: string;
  type: 'booking_confirmation' | 'booking_reminder' | 'status_update' | 'welcome' | 'error';
  template: string;
  variables: string[];
  isActive: boolean;
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
    welcomeMessage: 'Ласкаво просимо до системи сповіщень шиномонтажу! 🚗\n\nТепер ви будете отримувати сповіщення про ваші записи.',
    helpMessage: 'Доступні команди:\n/start - Почати роботу з ботом\n/help - Показати це повідомлення\n/status - Статус підписки\n/unsubscribe - Скасувати підписку',
    errorMessage: 'Вибачте, сталася помилка. Спробуйте пізніше або зверніться до підтримки.',
  });
  
  // Шаблоны (пока моковые, можно добавить API позже)
  const [templates, setTemplates] = useState<TelegramTemplate[]>([
    {
      id: 1,
      name: 'Підтвердження запису',
      type: 'booking_confirmation',
      template: '✅ Ваш запис підтверджено!\n\n📅 Дата: {date}\n🕐 Час: {time}\n📍 Адреса: {address}\n🚗 Послуга: {service}\n\nОчікуємо вас!',
      variables: ['date', 'time', 'address', 'service'],
      isActive: true,
    },
    {
      id: 2,
      name: 'Нагадування про запис',
      type: 'booking_reminder',
      template: '⏰ Нагадуємо про ваш запис завтра!\n\n📅 Дата: {date}\n🕐 Час: {time}\n📍 Адреса: {address}\n\nДо зустрічі!',
      variables: ['date', 'time', 'address'],
      isActive: true,
    },
    {
      id: 3,
      name: 'Зміна статусу',
      type: 'status_update',
      template: '📢 Статус вашого запису змінено: {status}\n\n📅 Дата: {date}\n🕐 Час: {time}\n\n{additional_info}',
      variables: ['status', 'date', 'time', 'additional_info'],
      isActive: true,
    },
  ]);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [templateDialog, setTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TelegramTemplate | null>(null);
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
        welcomeMessage: apiSettings.welcome_message,
        helpMessage: apiSettings.help_message,
        errorMessage: apiSettings.error_message,
      });
    }
  }, [settingsData]);

  const handleSettingChange = (field: keyof TelegramSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Генерация QR кода
  const generateQRCode = async () => {
    const botUrl = settings.botUsername ? `https://t.me/${settings.botUsername}` : 'https://t.me/your_bot_name';
    setQrCodeUrl(botUrl);
    
    if (qrCanvasRef.current) {
      try {
        await QRCode.toCanvas(qrCanvasRef.current, botUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Ошибка генерации QR кода:', error);
      }
    }
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
        welcome_message: settings.welcomeMessage,
        help_message: settings.helpMessage,
        error_message: settings.errorMessage,
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

  const handleEditTemplate = (template: TelegramTemplate) => {
    setSelectedTemplate(template);
    setTemplateDialog(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id ? selectedTemplate : t
      ));
    }
    setTemplateDialog(false);
    setSelectedTemplate(null);
  };

  const getStatusChip = (status: boolean, trueLabel: string, falseLabel: string) => (
    <Chip
      icon={status ? <CheckIcon /> : <ErrorIcon />}
      label={status ? trueLabel : falseLabel}
      color={status ? 'success' : 'error'}
      size="small"
    />
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (settingsError) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки настроек Telegram. Попробуйте обновить страницу.
        </Alert>
      </Box>
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
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки успешно сохранены!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статус системы */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Статус Telegram бота"
              avatar={<SettingsIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Статус системы:</Typography>
                    <Chip 
                      label={settingsData?.telegram_settings?.status_text || 'Неизвестно'} 
                      color={settingsData?.telegram_settings?.status_color as any || 'default'} 
                      size="small" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Webhook:</Typography>
                    {getStatusChip(!!settings.webhookUrl, 'Настроен', 'Не настроен')}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Подписчиков:</Typography>
                    <Chip label={settingsData?.statistics?.active_subscriptions || 0} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Готов к продакшену:</Typography>
                    {getStatusChip(settingsData?.telegram_settings?.ready_for_production || false, 'Да', 'Нет')}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Основные настройки */}
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
                    checked={settings.autoSubscription}
                    onChange={(e) => handleSettingChange('autoSubscription', e.target.checked)}
                  />
                }
                label="Автоматическая подписка новых пользователей"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.testMode}
                    onChange={(e) => handleSettingChange('testMode', e.target.checked)}
                  />
                }
                label="Тестовый режим"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* QR код и тест */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Управление и тестирование"
              avatar={<QrCodeIcon />}
            />
            <CardContent>
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={() => {
                  setQrCodeDialog(true);
                  setTimeout(generateQRCode, 100); // Небольшая задержка для рендера canvas
                }}
                fullWidth
                sx={{ mb: 2 }}
              >
                Показать QR код бота
              </Button>
              
              <Button
                variant="outlined"
                startIcon={testLoading ? <CircularProgress size={20} /> : <SendIcon />}
                onClick={handleTestMessage}
                disabled={testLoading || !settings.enabled || !settings.botToken}
                fullWidth
                sx={{ mb: 2 }}
              >
                {testLoading ? 'Отправка...' : 'Отправить тестовое сообщение'}
              </Button>

              {testResult && (
                <Alert 
                  severity={testResult.includes('успішно') ? 'success' : 'error'} 
                  sx={{ mb: 2 }}
                >
                  {testResult}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Ссылка на бота"
                value={settings.botUsername ? `https://t.me/${settings.botUsername}` : ''}
                onChange={(e) => {
                  const url = e.target.value;
                  const username = url.replace('https://t.me/', '');
                  handleSettingChange('botUsername', username);
                }}
                sx={{ mb: 2 }}
                size="small"
                placeholder="https://t.me/your_bot_name"
                helperText="Введите имя пользователя бота (без @) или полную ссылку"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Сообщения бота (украинские тексты) */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Сообщения бота (украинский язык)"
              avatar={<MessageIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Приветственное сообщение"
                    value={settings.welcomeMessage}
                    onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                    multiline
                    rows={4}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Сообщение помощи"
                    value={settings.helpMessage}
                    onChange={(e) => handleSettingChange('helpMessage', e.target.value)}
                    multiline
                    rows={4}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Сообщение об ошибке"
                    value={settings.errorMessage}
                    onChange={(e) => handleSettingChange('errorMessage', e.target.value)}
                    multiline
                    rows={4}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Подписчики */}
        <Grid item xs={12} md={6}>
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

        {/* Шаблоны сообщений */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Шаблоны сообщений"
              avatar={<CodeIcon />}
              action={
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setTemplateDialog(true)}
                  size="small"
                >
                  Добавить
                </Button>
              }
            />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              {templates.map((template) => (
                <Accordion key={template.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {template.name}
                      </Typography>
                      <Chip 
                        label={template.type} 
                        size="small" 
                        color={template.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Переменные: {template.variables.join(', ')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'background.default', 
                        p: 1, 
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {template.template}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditTemplate(template)}
                      >
                        Редактировать
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
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
                mb: 2
              }}
            >
              <canvas 
                ref={qrCanvasRef}
                style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Отсканируйте QR код для быстрой подписки на уведомления
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
              {qrCodeUrl || (settings.botUsername ? `https://t.me/${settings.botUsername}` : 'https://t.me/your_bot_name')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Редактировать шаблон' : 'Добавить шаблон'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Название шаблона"
              value={selectedTemplate?.name || ''}
              onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Тип шаблона</InputLabel>
              <Select
                value={selectedTemplate?.type || ''}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, type: e.target.value as any} : null)}
              >
                <MenuItem value="booking_confirmation">Подтверждение записи</MenuItem>
                <MenuItem value="booking_reminder">Напоминание о записи</MenuItem>
                <MenuItem value="status_update">Изменение статуса</MenuItem>
                <MenuItem value="welcome">Приветствие</MenuItem>
                <MenuItem value="error">Ошибка</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Шаблон сообщения (украинский язык)"
              value={selectedTemplate?.template || ''}
              onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, template: e.target.value} : null)}
              multiline
              rows={6}
              sx={{ mb: 2 }}
              placeholder="Введіть текст повідомлення. Використовуйте {variable} для змінних."
            />
            
            <TextField
              fullWidth
              label="Переменные (через запятую)"
              value={selectedTemplate?.variables.join(', ') || ''}
              onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, variables: e.target.value.split(',').map(v => v.trim())} : null)}
              placeholder="date, time, address, service"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TelegramIntegrationPage; 