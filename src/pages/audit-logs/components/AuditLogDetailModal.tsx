import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetAuditLogDetailQuery } from '../../../api/auditLogs.api';

interface AuditLogDetailModalProps {
  open: boolean;
  logId: number | null;
  onClose: () => void;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  open,
  logId,
  onClose,
}) => {
  const {
    data: logData,
    isLoading,
    error,
  } = useGetAuditLogDetailQuery(logId || 0, {
    skip: !logId || !open,
  });

  const log = logData?.data;

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

  const getResourceIcon = (resourceType: string | null) => {
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

  const renderJsonData = (data: any, title: string) => {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }

    return (
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom color="primary">
            {title}
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.50',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              border: '1px solid',
              borderColor: 'grey.300',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <DescriptionIcon color="primary" />
            <Typography variant="h6">
              Детали аудит лога
            </Typography>
            {log && (
              <Chip
                label={`#${log.id}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
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
            Ошибка загрузки деталей лога: {error.toString()}
          </Alert>
        )}

        {log && (
          <Box>
            {/* Основная информация */}
            <Grid container spacing={3}>
              {/* Время */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <ScheduleIcon color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        Время события
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {format(new Date(log.created_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ru })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({log.created_at})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Пользователь */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PersonIcon color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        Пользователь
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {log.user_name ? log.user_name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {log.user_name || 'Система'}
                        </Typography>
                        {log.user_email && (
                          <Typography variant="body2" color="text.secondary">
                            {log.user_email}
                          </Typography>
                        )}
                        {log.user_id && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {log.user_id}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Действие */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Действие
                    </Typography>
                    <Chip
                      label={log.action_description}
                      color={getActionColor(log.action)}
                      size="medium"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Код: {log.action}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Ресурс */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Ресурс
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span style={{ fontSize: '1.5em' }}>
                        {getResourceIcon(log.resource_type)}
                      </span>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {log.resource_type || 'N/A'}
                          {log.resource_id && ` #${log.resource_id}`}
                        </Typography>
                        {log.resource_name && (
                          <Typography variant="body2" color="text.secondary">
                            {log.resource_name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Техническая информация */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <ComputerIcon color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        Техническая информация
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          IP адрес
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.ip_address || 'Не указан'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          User Agent
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {log.user_agent || 'Не указан'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Детальные данные */}
            <Typography variant="h6" gutterBottom>
              Детальные данные изменений
            </Typography>

            {renderJsonData(log.old_value, 'Старые значения')}
            {renderJsonData(log.new_value, 'Новые значения')}
            {renderJsonData(log.changes, 'Изменения')}
            {renderJsonData(log.additional_data, 'Дополнительные данные')}

            {/* Сообщение если нет детальных данных */}
            {!log.old_value && !log.new_value && !log.changes && !log.additional_data && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Детальные данные изменений отсутствуют для данного типа события.
              </Alert>
            )}
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