import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assessment as StatsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useGetAuditStatsQuery } from '../../../api/auditLogs.api';

interface AuditStatsModalProps {
  open: boolean;
  onClose: () => void;
}

const PERIOD_OPTIONS = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
  { value: 60, label: '60 дней' },
  { value: 90, label: '90 дней' },
];

export const AuditStatsModal: React.FC<AuditStatsModalProps> = ({
  open,
  onClose,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const {
    data: statsData,
    isLoading,
    error,
  } = useGetAuditStatsQuery({ days: selectedPeriod }, {
    skip: !open,
  });

  const stats = statsData?.data;

  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (action) {
      case 'created': return 'success';
      case 'updated': return 'info';
      case 'deleted': return 'error';
      case 'suspended': return 'warning';
      case 'unsuspended': return 'success';
      case 'assigned': return 'primary';
      case 'unassigned': return 'secondary';
      case 'login': return 'success';
      case 'logout': return 'default';
      default: return 'default';
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'created': 'Создание',
      'updated': 'Обновление',
      'deleted': 'Удаление',
      'suspended': 'Блокировка',
      'unsuspended': 'Разблокировка',
      'assigned': 'Назначение',
      'unassigned': 'Отзыв назначения',
      'login': 'Вход в систему',
      'logout': 'Выход из системы',
    };
    return labels[action] || action;
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'User': return '👤';
      case 'Booking': return '📅';
      case 'ServicePoint': return '🏪';
      case 'Operator': return '👨‍💼';
      case 'Partner': return '🤝';
      case 'Client': return '👥';
      case 'Review': return '⭐';
      default: return '📄';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <StatsIcon color="primary" />
            <Typography variant="h6">
              Статистика аудита системы
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Период</InputLabel>
              <Select
                value={selectedPeriod}
                label="Период"
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">
            Ошибка загрузки статистики: {error.toString()}
          </Alert>
        )}

        {stats && (
          <Box>
            {/* Общая статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.total_logs.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Всего записей
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      За {selectedPeriod} дней
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {stats.top_users.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Активных пользователей
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {Object.keys(stats.actions).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Типов действий
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {stats.resources.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Типов ресурсов
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* Статистика по действиям */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TrendingUpIcon color="primary" />
                      <Typography variant="h6">
                        Действия по типам
                      </Typography>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Действие</TableCell>
                            <TableCell align="right">Количество</TableCell>
                            <TableCell align="right">%</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(stats.actions)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([action, count]) => {
                              const percentage = ((count / stats.total_logs) * 100).toFixed(1);
                              return (
                                <TableRow key={action}>
                                  <TableCell>
                                    <Chip
                                      label={getActionLabel(action)}
                                      color={getActionColor(action)}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight="medium">
                                      {count.toLocaleString()}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Number(percentage)}
                                        sx={{ width: 50, height: 4 }}
                                      />
                                      <Typography variant="caption">
                                        {percentage}%
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Топ пользователей */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h6">
                        Топ пользователей
                      </Typography>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Пользователь</TableCell>
                            <TableCell align="right">Действий</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.top_users.slice(0, 10).map((user, index) => (
                            <TableRow key={user.email}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {index + 1}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {user.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                  {user.actions_count.toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Ресурсы */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Изменения по ресурсам
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ресурс</TableCell>
                            <TableCell align="right">Изменений</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.resources.slice(0, 10).map((resource) => (
                            <TableRow key={resource.resource_type}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <span style={{ fontSize: '1.2em' }}>
                                    {getResourceIcon(resource.resource_type)}
                                  </span>
                                  <Typography variant="body2">
                                    {resource.resource_type}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                  {resource.changes_count.toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Топ IP адресов */}
              {stats.top_ips.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Топ IP адресов
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>IP адрес</TableCell>
                              <TableCell align="right">Запросов</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.top_ips.slice(0, 10).map((ip) => (
                              <TableRow key={ip.ip_address}>
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {ip.ip_address}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    {ip.requests_count.toLocaleString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Активность по дням */}
              {stats.daily_activity.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <ScheduleIcon color="primary" />
                        <Typography variant="h6">
                          Активность по дням
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {stats.daily_activity.slice(-14).map((day) => {
                          const maxActivity = Math.max(...stats.daily_activity.map(d => d.count));
                          const height = maxActivity > 0 ? (day.count / maxActivity) * 50 + 10 : 10;
                          return (
                            <Box
                              key={day.date}
                              sx={{
                                width: 20,
                                height: height,
                                backgroundColor: day.count > 0 ? 'primary.main' : 'grey.300',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'end',
                                justifyContent: 'center',
                                opacity: day.count > 0 ? 0.8 : 0.3,
                              }}
                              title={`${day.date}: ${day.count} событий`}
                            />
                          );
                        })}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Последние 14 дней
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 