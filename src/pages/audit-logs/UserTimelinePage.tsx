import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
// Timeline components заменены на стандартные MUI компоненты
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetUserTimelineQuery } from '../../api/auditLogs.api';
import { getTablePageStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';

const UserTimelinePage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const [period, setPeriod] = useState(30);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useGetUserTimelineQuery({
    userId: Number(userId),
    days: period,
  });

  const handleDateToggle = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'вход в систему':
      case 'login':
        return <LoginIcon />;
      case 'выход из системы':
      case 'logout':
        return <LogoutIcon />;
      case 'создание':
      case 'created':
        return <AddIcon />;
      case 'обновление':
      case 'updated':
        return <EditIcon />;
      case 'удаление':
      case 'deleted':
        return <DeleteIcon />;
      case 'блокировка':
      case 'suspended':
        return <SecurityIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (action.toLowerCase()) {
      case 'вход в систему':
      case 'login':
        return 'success';
      case 'выход из системы':
      case 'logout':
        return 'default';
      case 'создание':
      case 'created':
        return 'success';
      case 'обновление':
      case 'updated':
        return 'info';
      case 'удаление':
      case 'deleted':
        return 'error';
      case 'блокировка':
      case 'suspended':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderEventDetails = (event: any) => {
    if (!event.details?.changes) return null;

    return (
      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Изменения:
        </Typography>
        <pre style={{ fontSize: '12px', margin: '4px 0', wordWrap: 'break-word' }}>
          {JSON.stringify(event.details.changes, null, 2)}
        </pre>
      </Box>
    );
  };

  const renderTimelineForDate = (date: string, events: any[]) => {
    const isExpanded = expandedDates[date];

    return (
      <Accordion
        key={date}
        expanded={isExpanded}
        onChange={() => handleDateToggle(date)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              {format(new Date(date), 'dd MMMM yyyy, EEEE', { locale: ru })}
            </Typography>
            <Chip
              label={`${events.length} событий`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
                     <Box sx={{ position: 'relative' }}>
             {events.map((event, index) => (
               <Box key={event.id} sx={{ display: 'flex', mb: 3 }}>
                 {/* Время и IP */}
                 <Box sx={{ minWidth: 120, mr: 2, textAlign: 'right' }}>
                   <Typography variant="body2" color="text.secondary">
                     {event.time}
                   </Typography>
                   {event.ip_address && (
                     <Typography variant="caption" color="text.secondary">
                       IP: {event.ip_address}
                     </Typography>
                   )}
                 </Box>
                 
                 {/* Иконка действия */}
                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                   <Avatar 
                     sx={{ 
                       width: 32, 
                       height: 32,
                       bgcolor: `${getActionColor(event.action)}.main`,
                       color: 'white'
                     }}
                   >
                     {getActionIcon(event.action)}
                   </Avatar>
                   {index < events.length - 1 && (
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
                     <Typography variant="h6" component="span">
                       {event.action}
                     </Typography>
                     
                     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                       {event.resource}
                     </Typography>
                     
                     {event.details?.resource_type && (
                       <Chip
                         label={event.details.resource_type}
                         size="small"
                         variant="outlined"
                         sx={{ mt: 1 }}
                       />
                     )}
                     
                     {renderEventDetails(event)}
                   </Paper>
                 </Box>
               </Box>
             ))}
           </Box>
        </AccordionDetails>
      </Accordion>
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
          Не удалось загрузить временную шкалу пользователя.
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="warning">
          <AlertTitle>Данные не найдены</AlertTitle>
          Временная шкала для данного пользователя не найдена.
        </Alert>
      </Box>
    );
  }

  const timelineDates = Object.keys(data.timeline).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/audit-logs')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Временная шкала пользователя
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              label="Период"
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <MenuItem value={7}>7 дней</MenuItem>
              <MenuItem value={14}>14 дней</MenuItem>
              <MenuItem value={30}>30 дней</MenuItem>
              <MenuItem value={90}>90 дней</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Обновить данные">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Информация о пользователе */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{data.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {data.user.email} • {data.user.role}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {data.total_events}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего событий
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {timelineDates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Активных дней
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {period}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Дней анализа
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Период анализа */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Период анализа</AlertTitle>
        {format(new Date(data.period.from), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(data.period.to), 'dd.MM.yyyy', { locale: ru })}
      </Alert>

      {/* Временная шкала */}
      {timelineDates.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Нет активности</AlertTitle>
          За выбранный период активности пользователя не зафиксировано.
        </Alert>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              📅 Хронология событий
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const allExpanded = timelineDates.every(date => expandedDates[date]);
                const newState = timelineDates.reduce((acc, date) => {
                  acc[date] = !allExpanded;
                  return acc;
                }, {} as Record<string, boolean>);
                setExpandedDates(newState);
              }}
            >
              {timelineDates.every(date => expandedDates[date]) ? 'Свернуть все' : 'Развернуть все'}
            </Button>
          </Box>

          {timelineDates.map(date => renderTimelineForDate(date, data.timeline[date]))}
        </Box>
      )}
    </Box>
  );
};

export default UserTimelinePage; 