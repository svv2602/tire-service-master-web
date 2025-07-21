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
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles/components';

interface ChannelSettings {
  email: {
    enabled: boolean;
    priority: number;
    retryAttempts: number;
    retryDelay: number; // в минутах
    dailyLimit: number;
    rateLimitPerMinute: number;
  };
  push: {
    enabled: boolean;
    priority: number;
    retryAttempts: number;
    retryDelay: number;
    dailyLimit: number;
    rateLimitPerMinute: number;
  };
  telegram: {
    enabled: boolean;
    priority: number;
    retryAttempts: number;
    retryDelay: number;
    dailyLimit: number;
    rateLimitPerMinute: number;
  };
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

interface ChannelStatistics {
  email: {
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;
  };
  push: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
  telegram: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };
}

export const ChannelsSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [settings, setSettings] = useState<ChannelSettings>({
    email: {
      enabled: true,
      priority: 1,
      retryAttempts: 3,
      retryDelay: 15,
      dailyLimit: 1000,
      rateLimitPerMinute: 60,
    },
    push: {
      enabled: true,
      priority: 2,
      retryAttempts: 2,
      retryDelay: 5,
      dailyLimit: 2000,
      rateLimitPerMinute: 120,
    },
    telegram: {
      enabled: true,
      priority: 3,
      retryAttempts: 3,
      retryDelay: 10,
      dailyLimit: 1500,
      rateLimitPerMinute: 100,
    },
  });
  
  const [rules, setRules] = useState<NotificationRule[]>([
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
  
  const [statistics] = useState<ChannelStatistics>({
    email: {
      sent: 1250,
      delivered: 1180,
      failed: 45,
      bounced: 25,
    },
    push: {
      sent: 2100,
      delivered: 1950,
      failed: 150,
      clicked: 890,
    },
    telegram: {
      sent: 980,
      delivered: 945,
      failed: 35,
      read: 820,
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChannelSettingChange = (
    channel: keyof ChannelSettings,
    field: string,
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
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // Здесь будет API вызов для сохранения настроек
      // await saveChannelSettings(settings);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = (id: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
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
                {Object.entries(statistics).map(([channel, stats]) => (
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
                          <Typography variant="h6">{stats.sent}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Доставлено:</Typography>
                          <Typography variant="h6" color="success.main">{stats.delivered}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Ошибки:</Typography>
                          <Typography variant="h6" color="error.main">{stats.failed}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Успешность:</Typography>
                          <Typography variant="h6" color="primary.main">
                            {getDeliveryRate(stats.sent, stats.delivered)}%
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
                      checked={channelSettings.enabled}
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
                  Приоритет: {channelSettings.priority}
                </Typography>
                <Slider
                  value={channelSettings.priority}
                  onChange={(_, value) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'priority',
                    value
                  )}
                  min={1}
                  max={10}
                  marks
                  step={1}
                  disabled={!channelSettings.enabled}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Попытки повтора"
                  type="number"
                  value={channelSettings.retryAttempts}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'retryAttempts',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Задержка повтора (мин)"
                  type="number"
                  value={channelSettings.retryDelay}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'retryDelay',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Лимит в день"
                  type="number"
                  value={channelSettings.dailyLimit}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'dailyLimit',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings.enabled}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Лимит в минуту"
                  type="number"
                  value={channelSettings.rateLimitPerMinute}
                  onChange={(e) => handleChannelSettingChange(
                    channelKey as keyof ChannelSettings,
                    'rateLimitPerMinute',
                    parseInt(e.target.value)
                  )}
                  disabled={!channelSettings.enabled}
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChannelsSettingsPage; 