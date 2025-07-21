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
    page: page + 1,
    per_page: 20,
  }), [searchQuery, selectedType, selectedLanguage, page]);

  const { data: templatesData, error, isLoading } = useGetEmailTemplatesQuery(filters);
  const { data: templateTypesData } = useGetTemplateTypesQuery();
  const [deleteTemplateMutation] = useDeleteEmailTemplateMutation();

  // Данные для отображения
  const templates = templatesData?.data || [];
  const totalCount = templatesData?.pagination?.total_count || 0;
  const templateTypes = templateTypesData?.data || [];

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
    navigate(`/admin/notifications/email-templates/${id}/edit`);
  };

  const handlePreview = (id: number) => {
    navigate(`/admin/notifications/email-templates/${id}/preview`);
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
          Email шаблоны
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Управление шаблонами email уведомлений
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/notifications/email-templates/new')}
        >
          Создать шаблон
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск по названию, теме или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
                <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.subject}
                    </Typography>
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
            onClick={() => navigate('/admin/notifications/email-templates/new')}
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