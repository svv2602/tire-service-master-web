import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  NotificationsActive as PushIcon,
  Telegram as TelegramIcon,
  Schedule as ScheduleIcon,
  TrendingUp as PriorityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';
import {
  useGetNotificationChannelSettingsQuery,
  useBulkUpdateChannelSettingsMutation,
  NotificationChannelSetting,
  ChannelStatistics,
  UpdateChannelSettingRequest,
} from '../../api/notificationChannelSettings.api';

interface ChannelSettings {
  [key: string]: UpdateChannelSettingRequest;
  email: UpdateChannelSettingRequest;
  push: UpdateChannelSettingRequest;
  telegram: UpdateChannelSettingRequest;
}

interface NotificationRule {
  id: number;
  name: string;
  eventType: string;
  channels: ('email' | 'push' | 'telegram')[];
  conditions: {
    userRole?: string[];
    timeRange?: {
      start: string;
      end: string;
    };
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  isActive: boolean;
}

export const ChannelsSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  // API хуки
  const { data: channelData, isLoading, error, refetch } = useGetNotificationChannelSettingsQuery();
  const [bulkUpdateMutation, { isLoading: isSaving }] = useBulkUpdateChannelSettingsMutation();
  
  // Локальное состояние для изменений
  const [settings, setSettings] = useState<ChannelSettings>({
    email: {},
    push: {},
    telegram: {},
  });
  
  // Статические правила (можно позже вынести в API)
  const [rules] = useState<NotificationRule[]>([
    {
      id: 1,
      name: 'Подтверждение бронирования',
      eventType: 'booking_confirmation',
      channels: ['email', 'telegram'],
      conditions: {
        userRole: ['client'],
        priority: 'high',
      },
      isActive: true,
    },
    {
      id: 2,
      name: 'Напоминание о записи',
      eventType: 'booking_reminder',
      channels: ['push', 'telegram'],
      conditions: {
        userRole: ['client'],
        timeRange: { start: '08:00', end: '22:00' },
        priority: 'medium',
      },
      isActive: true,
    },
    {
      id: 3,
      name: 'Системные уведомления админам',
      eventType: 'system_alert',
      channels: ['email', 'push', 'telegram'],
      conditions: {
        userRole: ['admin', 'manager'],
        priority: 'critical',
      },
      isActive: true,
    },
  ]);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Инициализация локального состояния при загрузке данных
  React.useEffect(() => {
    if (channelData?.settings) {
      const newSettings: ChannelSettings = {
        email: {},
        push: {},
        telegram: {},
      };
      
      channelData.settings.forEach((setting: NotificationChannelSetting) => {
        newSettings[setting.channel_type as keyof ChannelSettings] = {
          enabled: setting.enabled,
          priority: setting.priority,
          retry_attempts: setting.retry_attempts,
          retry_delay: setting.retry_delay,
          daily_limit: setting.daily_limit,
          rate_limit_per_minute: setting.rate_limit_per_minute,
        };
      });
      
      setSettings(newSettings);
    }
  }, [channelData]);

