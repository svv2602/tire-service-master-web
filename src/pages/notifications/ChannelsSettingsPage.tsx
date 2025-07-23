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
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  NotificationsActive as PushIcon,
  Telegram as TelegramIcon,
  TrendingUp as PriorityIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Info as InfoIcon,
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

export const ChannelsSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Подсказки для параметров настроек
  const parameterTooltips = {
    enabled: "Включает или отключает канал уведомлений. Отключенные каналы не будут использоваться для отправки.",
    priority: "Определяет порядок отправки уведомлений (1 - высший приоритет). При сбоях система попробует следующий канал по приоритету.",
    retry_attempts: "Количество повторных попыток отправки при ошибке. Больше попыток = выше надежность, но медленнее обработка сбоев.",
    retry_delay: "Задержка в минутах между повторными попытками. Оптимально: Email 15 мин, Push 5 мин, Telegram 10 мин.",
    daily_limit: "Максимальное количество уведомлений в день через этот канал. Защищает от спама и превышения лимитов провайдера.",
    rate_limit_per_minute: "Максимальное количество уведомлений в минуту. Предотвращает блокировку со стороны провайдера услуг."
  };
  
  // API хуки
  const { data: channelData, isLoading, error, refetch } = useGetNotificationChannelSettingsQuery();
  const [bulkUpdateMutation, { isLoading: isSaving }] = useBulkUpdateChannelSettingsMutation();
  
  // Локальное состояние для изменений
  const [settings, setSettings] = useState<ChannelSettings>({
    email: {},
    push: {},
    telegram: {},
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [zeroValuesApplied, setZeroValuesApplied] = useState(false);

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
      const result = await bulkUpdateMutation({ settings }).unwrap();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
      
      // Обновляем данные
      refetch();
      
      console.log('Настройки успешно сохранены:', result);
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error);
      
      let errorMessage = 'Произошла ошибка при сохранении настроек';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        errorMessage = `Ошибки валидации: ${error.data.errors.join(', ')}`;
      } else if (error?.message) {
        errorMessage = `Ошибка сети: ${error.message}`;
      }
      
      setSaveError(errorMessage);
      setTimeout(() => setSaveError(null), 8000);
    }
  };

  // Функция для установки оптимальных значений по умолчанию
  const setDefaultValues = () => {
    const defaultSettings: ChannelSettings = {
      email: {
        enabled: true,
        priority: 1, // Высший приоритет для важных уведомлений
        retry_attempts: 3, // 3 попытки для надежности
        retry_delay: 15, // 15 минут между попытками
        daily_limit: 1000, // 1000 писем в день - разумный лимит
        rate_limit_per_minute: 10, // 10 писем в минуту - не перегружаем SMTP
      },
      push: {
        enabled: true,
        priority: 2, // Второй приоритет - для быстрых уведомлений
        retry_attempts: 2, // Меньше попыток - push должен быть быстрым
        retry_delay: 5, // Быстрый повтор для push
        daily_limit: 2000, // Больше лимит - push дешевле
        rate_limit_per_minute: 30, // Выше частота - push быстрее
      },
      telegram: {
        enabled: true,
        priority: 3, // Третий приоритет - дополнительный канал
        retry_attempts: 3, // 3 попытки для Telegram API
        retry_delay: 10, // Средняя задержка
        daily_limit: 1500, // Средний лимит
        rate_limit_per_minute: 20, // Умеренная частота
      },
    };
    
    setSettings(defaultSettings);
    setDefaultsApplied(true);
    setTimeout(() => setDefaultsApplied(false), 3000);
  };

  // Функция для сброса к значениям с сервера
  const resetToServerValues = () => {
    if (channelData?.settings) {
      const serverSettings: ChannelSettings = {
        email: {},
        push: {},
        telegram: {},
      };
      
      channelData.settings.forEach((setting: NotificationChannelSetting) => {
        serverSettings[setting.channel_type as keyof ChannelSettings] = {
          enabled: setting.enabled,
          priority: setting.priority,
          retry_attempts: setting.retry_attempts,
          retry_delay: setting.retry_delay,
          daily_limit: setting.daily_limit,
          rate_limit_per_minute: setting.rate_limit_per_minute,
        };
      });
      
      setSettings(serverSettings);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  // Функция для установки всех значений в ноль (отключение всех каналов)
  const setZeroValues = () => {
    const zeroSettings: ChannelSettings = {
      email: {
        enabled: false,
        priority: 1,
        retry_attempts: 0,
        retry_delay: 0,
        daily_limit: 0,
        rate_limit_per_minute: 0,
      },
      push: {
        enabled: false,
        priority: 1,
        retry_attempts: 0,
        retry_delay: 0,
        daily_limit: 0,
        rate_limit_per_minute: 0,
      },
      telegram: {
        enabled: false,
        priority: 1,
        retry_attempts: 0,
        retry_delay: 0,
        daily_limit: 0,
        rate_limit_per_minute: 0,
      },
    };
    
    setSettings(zeroSettings);
    setZeroValuesApplied(true);
    setTimeout(() => setZeroValuesApplied(false), 3000);
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

      <Grid container spacing={3}>
        {/* Статистика каналов */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Статистика доставки за последние 30 дней"
              avatar={<PriorityIcon />}
            />
            <CardContent>
              {statistics && Object.values(statistics).some((stats: any) => stats.sent > 0) ? (
                // Показываем реальную статистику если есть данные
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    📊 Статистика уведомлений за последние 30 дней. Система активно используется!
                  </Typography>
                </Alert>
              ) : (
                // Показываем информацию о готовности к работе
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    🚀 Система уведомлений настроена и готова к работе. 
                    Статистика появится после отправки первых уведомлений.
                  </Typography>
                </Alert>
              )}
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
                        {channel === 'telegram' && (stats as any).active_subscribers !== undefined && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Подписчиков:</Typography>
                            <Typography variant="h6" color="info.main">{(stats as any).active_subscribers}</Typography>
                          </Grid>
                        )}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                  />
                  <Tooltip title={parameterTooltips.enabled} arrow>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Приоритет: {channelSettings?.priority || 1}
                  </Typography>
                  <Tooltip title={parameterTooltips.priority} arrow>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
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
                  InputProps={{
                    endAdornment: (
                      <Tooltip title={parameterTooltips.retry_attempts} arrow>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
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
                  InputProps={{
                    endAdornment: (
                      <Tooltip title={parameterTooltips.retry_delay} arrow>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
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
                  InputProps={{
                    endAdornment: (
                      <Tooltip title={parameterTooltips.daily_limit} arrow>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
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
                  InputProps={{
                    endAdornment: (
                      <Tooltip title={parameterTooltips.rate_limit_per_minute} arrow>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Правила уведомлений - временно убрано, будет реализовано позже */}
        {/* 
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Правила доставки уведомлений"
              avatar={<ScheduleIcon />}
            />
            <CardContent>
              <Alert severity="info">
                Функция правил доставки будет реализована в следующих версиях.
                Сейчас все уведомления отправляются согласно настройкам каналов выше.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        */}
      </Grid>

      {/* Кнопки действий */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={setDefaultValues}
          color="primary"
        >
          Значения по умолчанию
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={resetToServerValues}
          >
            Сбросить изменения
          </Button>
          <Button
            variant="outlined"
            onClick={setZeroValues}
          >
            Отключить все
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

      {/* Уведомления о результатах действий */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            ✅ Настройки каналов успешно сохранены!
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Все изменения применены и будут использоваться при отправке уведомлений.
          </Typography>
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            ❌ Ошибка сохранения настроек
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {saveError}
          </Typography>
        </Alert>
      )}

      {defaultsApplied && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            📋 Применены оптимальные значения по умолчанию для всех каналов!
            <br />
            <strong>Не забудьте сохранить изменения.</strong>
          </Typography>
        </Alert>
      )}

      {resetSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            🔄 Настройки успешно сброшены к последним сохраненным значениям!
          </Typography>
        </Alert>
      )}

      {zeroValuesApplied && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            ⚠️ Все каналы уведомлений отключены!
            <br />
            <strong>Система не будет отправлять уведомления пока вы не включите хотя бы один канал.</strong>
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ChannelsSettingsPage; 