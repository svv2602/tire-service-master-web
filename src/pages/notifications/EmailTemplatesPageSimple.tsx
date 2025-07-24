import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
  NotificationsActive as PushIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Импорты API
import {
  useGetEmailTemplatesQuery,
  useDeleteEmailTemplateMutation,
  useGetTemplateTypesQuery,
  type EmailTemplate,
  type EmailTemplateFilters,
} from '../../api/emailTemplates.api';

const EmailTemplatesPageSimple: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // API хуки
  const filters: EmailTemplateFilters = useMemo(() => ({
    search: searchQuery || undefined,
    template_type: selectedType !== 'all' ? selectedType : undefined,
    language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
    channel_type: selectedChannel !== 'all' ? selectedChannel as 'email' | 'telegram' | 'push' : undefined,
    page: page + 1,
    per_page: 20,
  }), [searchQuery, selectedType, selectedLanguage, selectedChannel, page]);

  const { data: templatesData, error, isLoading } = useGetEmailTemplatesQuery(filters);
  const { data: templateTypesData } = useGetTemplateTypesQuery();
  const [deleteTemplateMutation] = useDeleteEmailTemplateMutation();

  // Данные для отображения
  const templates = templatesData?.data || [];
  const totalCount = templatesData?.pagination?.total_count || 0;
  const templateTypes = templateTypesData?.data || [];
  const stats = templatesData?.stats || {};
  
  // Статические данные для каналов (fallback если API не возвращает)
  const availableChannels = templatesData?.available_channels || {
    'email': 'Email',
    'telegram': 'Telegram', 
    'push': 'Push уведомления'
  };

  // Helper функции для каналов
  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'email': return <EmailIcon />;
      case 'telegram': return <TelegramIcon />;
      case 'push': return <PushIcon />;
      default: return <EmailIcon />;
    }
  };

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case 'email': return 'primary';
      case 'telegram': return 'info';
      case 'push': return 'success';
      default: return 'default';
    }
  };

  const getChannelName = (channelType: string) => {
    switch (channelType) {
      case 'email': return 'Email';
      case 'telegram': return 'Telegram';
      case 'push': return 'Push';
      default: return 'Email';
    }
  };

  // Обработчики
  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      try {
        await deleteTemplateMutation(id).unwrap();
        setNotification({
          open: true,
          message: 'Шаблон успешно удален',
          severity: 'success'
        });
      } catch (error) {
        setNotification({
          open: true,
          message: 'Ошибка при удалении шаблона',
          severity: 'error'
        });
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/notifications/templates/${id}/edit`);
  };

  const handlePreview = (id: number) => {
    navigate(`/admin/notifications/templates/${id}/preview`);
  };

  // Обработка состояний загрузки и ошибок
  if (error) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка при загрузке шаблонов. Пожалуйста, попробуйте позже.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Шаблоны уведомлений
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Управление шаблонами уведомлений для всех каналов: Email, Telegram, Push
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/notifications/templates/new')}
        >
          Создать шаблон
        </Button>
      </Box>

      {/* Статистика по каналам */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h4">{(stats as any)?.by_channel?.email || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Email шаблонов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TelegramIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
              <Typography variant="h4">{(stats as any)?.by_channel?.telegram || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Telegram шаблонов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PushIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h4">{(stats as any)?.by_channel?.push || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Push шаблонов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                {(stats as any)?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Всего шаблонов</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Поиск по названию, теме или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Канал</InputLabel>
                <Select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  label="Канал"
                >
                  <MenuItem value="all">Все каналы</MenuItem>
                  {Object.entries(availableChannels).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {String(value)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Тип шаблона</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Тип шаблона"
                >
                  <MenuItem value="all">Все типы</MenuItem>
                  {templateTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Язык</InputLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  label="Язык"
                >
                  <MenuItem value="all">Все языки</MenuItem>
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="uk">Українська</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedChannel('all');
                  setSelectedType('all');
                  setSelectedLanguage('all');
                  setPage(0);
                }}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Загрузка */}
      {isLoading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Список шаблонов */}
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="h3">
                        {template.name}
                      </Typography>
                      {getChannelIcon(template.channel_type)}
                    </Box>
                    {template.subject && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Тема: {template.subject}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Предварительный просмотр">
                      <IconButton size="small" onClick={() => handlePreview(template.id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => handleEdit(template.id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" onClick={() => handleDelete(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip 
                    label={getChannelName(template.channel_type)} 
                    size="small" 
                    color={getChannelColor(template.channel_type) as any}
                    variant="filled"
                    icon={getChannelIcon(template.channel_type)}
                  />
                  <Chip 
                    label={template.template_type_name} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={template.language === 'ru' ? 'Русский' : 'Українська'} 
                    size="small" 
                    variant="outlined"
                    icon={<LanguageIcon />}
                  />
                  <Chip 
                    label={template.status_text}
                    size="small" 
                    color={template.is_active ? 'success' : 'default'} 
                    variant={template.is_active ? 'filled' : 'outlined'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Создан: {new Date(template.created_at).toLocaleDateString('ru-RU')}
                  {template.variables_array && template.variables_array.length > 0 && (
                    <> • Переменных: {template.variables_array.length}</>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Пустое состояние */}
      {!isLoading && templates.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Шаблоны не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Попробуйте изменить фильтры или создать новый шаблон
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/notifications/templates/new')}
          >
            Создать первый шаблон
          </Button>
        </Box>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default EmailTemplatesPageSimple; 