import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Notifications as PushIcon,
  Telegram as TelegramIcon,
  Google as GoogleIcon,
  NotificationsActive as NotificationChannelIcon,
  Storage as SystemIcon,
  Timeline as TimelineIcon,
  Launch as LaunchIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetSettingsDiagnosticsQuery } from '../../api/settingsDiagnostics.api';
import { getTablePageStyles } from '../../styles';
import type { 
  SettingsDiagnosticsResponse, 
  OverallStatus,
  Recommendation,
  SystemSettingsDiagnostics,
  EmailSettingsDiagnostics,
  PushSettingsDiagnostics,
  TelegramSettingsDiagnostics,
  GoogleOAuthSettingsDiagnostics,
  NotificationChannelsDiagnostics
} from '../../api/settingsDiagnostics.api';

// Вспомогательный тип для компонентов с общими полями
type ComponentDiagnostics = 
  | SystemSettingsDiagnostics 
  | EmailSettingsDiagnostics 
  | PushSettingsDiagnostics 
  | TelegramSettingsDiagnostics 
  | GoogleOAuthSettingsDiagnostics 
  | NotificationChannelsDiagnostics;

const SettingsDiagnosticsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
  
  const { 
    data: diagnosticsData, 
    error, 
    isLoading, 
    refetch 
  } = useGetSettingsDiagnosticsQuery();

  const handlePanelChange = (panel: string) => (
    event: React.SyntheticEvent, 
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      case 'enabled':
      case 'configured':
        return 'success';
      case 'disabled':
      case 'not_configured':
        return 'error';
      default:
        return 'default';
    }
  };

  // Вспомогательная функция для получения статуса компонента
  const getComponentStatus = (data: ComponentDiagnostics) => {
    // Для NotificationChannelsDiagnostics статус определяется по количеству активных каналов
    if ('enabled_channels' in data) {
      return data.enabled_channels > 0 ? 'enabled' : 'disabled';
    }
    // Для остальных компонентов используем поле status
    return (data as any).status || 'unknown';
  };

  // Функция для получения URL настройки компонента
  const getConfigurationUrl = (componentKey: string) => {
    const urlMap: Record<string, string> = {
      'system_settings': '/admin/system-settings',
      'email_settings': '/admin/notifications/email',
      'push_settings': '/admin/notifications/push-settings',
      'telegram_settings': '/admin/notifications/telegram',
      'google_oauth_settings': '/admin/notifications/google-oauth',
      'notification_channels': '/admin/notifications/channels',
    };
    return urlMap[componentKey] || '/admin/settings';
  };

  // Функция для проверки поддержки тестирования компонентом
  const supportsConnectionTest = (componentKey: string) => {
    return ['email_settings', 'telegram_settings', 'push_settings'].includes(componentKey);
  };

  // Функция для получения URL тестирования компонента
  const getTestUrl = (componentKey: string) => {
    const testUrlMap: Record<string, string> = {
      'email_settings': '/admin/notifications/email#test',
      'telegram_settings': '/admin/notifications/telegram#test',
      'push_settings': '/admin/notifications/push-settings#test',
    };
    return testUrlMap[componentKey];
  };

  const getStatusIcon = (status: string, ready?: boolean) => {
    if (ready === true) return <CheckCircleIcon color="success" />;
    if (ready === false) return <ErrorIcon color="error" />;
    
    switch (status) {
      case 'healthy':
      case 'enabled':
      case 'configured':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
      case 'disabled':
      case 'not_configured':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'system_settings':
        return <SystemIcon />;
      case 'email_settings':
        return <EmailIcon />;
      case 'push_settings':
        return <PushIcon />;
      case 'telegram_settings':
        return <TelegramIcon />;
      case 'google_oauth_settings':
        return <GoogleIcon />;
      case 'notification_channels':
        return <NotificationChannelIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const renderOverallStatus = (overallStatus: OverallStatus) => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={getStatusIcon(overallStatus.status)}
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Общий статус системы
          </Typography>
        }
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {overallStatus.score}%
            </Typography>
            <Tooltip title="Обновить диагностику">
              <IconButton onClick={() => refetch()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={overallStatus.score}
            color={overallStatus.score >= 80 ? 'success' : overallStatus.score >= 60 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Chip
              icon={<ErrorIcon />}
              label={`Критические проблемы: ${overallStatus.issues_count}`}
              color={overallStatus.issues_count > 0 ? 'error' : 'default'}
              variant={overallStatus.issues_count > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip
              icon={<WarningIcon />}
              label={`Предупреждения: ${overallStatus.warnings_count}`}
              color={overallStatus.warnings_count > 0 ? 'warning' : 'default'}
              variant={overallStatus.warnings_count > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip
              icon={<CheckCircleIcon />}
              label={`Статус: ${overallStatus.status === 'healthy' ? 'Здоровый' : overallStatus.status === 'warning' ? 'Предупреждение' : 'Критический'}`}
              color={getStatusColor(overallStatus.status) as any}
            />
          </Grid>
        </Grid>

        {overallStatus.issues.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Критические проблемы:
            </Typography>
            <List dense>
              {overallStatus.issues.map((issue, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText primary={issue} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {overallStatus.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Предупреждения:
            </Typography>
            <List dense>
              {overallStatus.warnings.map((warning, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderRecommendations = (recommendations: Recommendation[]) => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<TimelineIcon />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Рекомендации по улучшению
          </Typography>
        }
      />
      <CardContent>
        {recommendations.length === 0 ? (
          <Alert severity="success">
            <Typography>Все основные компоненты настроены корректно!</Typography>
          </Alert>
        ) : (
          <Stack spacing={2}>
            {recommendations.map((recommendation, index) => (
              <Alert
                key={index}
                severity={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'info'}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate(recommendation.action_url)}
                    endIcon={<LaunchIcon />}
                  >
                    Настроить
                  </Button>
                }
              >
                <Typography variant="body2">
                  <strong>{recommendation.component.toUpperCase()}:</strong> {recommendation.message}
                </Typography>
              </Alert>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const renderComponentDiagnostics = () => {
    if (!diagnosticsData) return null;

    const components = [
      {
        key: 'system_settings',
        title: 'Системные настройки LLM и база авто',
        data: diagnosticsData.diagnostics.system_settings,
      },
      {
        key: 'email_settings',
        title: 'Email уведомления',
        data: diagnosticsData.diagnostics.email_settings,
      },
      {
        key: 'push_settings',
        title: 'Push уведомления',
        data: diagnosticsData.diagnostics.push_settings,
      },
      {
        key: 'telegram_settings',
        title: 'Telegram интеграция',
        data: diagnosticsData.diagnostics.telegram_settings,
      },
      {
        key: 'google_oauth_settings',
        title: 'Google OAuth',
        data: diagnosticsData.diagnostics.google_oauth_settings,
      },
      {
        key: 'notification_channels',
        title: 'Каналы уведомлений',
        data: diagnosticsData.diagnostics.notification_channels,
      },
    ];

    return (
      <Box>
        {components.map((component) => (
          <Accordion
            key={component.key}
            expanded={expandedPanel === component.key}
            onChange={handlePanelChange(component.key)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>
                  {getComponentIcon(component.key)}
                </Box>
                <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                  {component.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  {getStatusIcon(
                    getComponentStatus(component.data),
                    (component.data as any).ready_for_production
                  )}
                  <Chip
                    size="small"
                    label={
                      (component.data as any).ready_for_production === true
                        ? 'Готов к продакшену'
                        : (component.data as any).ready_for_production === false
                        ? 'Не готов'
                        : getComponentStatus(component.data) === 'enabled'
                        ? 'Включен'
                        : getComponentStatus(component.data) === 'disabled'
                        ? 'Отключен'
                        : getComponentStatus(component.data) === 'configured'
                        ? 'Настроен'
                        : 'Не настроен'
                    }
                    color={getStatusColor(
                      (component.data as any).ready_for_production !== undefined
                        ? ((component.data as any).ready_for_production ? 'enabled' : 'disabled')
                        : getComponentStatus(component.data)
                    ) as any}
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем открытие/закрытие аккордеона
                      navigate(getConfigurationUrl(component.key));
                    }}
                    sx={{ 
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5
                    }}
                  >
                    Настроить
                  </Button>
                  {supportsConnectionTest(component.key) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      startIcon={<TestIcon />}
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем открытие/закрытие аккордеона
                        navigate(getTestUrl(component.key) || getConfigurationUrl(component.key));
                      }}
                      sx={{ 
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5
                      }}
                    >
                      Тест
                    </Button>
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderComponentDetails(component.key, component.data)}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderComponentDetails = (componentKey: string, data: ComponentDiagnostics) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Основная информация:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Статус"
                secondary={getComponentStatus(data) === 'enabled' ? 'Включен' : getComponentStatus(data) === 'disabled' ? 'Отключен' : getComponentStatus(data) === 'configured' ? 'Настроен' : 'Не настроен'}
              />
            </ListItem>
            {'configured' in data && data.configured !== undefined && (
              <ListItem>
                <ListItemText
                  primary="Конфигурация"
                  secondary={data.configured ? 'Настроена' : 'Не настроена'}
                />
              </ListItem>
            )}
            {'ready_for_production' in data && data.ready_for_production !== undefined && (
              <ListItem>
                <ListItemText
                  primary="Готовность к продакшену"
                  secondary={data.ready_for_production ? 'Готов' : 'Не готов'}
                />
              </ListItem>
            )}
            {'last_updated' in data && data.last_updated && (
              <ListItem>
                <ListItemText
                  primary="Последнее обновление"
                  secondary={data.last_updated}
                />
              </ListItem>
            )}
          </List>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {'issues' in data && data.issues && data.issues.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                Проблемы:
              </Typography>
              <List dense>
                {data.issues.map((issue: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={issue} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {/* Дополнительные детали для каждого компонента */}
          {componentKey === 'system_settings' && 'details' in data && data.details && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Категории настроек:
              </Typography>
              {data.details.map((category: any, index: number) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mr: 1 }}>
                      {category.category}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${category.configured_count}/${category.settings_count}`}
                      color={category.configured_count === category.settings_count ? 'success' : category.configured_count > 0 ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Grid container spacing={1}>
                    {category.settings.map((setting: any, settingIndex: number) => (
                      <Grid item xs={12} sm={6} md={4} key={settingIndex}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            border: 1,
                            borderColor: setting.configured ? 'success.main' : 'error.main',
                            borderRadius: 1,
                            bgcolor: setting.configured ? 'success.light' : 'error.light',
                            opacity: setting.configured ? 1 : 0.7,
                          }}
                        >
                          <Box sx={{ mr: 1 }}>
                            {setting.configured ? (
                              <CheckCircleIcon fontSize="small" color="success" />
                            ) : (
                              <ErrorIcon fontSize="small" color="error" />
                            )}
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.75rem'
                              }}
                              title={setting.key}
                            >
                              {setting.key}
                            </Typography>
                            {setting.is_sensitive && (
                              <Chip
                                size="small"
                                label="sensitive"
                                sx={{ 
                                  height: 16, 
                                  fontSize: '0.6rem',
                                  '& .MuiChip-label': { px: 0.5 }
                                }}
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </>
          )}
          
          {componentKey === 'notification_channels' && 'channels_by_priority' in data && data.channels_by_priority && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Каналы по приоритету:
              </Typography>
              <List dense>
                {data.channels_by_priority.map((channel: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${channel.priority}. ${channel.name}`}
                      secondary={`Лимит: ${channel.daily_limit}/день, ${channel.rate_limit_per_minute}/мин`}
                    />
                    <Chip
                      size="small"
                      label={channel.enabled ? 'Активен' : 'Отключен'}
                      color={channel.enabled ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Grid>
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки диагностики настроек. Попробуйте обновить страницу.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок страницы */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Диагностика настроек системы
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Мониторинг конфигурации и статуса всех компонентов системы
        </Typography>
        {diagnosticsData && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Обновлено: {diagnosticsData.server_time}
          </Typography>
        )}
      </Box>

      {diagnosticsData && (
        <>
          {/* Общий статус */}
          {renderOverallStatus(diagnosticsData.diagnostics.overall_status)}
          
          {/* Рекомендации */}
          {renderRecommendations(diagnosticsData.diagnostics.overall_status.recommendations)}
          
          {/* Детальная диагностика компонентов */}
          <Card>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Детальная диагностика компонентов
                </Typography>
              }
            />
            <CardContent>
              {renderComponentDiagnostics()}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default SettingsDiagnosticsPage;