  const handleChannelSettingChange = (
    channel: keyof ChannelSettings,
    field: keyof UpdateChannelSettingRequest,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await bulkUpdateMutation({ settings }).unwrap();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Обновляем данные
      refetch();
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error);
      setSaveError(error?.data?.message || 'Произошла ошибка при сохранении настроек');
    }
  };

  const handleToggleRule = (id: number) => {
    // Здесь будет логика для правил уведомлений (если понадобится API)
    console.log('Toggle rule:', id);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon />;
      case 'push': return <PushIcon />;
      case 'telegram': return <TelegramIcon />;
      default: return <SettingsIcon />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return '#d32f2f';
      case 'push': return '#1976d2';
      case 'telegram': return '#0088cc';
      default: return theme.palette.text.secondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getDeliveryRate = (sent: number, delivered: number) => {
    return sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0.0';
  };

  // Обработка состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка при загрузке настроек каналов. Пожалуйста, попробуйте позже.
        </Alert>
      </Box>
    );
  }

  const statistics = channelData?.statistics;
  const summary = channelData?.summary;

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={tablePageStyles.pageTitle}>
            Настройки каналов уведомлений
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Управление общими настройками доставки уведомлений по всем каналам
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки успешно сохранены!
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статистика каналов */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Статистика доставки за последние 30 дней"
              avatar={<PriorityIcon />}
            />
            <CardContent>
              <Grid container spacing={3}>
                {statistics && Object.entries(statistics).map(([channel, stats]) => (
                  <Grid item xs={12} md={4} key={channel}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {React.cloneElement(getChannelIcon(channel), {
                          sx: { fontSize: 32, color: getChannelColor(channel) }
                        })}
                      </Box>
                      <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                        {channel === 'email' ? 'Email' : channel === 'push' ? 'Push' : 'Telegram'}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Отправлено:</Typography>
                          <Typography variant="h6">{(stats as any).sent}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Доставлено:</Typography>
                          <Typography variant="h6" color="success.main">{(stats as any).delivered}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Ошибки:</Typography>
                          <Typography variant="h6" color="error.main">{(stats as any).failed}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Успешность:</Typography>
                          <Typography variant="h6" color="primary.main">
                            {getDeliveryRate((stats as any).sent, (stats as any).delivered)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Настройки каналов */}
        {Object.entries(settings).map(([channelKey, channelSettings]) => (
          <Grid item xs={12} md={4} key={channelKey}>
            <Card>
              <CardHeader 
                title={`${channelKey === 'email' ? 'Email' : channelKey === 'push' ? 'Push' : 'Telegram'} канал`}
                avatar={getChannelIcon(channelKey)}
              />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={channelSettings?.enabled || false}
                      onChange={(e) => handleChannelSettingChange(
                        channelKey as keyof ChannelSettings,
                        'enabled',
                        e.target.checked
                      )}
                    />
                  }
                  label="Включить канал"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" gutterBottom>
                  Приоритет: {channelSettings?.priority || 1}
                </Typography>
                <Slider
                  value={channelSettings?.priority || 1}
                  onChange={(_, value) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'priority',
                    value
                  )}
                  min={1}
                  max={10}
                  marks
                  step={1}
                  disabled={!channelSettings?.enabled}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Попытки повтора"
                  type="number"
                  value={channelSettings?.retry_attempts || 0}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'retry_attempts',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings?.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Задержка повтора (мин)"
                  type="number"
                  value={channelSettings?.retry_delay || 0}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'retry_delay',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings?.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Лимит в день"
                  type="number"
                  value={channelSettings?.daily_limit || 0}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'daily_limit',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings?.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Лимит в минуту"
                  type="number"
                  value={channelSettings?.rate_limit_per_minute || 0}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'rate_limit_per_minute',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings?.enabled}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Правила уведомлений */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Правила доставки уведомлений"
              avatar={<ScheduleIcon />}
              action={
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  variant="outlined"
                >
                  Добавить правило
                </Button>
              }
            />
            <CardContent>
              <List>
                {rules.map((rule) => (
                  <Accordion key={rule.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {rule.name}
                        </Typography>
                        <Chip 
                          label={rule.eventType} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={rule.conditions.priority} 
                          size="small" 
                          color={getPriorityColor(rule.conditions.priority || 'default') as any}
                        />
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                          {rule.channels.map((channel) => (
                            <Chip
                              key={channel}
                              icon={getChannelIcon(channel)}
                              label={channel}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                        <Switch
                          checked={rule.isActive}
                          onChange={() => handleToggleRule(rule.id)}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Условия:
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {rule.conditions.userRole && (
                              <Typography variant="body2">
                                • Роли: {rule.conditions.userRole.join(', ')}
                              </Typography>
                            )}
                            {rule.conditions.timeRange && (
                              <Typography variant="body2">
                                • Время: {rule.conditions.timeRange.start} - {rule.conditions.timeRange.end}
                              </Typography>
                            )}
                            {rule.conditions.priority && (
                              <Typography variant="body2">
                                • Приоритет: {rule.conditions.priority}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Действия:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              variant="outlined"
                            >
                              Редактировать
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              variant="outlined"
                            >
                              Удалить
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кнопки действий */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Сбросить
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChannelsSettingsPage; 