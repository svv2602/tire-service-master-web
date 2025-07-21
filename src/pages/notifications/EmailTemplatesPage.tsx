import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Language as LanguageIcon,
  Send as SendIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig, 
  Column, 
  ActionConfig 
} from '../../components/common/PageTable';
import { Button, TextField } from '../../components/ui';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Временные типы (в будущем перенести в types/)
interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'booking_confirmation' | 'booking_reminder' | 'password_reset' | 'welcome';
  language: 'ru' | 'uk';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmailTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Моковые данные (в будущем заменить на API)
  const mockTemplates: EmailTemplate[] = [
    {
      id: 1,
      name: 'Подтверждение бронирования',
      subject: 'Ваше бронирование подтверждено',
      body: '<h1>Спасибо за бронирование!</h1><p>Ваша запись подтверждена на {{date}} в {{time}}.</p>',
      type: 'booking_confirmation',
      language: 'ru',
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Підтвердження бронювання',
      subject: 'Ваше бронювання підтверджено',
      body: '<h1>Дякуємо за бронювання!</h1><p>Ваш запис підтверджено на {{date}} о {{time}}.</p>',
      type: 'booking_confirmation',
      language: 'uk',
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    },
    {
      id: 3,
      name: 'Напоминание о записи',
      subject: 'Напоминание: завтра ваша запись',
      body: '<h1>Не забудьте!</h1><p>Завтра {{date}} в {{time}} у вас запись в {{service_point}}.</p>',
      type: 'booking_reminder',
      language: 'ru',
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    }
  ];

  // Фильтрация данных
  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || template.type === selectedType;
      const matchesLanguage = selectedLanguage === 'all' || template.language === selectedLanguage;
      
      return matchesSearch && matchesType && matchesLanguage;
    });
  }, [mockTemplates, searchQuery, selectedType, selectedLanguage]);

  // Обработчики
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleTypeFilterChange = useCallback((type: string) => {
    setSelectedType(type);
    setPage(0);
  }, []);

  const handleLanguageFilterChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePreview = useCallback((template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const handleEdit = useCallback((template: EmailTemplate) => {
    // В будущем: navigate(`/admin/notifications/email-templates/${template.id}/edit`);
    setNotification({
      open: true,
      message: `Редактирование шаблона "${template.name}" (в разработке)`,
      severity: 'info'
    });
  }, []);

  const handleDelete = useCallback(async (template: EmailTemplate) => {
    // В будущем: API вызов для удаления
    setNotification({
      open: true,
      message: `Шаблон "${template.name}" удален (демо)`,
      severity: 'success'
    });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Конфигурация PageTable
  const headerConfig: PageHeaderConfig = useMemo(() => ({
    title: 'Email шаблоны',
    subtitle: 'Управление шаблонами email уведомлений',
    actions: [
      {
        id: 'add',
        label: 'Создать шаблон',
        icon: <AddIcon />,
        onClick: () => setNotification({
          open: true,
          message: 'Создание шаблона (в разработке)',
          severity: 'info'
        }),
        variant: 'contained'
      }
    ]
  }), []);

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Поиск по названию или теме...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'type',
      type: 'select',
      label: 'Тип шаблона',
      value: selectedType,
      onChange: handleTypeFilterChange,
      options: [
        { value: 'all', label: 'Все типы' },
        { value: 'booking_confirmation', label: 'Подтверждение бронирования' },
        { value: 'booking_reminder', label: 'Напоминание' },
        { value: 'password_reset', label: 'Сброс пароля' },
        { value: 'welcome', label: 'Приветствие' }
      ]
    },
    {
      id: 'language',
      type: 'select',
      label: 'Язык',
      value: selectedLanguage,
      onChange: handleLanguageFilterChange,
      options: [
        { value: 'all', label: 'Все языки' },
        { value: 'ru', label: 'Русский' },
        { value: 'uk', label: 'Українська' }
      ]
    }
  ], [selectedType, selectedLanguage, handleTypeFilterChange, handleLanguageFilterChange]);

  const columns: Column<EmailTemplate>[] = useMemo(() => [
    {
      id: 'name',
      key: 'name',
      label: 'Название',
      sortable: true,
      render: (template) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {template.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {template.subject}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'type',
      key: 'type',
      label: 'Тип',
      sortable: true,
      render: (template) => {
        const typeLabels = {
          booking_confirmation: 'Подтверждение',
          booking_reminder: 'Напоминание',
          password_reset: 'Сброс пароля',
          welcome: 'Приветствие'
        };
        return (
          <Chip
            label={typeLabels[template.type]}
            size="small"
            variant="outlined"
            color="primary"
          />
        );
      }
    },
    {
      id: 'language',
      key: 'language',
      label: 'Язык',
      sortable: true,
      render: (template) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LanguageIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Chip
            label={template.language === 'ru' ? 'RU' : 'UK'}
            size="small"
            color={template.language === 'ru' ? 'primary' : 'secondary'}
          />
        </Box>
      )
    },
    {
      id: 'is_active',
      key: 'is_active',
      label: 'Статус',
      sortable: true,
      render: (template) => (
        <Chip
          label={template.is_active ? 'Активен' : 'Неактивен'}
          size="small"
          color={template.is_active ? 'success' : 'error'}
          variant={template.is_active ? 'filled' : 'outlined'}
        />
      )
    },
    {
      id: 'updated_at',
      key: 'updated_at',
      label: 'Обновлен',
      sortable: true,
      render: (template) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {new Date(template.updated_at).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>
      )
    }
  ], [theme]);

  const actionsConfig: ActionConfig<EmailTemplate>[] = useMemo(() => [
    {
      id: 'preview',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: handlePreview
    },
    {
      id: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: handleEdit
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
      requireConfirmation: true,
      confirmationConfig: {
        title: 'Подтверждение удаления',
        message: 'Вы уверены, что хотите удалить этот шаблон?',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена'
      }
    }
  ], [handlePreview, handleEdit, handleDelete]);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<EmailTemplate>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={filteredTemplates}
        actions={actionsConfig}
        loading={false}
        pagination={{
          page,
          totalItems: filteredTemplates.length,
          rowsPerPage: 25,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedType !== 'all' || selectedLanguage !== 'all' 
            ? 'Шаблоны не найдены' 
            : 'Нет email шаблонов',
          description: searchQuery || selectedType !== 'all' || selectedLanguage !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первый email шаблон для начала работы',
          action: (!searchQuery && selectedType === 'all' && selectedLanguage === 'all') ? {
            label: 'Создать шаблон',
            icon: <AddIcon />,
            onClick: () => setNotification({
              open: true,
              message: 'Создание шаблона (в разработке)',
              severity: 'info'
            })
          } : undefined
        }}
      />

      {/* Диалог предварительного просмотра */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            Предварительный просмотр шаблона
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Название"
                value={selectedTemplate.name}
                disabled
                fullWidth
              />
              <TextField
                label="Тема письма"
                value={selectedTemplate.subject}
                disabled
                fullWidth
              />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Содержимое (HTML):
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Закрыть
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => {
              setNotification({
                open: true,
                message: 'Отправка тестового письма (в разработке)',
                severity: 'info'
              });
              setPreviewOpen(false);
            }}
          >
            Тестовая отправка
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default EmailTemplatesPage; 