import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetSuspiciousActivityQuery } from '../../../api/auditLogs.api';

interface SuspiciousActivityDashboardProps {
  onUserClick?: (userId: number) => void;
  onIpClick?: (ipAddress: string) => void;
}

export const SuspiciousActivityDashboard: React.FC<SuspiciousActivityDashboardProps> = ({
  onUserClick,
  onIpClick,
}) => {
  const [period, setPeriod] = useState(7);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frequent_failed_logins: true,
    multiple_ip_logins: true,
    bulk_data_changes: false,
    suspicious_ips: false,
    off_hours_activity: false,
    unusual_access_patterns: false,
  });

  const { data, isLoading, error, refetch } = useGetSuspiciousActivityQuery({ days: period });

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSeverityColor = (severity: 'high' | 'medium') => {
    return severity === 'high' ? 'error' : 'warning';
  };

  const getSeverityIcon = (severity: 'high' | 'medium') => {
    return severity === 'high' ? <ErrorIcon /> : <WarningIcon />;
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'frequent_failed_logins':
        return <SecurityIcon />;
      case 'multiple_ip_logins':
        return <ComputerIcon />;
      case 'bulk_data_changes':
        return <PersonIcon />;
      case 'suspicious_ips':
        return <ComputerIcon />;
      case 'off_hours_activity':
        return <ScheduleIcon />;
      case 'unusual_access_patterns':
        return <WarningIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'frequent_failed_logins':
        return 'Частые неудачные попытки входа';
      case 'multiple_ip_logins':
        return 'Множественные входы с разных IP';
      case 'bulk_data_changes':
        return 'Массовые изменения данных';
      case 'suspicious_ips':
        return 'Подозрительные IP адреса';
      case 'off_hours_activity':
        return 'Активность в нерабочее время';
      case 'unusual_access_patterns':
        return 'Необычные паттерны доступа';
      default:
        return section;
    }
  };

  const renderFailedLogins = () => {
    const items = data?.suspicious_activity.frequent_failed_logins || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onIpClick?.(item.ip_address)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={`IP: ${item.ip_address}`}
              secondary={`${item.failed_attempts} попыток в ${format(new Date(item.hour), 'HH:mm dd.MM.yyyy', { locale: ru })}`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderMultipleIpLogins = () => {
    const items = data?.suspicious_activity.multiple_ip_logins || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onUserClick?.(item.user_id)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={item.user_email}
              secondary={`${item.unique_ips} уникальных IP в ${format(new Date(item.date), 'dd.MM.yyyy', { locale: ru })}`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderBulkDataChanges = () => {
    const items = data?.suspicious_activity.bulk_data_changes || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onUserClick?.(item.user_id)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={item.user_email}
              secondary={`${item.changes_count} изменений в ${format(new Date(item.hour), 'HH:mm dd.MM.yyyy', { locale: ru })}`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderSuspiciousIps = () => {
    const items = data?.suspicious_activity.suspicious_ips || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onIpClick?.(item.ip_address)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={`IP: ${item.ip_address}`}
              secondary={`${item.total_requests} запросов от ${item.unique_users} пользователей`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderOffHoursActivity = () => {
    const items = data?.suspicious_activity.off_hours_activity || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onUserClick?.(item.user_id)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={item.user_email}
              secondary={`${item.off_hours_activity} действий в нерабочее время`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderUnusualAccessPatterns = () => {
    const items = data?.suspicious_activity.unusual_access_patterns || [];
    if (items.length === 0) return null;

    return (
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => onUserClick?.(item.user_id)}
          >
            <ListItemIcon>
              {getSeverityIcon(item.severity)}
            </ListItemIcon>
            <ListItemText
              primary={item.user_email}
              secondary={`${item.recent_access_count} обращений к ${item.resource_type} (${item.pattern})`}
            />
            <Chip
              label={item.severity === 'high' ? 'Высокий' : 'Средний'}
              color={getSeverityColor(item.severity)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderSection = (sectionKey: string, renderContent: () => React.ReactNode) => {
    const sectionData = data?.suspicious_activity[sectionKey as keyof typeof data.suspicious_activity] || [];
    const itemCount = Array.isArray(sectionData) ? sectionData.length : 0;
    const highSeverityCount = Array.isArray(sectionData) 
      ? (sectionData as any[]).filter((item: any) => item.severity === 'high').length 
      : 0;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => handleSectionToggle(sectionKey)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getSectionIcon(sectionKey)}
              <Typography variant="h6">
                {getSectionTitle(sectionKey)}
              </Typography>
              {itemCount > 0 && (
                <Badge
                  badgeContent={itemCount}
                  color={highSeverityCount > 0 ? 'error' : 'warning'}
                  sx={{ ml: 1 }}
                >
                  <Box />
                </Badge>
              )}
            </Box>
            <IconButton size="small">
              {expandedSections[sectionKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections[sectionKey]}>
            <Box sx={{ mt: 2 }}>
              {itemCount === 0 ? (
                <Alert severity="success">
                  <AlertTitle>Подозрительной активности не обнаружено</AlertTitle>
                  Все показатели в норме за выбранный период.
                </Alert>
              ) : (
                renderContent()
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Ошибка загрузки данных</AlertTitle>
        Не удалось загрузить информацию о подозрительной активности.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок и настройки */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          🚨 Подозрительная активность
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              label="Период"
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <MenuItem value={1}>1 день</MenuItem>
              <MenuItem value={7}>7 дней</MenuItem>
              <MenuItem value={14}>14 дней</MenuItem>
              <MenuItem value={30}>30 дней</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Обновить данные">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Общая статистика */}
      {data && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Анализ за период</AlertTitle>
          {format(new Date(data.period.from), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(data.period.to), 'dd.MM.yyyy', { locale: ru })}
        </Alert>
      )}

      {/* Секции подозрительной активности */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {renderSection('frequent_failed_logins', renderFailedLogins)}
        </Grid>
        <Grid item xs={12}>
          {renderSection('multiple_ip_logins', renderMultipleIpLogins)}
        </Grid>
        <Grid item xs={12}>
          {renderSection('bulk_data_changes', renderBulkDataChanges)}
        </Grid>
        <Grid item xs={12}>
          {renderSection('suspicious_ips', renderSuspiciousIps)}
        </Grid>
        <Grid item xs={12}>
          {renderSection('off_hours_activity', renderOffHoursActivity)}
        </Grid>
        <Grid item xs={12}>
          {renderSection('unusual_access_patterns', renderUnusualAccessPatterns)}
        </Grid>
      </Grid>
    </Box>
  );
}; 