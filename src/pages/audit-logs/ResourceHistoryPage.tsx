import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetResourceHistoryQuery } from '../../api/auditLogs.api';
import { getTablePageStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';

const ResourceHistoryPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const navigate = useNavigate();
  const { resourceType, resourceId } = useParams<{ resourceType: string; resourceId: string }>();
  
  const [expandedChanges, setExpandedChanges] = useState<Record<number, boolean>>({});

  const { data, isLoading, error, refetch } = useGetResourceHistoryQuery({
    resourceType: resourceType!,
    resourceId: resourceId!,
  });

  const handleChangeToggle = (logId: number) => {
    setExpandedChanges(prev => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'создание':
      case 'created':
        return <AddIcon />;
      case 'обновление':
      case 'updated':
        return <EditIcon />;
      case 'удаление':
      case 'deleted':
        return <DeleteIcon />;
      case 'просмотр':
      case 'viewed':
        return <VisibilityIcon />;
      case 'блокировка':
      case 'suspended':
        return <SecurityIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (action.toLowerCase()) {
      case 'создание':
      case 'created':
        return 'success';
      case 'обновление':
      case 'updated':
        return 'info';
      case 'удаление':
      case 'deleted':
        return 'error';
      case 'просмотр':
      case 'viewed':
        return 'default';
      case 'блокировка':
      case 'suspended':
        return 'warning';
      default:
        return 'default';
    }
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
      case 'Service': return '🔧';
      case 'Car': return '🚗';
      default: return '📄';
    }
  };

  const renderChangesDetails = (log: any) => {
    if (!log.changes) return null;

    const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
    
    return (
      <Accordion
        expanded={expandedChanges[log.id]}
        onChange={() => handleChangeToggle(log.id)}
        sx={{ mt: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" color="text.secondary">
            Детали изменений
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <pre style={{ 
              fontSize: '12px', 
              margin: 0, 
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(changes, null, 2)}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderUserInfo = (log: any) => {
    if (!log.user_name && !log.user_email) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            S
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            Система
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
          {log.user_name ? log.user_name.charAt(0).toUpperCase() : '?'}
        </Avatar>
        <Box>
          <Typography variant="caption" fontWeight="medium">
            {log.user_name || 'Неизвестно'}
          </Typography>
          {log.user_email && (
            <Typography variant="caption" color="text.secondary" display="block">
              {log.user_email}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          <AlertTitle>Ошибка загрузки данных</AlertTitle>
          Не удалось загрузить историю изменений ресурса.
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="warning">
          <AlertTitle>Данные не найдены</AlertTitle>
          История изменений для данного ресурса не найдена.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/audit-logs')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            История изменений ресурса
          </Typography>
        </Box>

        <Tooltip title="Обновить данные">
          <IconButton onClick={() => refetch()}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Информация о ресурсе */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ fontSize: '2rem' }}>
              {getResourceIcon(data.resource.type)}
            </Box>
            <Box>
              <Typography variant="h6">
                {data.resource.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.resource.type} #{data.resource.id}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Chip
                label={data.resource.exists ? 'Существует' : 'Удален'}
                color={data.resource.exists ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </Box>

          {data.resource.status && (
            <Typography variant="body2" color="text.secondary">
              Статус: {data.resource.status}
            </Typography>
          )}

          {data.resource.error && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {data.resource.error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {data.total_changes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего изменений
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {data.history.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Записей в истории
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* История изменений */}
      {data.history.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Нет истории изменений</AlertTitle>
          Для данного ресурса история изменений отсутствует.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6">
                Хронология изменений
              </Typography>
            </Box>

            <Box sx={{ position: 'relative' }}>
              {data.history.map((log, index) => (
                <Box key={log.id} sx={{ display: 'flex', mb: 3 }}>
                  {/* Время и IP */}
                  <Box sx={{ minWidth: 120, mr: 2, textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(log.created_at), 'dd.MM.yyyy', { locale: ru })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(log.created_at), 'HH:mm:ss', { locale: ru })}
                    </Typography>
                    {log.ip_address && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        IP: {log.ip_address}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Иконка действия */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: `${getActionColor(log.action)}.main`,
                        color: 'white'
                      }}
                    >
                      {getActionIcon(log.action)}
                    </Avatar>
                    {index < data.history.length - 1 && (
                      <Box 
                        sx={{ 
                          width: 2, 
                          height: 40, 
                          bgcolor: 'grey.300', 
                          mt: 1 
                        }} 
                      />
                    )}
                  </Box>
                  
                  {/* Контент события */}
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="span">
                          {log.action_description}
                        </Typography>
                        <Chip
                          label={log.action}
                          color={getActionColor(log.action)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {renderUserInfo(log)}

                      {log.user_agent && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          User Agent: {log.user_agent}
                        </Typography>
                      )}

                      {log.additional_data && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Дополнительные данные:
                          </Typography>
                          <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1, mt: 0.5 }}>
                            <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word' }}>
                              {JSON.stringify(log.additional_data, null, 2)}
                            </pre>
                          </Box>
                        </Box>
                      )}

                      {renderChangesDetails(log)}
                    </Paper>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResourceHistoryPage; 